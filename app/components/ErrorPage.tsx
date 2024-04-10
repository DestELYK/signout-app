import { Center, Paper, Stack, Text, Title } from "@mantine/core";
import { isRouteErrorResponse } from "@remix-run/react";

export default function ErrorPage({ error }: { error: any }) {
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        error.statusText = "Not Found";
        break;
      case 500:
        error.statusText = "Server Error";
        break;
      default:
        error.statusText = "Unknown Status";
    }

    return (
      <Center w="100%" h="100%">
        <Paper p="5rem" shadow="md" withBorder>
          <Stack>
            <Title>
              {error.status} - {error.statusText}
            </Title>
            <Text ta="center">{error.data}</Text>
            <a
              href="https://forms.gle/u45D3TcSGS79f2hq9"
              style={{ textAlign: "center" }}
              target="_blank"
            >
              Fill out this error report form
            </a>
          </Stack>
        </Paper>
      </Center>
    );
  } else if (error instanceof Error) {
    return (
      <Center w="100%" h="100%">
        <Paper p="5rem" shadow="md" withBorder>
          <Stack>
            <Title>Server Error Occurred</Title>
            <Text>{error.message}</Text>
            <a
              href="https://forms.gle/u45D3TcSGS79f2hq9"
              style={{ textAlign: "center" }}
              target="_blank"
            >
              Fill out this report form
            </a>
          </Stack>
        </Paper>
      </Center>
    );
  } else {
    return <></>;
  }
}
