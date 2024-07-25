import { Center, Loader } from "@mantine/core";

export default function Page() {
  return (
    <Center w="100%" h="100%">
      <iframe
        src="https://docs.google.com/forms/d/e/1FAIpQLSdlh_Jkl2na-ZYe0uSICr4klv3rTM4OhrX-TK59AzTiCi_E2w/viewform?embedded=true"
        width="100%"
        height="100%"
        style={{ border: "none" }}
      >
        <Center w="100%" h="100%">
          <Loader />
        </Center>
      </iframe>
    </Center>
  );
}
