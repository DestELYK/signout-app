import { Center, Image, Text, rem } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import InfoView from "~/components/base/InfoView";

export const meta: MetaFunction = () => {
  return [
    { title: "Item Loan App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
    <InfoView
      title="Home"
      cardProps={{ withBorder: false }}
      headerProps={{ withBorder: true }}
    >
      <Image h={rem(100)} src="/logo.png" fit="contain" />
      <Center left={0} right={0} h="100%" pos="absolute">
        <Text ta="center">Welcome to the Helpdesk Signout App!</Text>
      </Center>
    </InfoView>
  );
}
