import { Center, Text } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { useMatches } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Item Loan App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const matches = useMatches();

  return (
    <>
      <Center h="100%">
        <Text>Welcome to the Helpdesk Signout App!</Text>
      </Center>
    </>
  );
}
