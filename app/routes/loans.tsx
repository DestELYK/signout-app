import {
  Box,
  Card,
  Center,
  Container,
  Flex,
  ScrollArea,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Item, Person, Prisma } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  MetaFunction,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { LoanItemView } from "~/components/LoanItemView";
import { prisma } from "~/lib/prisma.server";
import { LoanListView } from "../components/LoanListView";

export const meta: MetaFunction = () => {
  return [{ title: "Loans" }];
};

const loanSelect: Prisma.LoanSelect = {
  id: true,
  person: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      nickname: true,
      role: true,
    },
  },
  createdDate: true,
  updatedDate: true,
  _count: {
    select: {
      items: {
        where: {
          dateReturned: null,
        },
      },
    },
  },
};

const loanFindMany = Prisma.validator<Prisma.LoanDefaultArgs>()({
  select: loanSelect,
});

export type LoanFindMany = Prisma.LoanGetPayload<typeof loanFindMany>;

export type LoanItemPayload = Prisma.LoanGetPayload<{
  select: typeof loanSelect;
}>;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const itemIds = url.searchParams.getAll("itemId");
  const personId = url.searchParams.get("personId");

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
    };
  } catch (e) {
    console.error("Failed to create filter", e);
  }

  return json(
    await prisma.loan.findMany({
      select: loanSelect,
      where: filter,
      orderBy: { updatedDate: "desc" },
    })
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData: {
    person?: Person;
    items?: Item[];
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

        if (!formData.items || formData.items.length == 0) {
          throw Error("Loan requires at least one item");
        }

        result = await prisma.loan.create({
          data: {
            person: {
              connectOrCreate: {
                where: {
                  id: formData.person.id,
                },
                create: {
                  firstName: formData.person.firstName,
                  lastName: formData.person.lastName,
                  nickname: formData.person.nickname,
                  role: formData.person.role,
                  qrCode: formData.person.qrCode,
                },
              },
            },
            items: {
              create: formData.items.map((item) => {
                return {
                  item: {
                    connectOrCreate: {
                      where: { id: item.id },
                      create: {
                        name: item.name,
                        type: item.type,
                        qrCode: item.qrCode,
                      },
                    },
                  },
                };
              }),
            },
          },
          include: {
            items: true,
            person: true,
          },
        });

        console.debug("Created new loan: %s", result);
        return redirect(`/loans/${result.id}`);
      case "PATCH":
        if (!formData.loanId) {
          throw Error("No loan supplied");
        }

        if (!formData.itemIds || formData.itemIds.length == 0) {
          throw Error("Loan requires at least one item");
        }

        const updateCount = await prisma.loan.update({
          where: { id: formData.loanId },
          data: {
            items: {
              updateMany: formData.itemIds.map((itemId) => {
                return {
                  where: { itemId: itemId },
                  data: {
                    dateReturned: new Date(),
                  },
                };
              }),
            },
          },
        });

        console.log("%i entries updated", updateCount);

        result.id = formData.loanId;

        return redirect(`/loans/${result.id}`);
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    return json({ error: e });
  }
}

export default function Page() {
  const params = useParams();
  const mediaMatch = useMediaQuery("(min-width: 62em)");
  const path = useLocation();

  const loanId = params.loanId;

  const isNestedRoute = path.pathname.replace("/loans", "") !== "";

  const navigate = useNavigate();
  const searchParams = useSearchParams({ outstanding: "" });

  const loans = useLoaderData<typeof loader>();

  const outstandingLoans = loans.filter((loan) => loan._count.items > 0);

  const loanList = (
    <LoanListView {...(loanId && { activeId: loanId })}>
      {outstandingLoans.length ? (
        <ScrollArea.Autosize
          mah="100%"
          type="auto"
          scrollbars="y"
          offsetScrollbars
        >
          {outstandingLoans.map((loan) => (
            <LoanItemView
              key={loan.id}
              isActive={loanId === loan.id.toString()}
              loan={{
                ...loan,
                createdDate: new Date(loan.createdDate),
                updatedDate: new Date(loan.updatedDate),
              }}
              onClick={() => {
                navigate(`/loans/${loan.id}`);
              }}
            />
          ))}
        </ScrollArea.Autosize>
      ) : (
        <div className="h-full w-full">No Outstanding Loans</div>
      )}
    </LoanListView>
  );

  return (
    <Container p="sm" miw="100dvw" h="100dvh">
      {mediaMatch ? (
        <Flex direction="row" w="100%" h="100%" gap="lg">
          <Box h="100%">{loanList}</Box>
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
