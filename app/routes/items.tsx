import {
    Button,
    Card,
    Center,
    Container,
    Flex,
    Group,
    Modal,
    Title,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { Prisma } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLocation, useNavigate, useParams } from "@remix-run/react";
import dayjs from "dayjs";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import CreateItemForm from "~/components/items/CreateItemForm";
import ItemListView from "~/components/items/ItemListView";
import ListView from "~/components/ListView";
import { prisma } from "~/lib/prisma.server";
import { itemFindMany } from "~/utils/types.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const loanId = url.searchParams.get("loanId");
  const qrCode = url.searchParams.get("qrCode");
  const name = url.searchParams.get("name");
  const type = url.searchParams.get("type");
  const query = url.searchParams.get("query");

  let filter: Prisma.ItemWhereInput = {};

  try {
    filter = query
      ? {
          OR: [
            {
              name: {
                contains: query,
              },
            },
            {
              tags: {
                some: {
                  name: {
                    contains: query,
                  },
                },
              },
            },
          ],
          ...(loanId && {
            loans: {
              some: {
                loanId: parseInt(loanId),
              },
            },
          }),
        }
      : {
          ...(loanId && {
            loans: {
              some: {
                loanId: parseInt(loanId),
              },
            },
          }),
          ...(qrCode && { qrCode: qrCode }),
          ...(name && { name: name }),
          ...(type && { type: type }),
        };
  } catch (e) {
    console.error("Failed to create filter for /items", e);
  }

  const items = await prisma.item.findMany({
    select: itemFindMany.select,
    where: filter,
    orderBy: { name: "asc" },
  });

  return typedjson({ items: items });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.json();

  try {
    switch (request.method) {
      case "POST":
        const name = formData.name;

        if (!name) {
          throw new Error("Name must be provided");
        }

        const qrCode = formData.qrCode;

        const tags: { id: number }[] = formData.tags;

        if (tags.length < 1) {
          throw new Error("There must be at least 1 tag");
        }

        const item = await prisma.item.create({
          data: {
            name: name,
            ...(qrCode && { qrCode: qrCode }),
            tags: {
              connect: tags,
            },
          },
        });

        return typedjson({ item: item, error: undefined });
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    console.error(e);

    let errorMessage = "";
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      switch (e.code) {
        case "P2002":
          errorMessage =
            "An item with this name already exists, a new item cannot be created.";
          break;
        default:
          errorMessage =
            "Unknown database error occurred, a new item cannot be created.";
          break;
      }
    } else if (e instanceof Error) {
      errorMessage = e.message;
    }

    if (errorMessage) {
      return typedjson({ error: errorMessage, item: undefined });
    } else {
      throw new Response(null, {
        status: 500,
      });
    }
  }
}

export default function Page() {
  const params = useParams();
  const mediaMatch = useMediaQuery("(min-width: 62em)");
  const path = useLocation();

  const loanId = params.itemId?.length !== 0 ? params.itemId : undefined;

  const isNestedRoute = path.pathname.replace("/items", "") !== "";

  const navigate = useNavigate();

  const data = useTypedLoaderData<typeof loader>();

  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  const sortedLoans = data.items.sort((a, b) => {
    let value = 0;
    if (a.id !== b.id) {
      value = b._count.loans - a._count.loans;
    }

    return value;
  });

  const loanList = (
    <ListView
      title={"Items"}
      items={sortedLoans}
      itemsPerPage={15}
      bottomSection={
        <Group grow>
          <Button onClick={() => openCreate()}>New Item</Button>
        </Group>
      }
    >
      {(item) => {
        const latestLoan =
          item.loans.length > 0
            ? item.loans.sort((a, b) =>
                dayjs(a.dateLoaned).diff(b.dateLoaned)
              )[0]
            : undefined;

        return (
          <ItemListView
            key={item.id}
            active={loanId === item.id.toString()}
            onClick={() => {
              navigate(`/items/${item.id}`);
            }}
            id={item.id}
            name={item.name}
            description={item.description}
            tags={item.tags}
            loanCount={item.loans.length}
            lastPerson={latestLoan?.loan.person}
            lastSeen={latestLoan?.dateLoaned}
            isOut={item._count.loans > 0}
          />
        );
      }}
    </ListView>
  );

  return (
    <>
      <Modal
        opened={createOpened}
        onClose={closeCreate}
        centered
        title="Create Item"
      >
        <CreateItemForm
          onSubmitted={(item) => {
            navigate(`/items/${item.id}`);
            closeCreate();
          }}
        />
      </Modal>
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
    </>
  );
}
