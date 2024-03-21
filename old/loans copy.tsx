import {
    ActionIcon,
    Button,
    Card,
    Container,
    Flex,
    Group,
    Menu,
    ScrollArea,
    Stack,
    Text,
    px,
    rem
} from "@mantine/core";
import {
    Await,
    Link,
    MetaFunction,
    defer,
    useLoaderData,
    useLocation
} from "@remix-run/react";
import { IconDots } from "@tabler/icons-react";
import { Suspense } from "react";
import { setTimeout } from "timers/promises";
import ListSkeleton from "~/components/ListSkeleton";
import { prisma } from "~/lib/prisma.server";
import { formatDate } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [{ title: "Item Loan App" }];
};

export async function loader() {
  const loans = setTimeout(
    2000,
    await prisma.loan.findMany({
      where: {
        items: {
          some: {
            dateReturned: null,
          },
        },
      },
      include: {
        person: true,
        items: {
          include: {
            item: true,
          },
        },
      },
      orderBy: {
        updatedDate: "desc",
      },
    })
  );

  return defer({ loans: loans });
}

export default function Page() {
  const { loans } = useLoaderData<typeof loader>();
  const location = useLocation();

  const isNestedRoute = location.pathname !== "/loans";

  const loanItemHeight = 120;

  return (
    <Container p={rem(8)} w="100vw" h="100vh">
      <Flex h="100%" direction="column" gap="sm" align="stretch">
        <Card>
          <Card.Section withBorder inheritPadding py="xs">
            <Text fw="bold" size="xl">
              Outstanding Loans
            </Text>
          </Card.Section>
          <Suspense
            fallback={
              <ListSkeleton itemCount={3} height={rem(loanItemHeight)} />
            }
          >
            <Await
              resolve={loans}
              errorElement={
                <Text c={"red"} ta={"center"}>
                  Failed to load loans
                </Text>
              }
            >
              {(loans) =>
                loans && loans.length ? (
                  <ScrollArea.Autosize
                    mah="30rem"
                    type="always"
                    scrollbars="y"
                    offsetScrollbars
                  >
                    <Stack hiddenFrom="md" hidden={isNestedRoute}>
                      {loans.slice(0, 5).map((loan) => (
                        <Card
                          key={loan.id}
                          withBorder
                          shadow="sm"
                          radius="sm"
                          h={px(loanItemHeight)}
                          component={Link}
                          to={`/loans/${loan.id}`}
                        >
                          <Card.Section withBorder inheritPadding py="xs">
                            <Group justify="space-between">
                              <Text
                                fw={500}
                                component={Link}
                                to={`/people/${loan.personId}`}
                                className="md:hover:text-blue-500"
                              >
                                {`${loan.person.firstName} ${loan.person.lastName}`}
                              </Text>
                              <Menu
                                withinPortal
                                position="bottom-end"
                                shadow="sm"
                              >
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
                                  <Menu.Item>View Loan</Menu.Item>
                                  <Menu.Item>Modify Loan</Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </Group>
                          </Card.Section>

                          <Stack>
                            <Text>{`${
                              loan.items.filter(
                                (item) => item.dateReturned == undefined
                              ).length
                            } 
                      outstanding item since ${formatDate(
                        new Date(loan.createdDate)
                      )}`}</Text>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </ScrollArea.Autosize>
                ) : (
                  <div className="h-full w-full">No Outstanding Loans</div>
                )
              }
            </Await>
          </Suspense>
        </Card>
        <Stack style={{ justifySelf: "flex-end" }}>
          <Group grow>
            <Button>Sign-Out</Button>
            <Button>Sign-In</Button>
          </Group>
          <Button>View All Loans</Button>
        </Stack>
      </Flex>
    </Container>
  );
}
