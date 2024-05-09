import { Center, Text } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Home | SJK Signout" },
    {
      name: "description",
      content: "Web App for tracking inventory for item sign-outs",
    },
  ];
};

export default function Index() {
  return (
    <>
      <Center h="100%">
        <Text ta="center">Welcome to the Helpdesk Signout App!</Text>
      </Center>
    </>
  );
}
