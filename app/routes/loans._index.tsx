import { Center } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { loader as loansLoader } from "./loans";

export default function Page() {
  const matches = useMediaQuery("(min-width: 62em)");
  const data = useTypedRouteLoaderData<typeof loansLoader>("routes/loans");

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
