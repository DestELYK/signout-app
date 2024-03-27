import {
  ActionIcon,
  Button,
  Card,
  Collapse,
  Flex,
  Group,
  Stack,
  Text,
  Title,
  rem
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Link
} from "@remix-run/react";
import { IconFilter } from "@tabler/icons-react";

export function LoanListView({ children }: { children: React.ReactNode }) {
  const [newLoanOpened, { open: newLoanOpen, close: newLoanClose }] =
    useDisclosure(false);
  const [filterOpened, { toggle: toggleFilter }] = useDisclosure(false);

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
        {children}
        <Card.Section withBorder inheritPadding p="lg" mt="xs">
          <Stack style={{ justifySelf: "flex-end" }}>
            <Group grow>
              <Button component={Link} to={"/loans/signout"}>
                Sign-Out Items
              </Button>
              <Button component={Link} to="/loans/signin">
                Sign-In Items
              </Button>
            </Group>
          </Stack>
        </Card.Section>
      </Card>
    </>
  );
}
