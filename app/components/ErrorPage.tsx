import { Center, Paper, Stack, Text, Title } from "@mantine/core";
import { Link, isRouteErrorResponse } from "@remix-run/react";

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
            <Link to="/report">Fill out this error report form</Link>
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
            <Link to="/report">Fill out this report form</Link>
          </Stack>
        </Paper>
      </Center>
    );
  } else {
    return <></>;
  }
}
