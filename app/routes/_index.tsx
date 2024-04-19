import {
  Button,
  Center,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Title,
} from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Item Loan App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <>
      <Stack gap="sm" mt="lg" hiddenFrom="sm">
        <Image src="/logo.png" alt="SJK"></Image>
        <Title
          c="#094b7d"
          style={{ textAlign: "center" }}
          mt="20px"
          size="3rem"
        >
          Signout App
        </Title>
        <Center w="100vw" h="100dvh" p="sm" style={{ position: "absolute" }}>
          <Stack w="100%" gap="sm">
            <Button w="100%" component={Link} to="/loans">
              View Loans
            </Button>
            <Button w="100%" component={Link} to="/items" disabled>
              View Items
            </Button>
            <Button w="100%" component={Link} to="/people" disabled>
              View People
            </Button>
          </Stack>
        </Center>
      </Stack>
      <Stack gap="lg" mt="lg" visibleFrom="sm">
        <Group gap="sm" mah="15rem">
          <Image src="/logo.png" alt="SJK"></Image>
          <Title
            c="#094b7d"
            style={{ textAlign: "center" }}
            mt="20px"
            size="3rem"
          >
            Helpdesk
          </Title>
        </Group>
        <Center w="100vw" h="calc(100dvh - 15rem)" p="lg" style={{ position: "absolute", top: "15rem" }}>
          <SimpleGrid cols={2} w="100%" h="100%">
            <Button w="100%" h="100%" size="3rem" component={Link} to="/loans">
              View Loans
            </Button>
            <Button
              w="100%"
              h="100%"
              size="3rem"
              component={Link}
              to="/items"
            >
              View Items
            </Button>
            <Button
              w="100%"
              h="100%"
              size="3rem"
              component={Link}
              to="/people"
            >
              View People
            </Button>
          </SimpleGrid>
        </Center>
      </Stack>
    </>
  );
}
