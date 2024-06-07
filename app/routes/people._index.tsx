import { Center } from "@mantine/core";

export default function Page() {
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
