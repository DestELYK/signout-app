import { Container, Stack, Text } from "@mantine/core";
import { useState } from "react";
import Scanner from "~/components/Scanner";

export default function Page() {
  const [decodedText, setDecodedText] = useState<string>();

  return (
    <Container w="100vw" h="100vh">
      <Stack h="100%" justify="center" align="center">
        <Scanner stopOnDetection/>
        <Text>{decodedText}</Text>
      </Stack>
    </Container>
  );
}
