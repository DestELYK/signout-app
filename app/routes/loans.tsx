import {
  Button,
  Card,
  Center,
  Container,
  Flex,
  Group,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  MetaFunction,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "@remix-run/react";
import dayjs from "dayjs";
import { redirect, typedjson, useTypedLoaderData } from "remix-typedjson";
import ListView from "~/components/ListView";
import { LoanListView } from "~/components/loans/LoanListView";
import { prisma } from "~/lib/prisma.server";
import {
  ItemFindMany,
  PersonFindOne,
  loanFindMany,
  loanFindOne,
} from "~/utils/types.server";

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
        {
          id: "asc",
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

        return typedjson({ loan: result, error: undefined });
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

export default function Page() {
  const params = useParams();
  const mediaMatch = useMediaQuery("(min-width: 62em)");
  const path = useLocation();

  const loanId = params.loanId?.length !== 0 ? params.loanId : undefined;

  const isNestedRoute = path.pathname.replace("/loans", "") !== "";

  const navigate = useNavigate();

  const data = useTypedLoaderData<typeof loader>();

  const sortedLoans = data.loans.sort((a, b) => {
    let value = 0;
    if (a.id !== b.id) {
      const aReturned = a.items.find((i) => i.dateReturned);
      const bReturned = b.items.find((i) => i.dateReturned);

      if (aReturned && bReturned) {
        value = dayjs(bReturned.dateReturned).diff(aReturned.dateReturned);
      } else if (aReturned && !bReturned) {
        value = 1;
      } else if (!aReturned && bReturned) {
        value = -1;
      } else if (!aReturned && !bReturned) {
        const aLongTerm =
          a.tags.find((t) => t.name === "Long-Term") != undefined;
        const bLongTerm =
          b.tags.find((t) => t.name === "Long-Term") !== undefined;

        if ((aLongTerm && bLongTerm) || (!aLongTerm && !bLongTerm)) {
          value = dayjs(b.createdDate).diff(a.createdDate);
        } else if (aLongTerm && !bLongTerm) {
          value = 1;
        } else if (!aLongTerm && bLongTerm) {
          value = -1;
        }
      }
    }

    return value;
  });

  const loanList = (
    <ListView
      title="Loans"
      items={sortedLoans}
      itemsPerPage={15}
      bottomSection={
        <Group grow>
          <Button component={Link} to={"/loans/signout"}>
            Sign-Out Items
          </Button>
          <Button component={Link} to="/loans/signin">
            Sign-In Items
          </Button>
        </Group>
      }
    >
      {(item) => (
        <LoanListView
          key={item.id}
          active={loanId === item.id.toString()}
          loan={item}
          onClick={() => {
            navigate(`/loans/${item.id}`);
          }}
        />
      )}
    </ListView>
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
