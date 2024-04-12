import {
  Card,
  Center,
  Container,
  Flex,
  Group,
  Loader,
  Pagination,
  ScrollArea,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  MetaFunction,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from "@remix-run/react";
import { Suspense, useState } from "react";
import { redirect, typedjson, useTypedLoaderData } from "remix-typedjson";
import { LoanItemView } from "~/components/loans/LoanItemView";
import { prisma } from "~/lib/prisma.server";
import {
  ItemFindMany,
  PersonFindOne,
  loanFindMany,
  loanFindOne,
} from "~/utils/types.server";
import { LoanListView } from "../components/loans/LoanListView";

export const meta: MetaFunction = () => {
  return [{ title: "Loans" }];
};

// TODO - implement importing and exporting data
// TODO - allow filtering the list
// TODO - hide pagination if all loans are displayed on one page
// TODO - create a base component for displaying list of items (for use with items and people)

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  if (url.pathname.endsWith("/")) {
    return redirect("/loans");
  }

  const itemIds = url.searchParams.getAll("itemId");
  const personId = url.searchParams.get("personId");
  const outstanding = url.searchParams.has("outstanding");

  let filter: Prisma.LoanWhereInput = {};

  try {
    filter = {
      ...(itemIds &&
        itemIds.length > 0 && {
          items: {
            some: {
              OR: itemIds.map((itemId) => {
                return {
                  itemId: parseInt(itemId),
                };
              }),
            },
          },
        }),
      ...(personId && { personId: parseInt(personId) }),
      ...(outstanding && { items: { some: { dateReturned: null } } }),
    };
  } catch (e) {
    console.error("Failed to create filter", e);
  }

  return typedjson({
    count: await prisma.loan.count({
      where: filter,
    }),
    loans: await prisma.loan.findMany({
      select: loanFindMany.select,
      where: filter,
      orderBy: [
        {
          createdDate: "desc",
        },
      ],
    }),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData: {
    person?: PersonFindOne;
    items?: ItemFindMany[];
    loanId: number;
    itemIds: number[];
  } = await request.json();

  try {
    let result: { id: number } = { id: -1 };
    switch (request.method) {
      case "POST":
        if (!formData.person) {
          throw Error("No person selected");
        }

        const person = formData.person!;

        if (!formData.items || formData.items.length == 0) {
          throw Error("Loan requires at least one item");
        }

        const items = formData.items!;

        const outstandingItems = await prisma.loanedItem.findMany({
          where: {
            AND: [
              {
                OR: items.map((i) => {
                  return {
                    itemId: i.id,
                  };
                }),
              },
              {
                dateReturned: null,
              },
            ],
          },
        });

        if (outstandingItems.length > 0) {
          throw Error("One of the items is currently outstanding!");
        }

        result = await prisma.loan.create({
          data: {
            person: {
              connect: {
                id: person.id,
              },
            },
            items: {
              create: items.map((item) => ({
                item: {
                  connect: {
                    id: item.id,
                  },
                },
              })),
            },
          },
          include: loanFindOne.include,
        });

        console.debug("Created new loan: %s", result);

        return typedjson({loan: result, error: undefined});
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    console.error(`Failed to ${request.method} a loan`, e);

    let message = "Unknown Error";
    if (e instanceof Error) message = e.message;

    return typedjson({ error: message, loan: undefined });
  }
}

const ITEMS_PER_PAGE = 15;

export default function Page() {
  const params = useParams();
  const mediaMatch = useMediaQuery("(min-width: 62em)");
  const path = useLocation();

  const loanId = params.loanId?.length !== 0 ? params.loanId : undefined;

  const isNestedRoute = path.pathname.replace("/loans", "") !== "";

  const navigate = useNavigate();
  const searchParams = useSearchParams({ outstanding: "" });

  const data = useTypedLoaderData<typeof loader>();

  const [activePage, setPage] = useState(1);

  const filteredLoans = [
    ...data.loans.sort((a, b) => {
      if (a.items.find((i) => !i.dateReturned)) {
        if (b.items.find((i) => !i.dateReturned))
          return b.createdDate.getTime() - a.createdDate.getTime();
        else return -1000;
      } else {
        if (b.items.find((i) => !i.dateReturned)) return 1000;
        else return b.createdDate.getTime() - a.createdDate.getTime();
      }
    }),
  ].slice(
    (activePage - 1) * ITEMS_PER_PAGE,
    (activePage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  // const outstandingLoans = loans.filter((loan) => loan._count.items > 0);

  const loanList = (
    <LoanListView {...(loanId && { activeId: loanId })}>
      <Suspense fallback={<Loader />}>
        {filteredLoans.length ? (
          <ScrollArea.Autosize
            mah="calc(100dvh - 10rem)"
            type="auto"
            scrollbars="y"
          >
            {filteredLoans.map((loan) => (
              <LoanItemView
                key={loan.id}
                active={loanId === loan.id.toString()}
                loan={loan}
                onClick={() => {
                  navigate(`/loans/${loan.id}`);
                }}
              />
            ))}
          </ScrollArea.Autosize>
        ) : (
          <div className="h-full w-full">No Outstanding Loans</div>
        )}
        {data.count > ITEMS_PER_PAGE && (
          <Pagination.Root
            w="100%"
            mt="md"
            px="sm"
            style={{ flexWrap: "nowrap" }}
            total={
              data
                ? data.count > ITEMS_PER_PAGE
                  ? data.count / ITEMS_PER_PAGE
                  : data.count
                : 0
            }
            value={activePage}
            onChange={setPage}
          >
            <Group gap={5} justify="center">
              <Pagination.Previous />
              <Pagination.Items />
              <Pagination.Next />
            </Group>
          </Pagination.Root>
        )}
      </Suspense>
    </LoanListView>
  );

  return (
    <Container p="sm" miw="100dvw" h="100dvh">
      {mediaMatch ? (
        <Flex direction="row" w="100%" h="100%" gap="lg">
          {loanList}
          {isNestedRoute ? (
            <Outlet />
          ) : (
            <Card w="100%" h="100%" withBorder>
              <Center w="100%" h="100%">
                <Title order={3}>Select item</Title>
              </Center>
            </Card>
          )}
        </Flex>
      ) : (
        <Flex h="100%" direction="column" gap="sm" align="stretch">
          {isNestedRoute ? <Outlet /> : loanList}
        </Flex>
      )}
    </Container>
  );
}
