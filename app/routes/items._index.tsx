import { Center } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { loader } from "./items";

export default function Page() {
  const data = useTypedRouteLoaderData<typeof loader>("routes/items");

  return (
    <>
      <Center h="100%" visibleFrom="md">
        Dashboard content goes here
      </Center>
      <Center h="100%" hiddenFrom="md">
        Dashboard content goes here
      </Center>
    </>
  );
}
