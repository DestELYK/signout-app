import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Collapse,
  Container,
  Flex,
  Group,
  Menu,
  ScrollArea,
  Stack,
  Text,
  Title,
  px,
  rem,
} from "@mantine/core";
import { useDisclosure, useHover, useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { Item, Person, Prisma } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Link,
  MetaFunction,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { IconDots, IconFilter } from "@tabler/icons-react";
import LoanForm from "~/components/LoanForm";
import { prisma } from "~/lib/prisma.server";
import { dateDiff, fullName } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [{ title: "Loans" }];
};

const loanInfo = {
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
} satisfies Prisma.LoanSelect;

type LoanItemPayload = Prisma.LoanGetPayload<{ select: typeof loanInfo }>;

export async function loader({ request }: LoaderFunctionArgs) {
  const loans = await prisma.loan.findMany({
    where: {
      items: {
        some: {
          dateReturned: null,
        },
      },
    },
    select: loanInfo,
    orderBy: {
      updatedDate: "desc",
    },
  });

  return json({ loans: loans });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData: {person?: Person, items?: Item[]} = await request.json();

  // TODO - server side validation

  try {
    if (!formData.person) {
      throw Error('No person selected');
    }

    if (!formData.items || formData.items.length == 0) {
      throw Error('Loan requires at least one item')
    }

    let result: {id: number} = {id: -1};
    switch (request.method) {
      case "POST":

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
                  qrCode: formData.person.qrCode
                }
              }
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
                        qrCode: item.qrCode
                      }
                    }
                  }
                }
              })
            }
          },
          include: {
            items: true,
            person: true,
          },
        });

        console.debug('Created new loan: %s', result)
        break;
    }

    return redirect(`/loans/${result.id}`)
  } catch (e) {
    return json({ error: e });
  }

  // TODO - create new loan

  return json(formData);
}

function LoanItemView({
  loan,
  isActive,
  onClick,
}: {
  loan: LoanItemPayload;
  isActive?: boolean | false;
  onClick: React.MouseEventHandler;
}) {
  const loanItemHeight = 100;

  return (
    <Card
      withBorder
      shadow="sm"
      radius="sm"
      p="lg"
      mih={rem(loanItemHeight)}
      w="100%"
      className="active"
      onClick={onClick}
      {...(loan._count.items > 0 && {
        style: {
          borderColor: "red",
          borderWidth: px(2),
        },
      })}
    >
      <Card.Section withBorder inheritPadding px="xs">
        <Flex
          direction="row"
          justify="flex-end"
          align="center"
          w="100%"
          gap="md"
        >
          <Title
            w="100%"
            order={5}
            fw="bold"
            lineClamp={1}
            style={{ justifySelf: "flex-start" }}
          >
            {/* @ts-ignore */}
            {fullName(loan.person)}
          </Title>

          <Badge
            color={loan.person.role === "Staff" ? "blue" : "green"}
            miw="max-content"
          >
            {loan.person.role}
          </Badge>
          <Menu withinPortal position="bottom-end" shadow="sm">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray">
                <IconDots
                  style={{
                    width: rem(16),
                    height: rem(16),
                  }}
                />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item>
                <Link to={`/loans/${loan.id}`}>View Loan</Link>
              </Menu.Item>
              <Menu.Item>Modify Loan</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Card.Section>

      <Stack mt="xs" gap={0}>
        <Text size="sm" ta="center">{`Out since ${new Date(
          loan.createdDate
        ).toDateString()} (${dateDiff(new Date(loan.createdDate))})`}</Text>
        <Text size="sm" ta="center">{`${loan._count.items} outstanding item${
          loan._count.items > 1 ? "s" : ""
        }`}</Text>
      </Stack>
    </Card>
  );
}

function LoanListView({ activeId }: { activeId?: string | undefined }) {
  const [newLoanOpened, { open: newLoanOpen, close: newLoanClose }] =
    useDisclosure(false);
  const [filterOpened, { toggle: toggleFilter }] = useDisclosure(false);
  const navigate = useNavigate();

  const { loans } = useLoaderData<typeof loader>();
  const { hovered, ref } = useHover();

  const openSignout = () => {
    modals.open({
      modalId: "sign-out-item",
      title: "Sign-Out Item",
      centered: true,
      children: <LoanForm />,
    });
  };

  return (
    <>
      <Card
        padding="sm"
        radius="sm"
        withBorder
        miw={{ base: "20rem", lg: "40rem" }}
        h="100%"
        shadow="sm"
      >
        <Card.Section withBorder inheritPadding p="xs" mb="sm">
          <Flex
            direction="row"
            justify="flex-end"
            align="center"
            w="100%"
            gap="md"
          >
            <Title
              order={4}
              ta="center"
              fw="bold"
              w="100%"
              lineClamp={1}
              style={{ justifySelf: "flex-start" }}
            >
              Loans
            </Title>
            <ActionIcon variant="subtle" color="gray" onClick={toggleFilter}>
              <IconFilter
                style={{
                  width: rem(24),
                  height: rem(24),
                }}
              />
            </ActionIcon>
          </Flex>
        </Card.Section>
        <Collapse in={filterOpened}>
          <Text>Filter stuff</Text>
        </Collapse>
        {loans.length ? (
          <ScrollArea.Autosize
            mah="100%"
            type="auto"
            scrollbars="y"
            offsetScrollbars
          >
            <Stack>
              {loans.map((loan) => (
                <LoanItemView
                  key={loan.id}
                  isActive={activeId === loan.id.toString()}
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
            </Stack>
          </ScrollArea.Autosize>
        ) : (
          <div className="h-full w-full">No Outstanding Loans</div>
        )}
        <Card.Section withBorder inheritPadding p="lg" mt="xs">
          <Stack style={{ justifySelf: "flex-end" }}>
            <Group grow>
              <Button component={Link} to={`/loans/create`}>
                Sign-Out Items
              </Button>
              <Button>Sign-In Items</Button>
            </Group>
          </Stack>
        </Card.Section>
      </Card>
    </>
  );
}

export default function Page() {
  const params = useParams();
  const mediaMatch = useMediaQuery("(min-width: 62em)");
  const path = useLocation();

  const loanId = params.loanId;

  const isNestedRoute = path.pathname.replace("/loans", "") !== "";

  return (
    <Container p="sm" miw="100dvw" h="100dvh">
      {mediaMatch ? (
        <Flex direction="row" w="100%" h="100%" gap="lg">
          <Box h="100%">
            <LoanListView {...(loanId && { activeId: loanId })} />
          </Box>
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
          {isNestedRoute ? <Outlet /> : <LoanListView />}
        </Flex>
      )}
    </Container>
  );
}
