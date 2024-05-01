import { Center, Flex, Image, Stack, Text } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { useMatches } from "@remix-run/react";
import InfoView from "~/components/base/InfoView";

export const meta: MetaFunction = () => {
  return [
    { title: "Item Loan App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const matches = useMatches();

  return (
    <InfoView title="Home">
      <Flex direction="column" h="100%">
        <Image src="/logo.png" />
        <Center h="100%">
          <Stack>
            <Text>Welcome to the Helpdesk Signout App!</Text>
          </Stack>
        </Center>
      </Flex>
    </InfoView>
  );
}
