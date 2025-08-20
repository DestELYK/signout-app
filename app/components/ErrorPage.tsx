/**
 * ErrorPage Component
 *
 * A centralized error display component that handles different types
 * of errors throughout the application. Provides user-friendly error
 * messages and recovery options.
 *
 *
 * @module ErrorPage
 *
 * @author Kyle Dunn
 */

import { Button, Center, Paper, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Link, isRouteErrorResponse } from "@remix-run/react";

/**
 * Error page component that displays appropriate error messages
 * and provides recovery options for users
 *
 * @param props - Component props containing the error object
 * @param props.error - The error object to display
 * @returns The rendered error page component
 */
export default function ErrorPage({ error }: { error: any }) {
  /** Clear any existing notifications on error display */
  notifications.clean();

  /** Default error message configuration */
  const errorData = {
    title: "Server Error Occurred",
    message: "An error occurred while trying to load this page.",
  };

  /** Handle different error types and status codes */
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        errorData.title = `${error.status} - Not Found`;
        break;
      case 500:
        errorData.title = `${error.status} - Server Error`;
        break;
      default:
        errorData.title = `${error.status} - Unknown Status`;
        break;
    }
  } else if (error instanceof Error) {
    errorData.message = error.message;
  }

  return (
    <Center w="100%" h="100%" p="lg">
      <Paper p="5rem" shadow="md" withBorder>
        <Stack>
          <Title>{errorData.title}</Title>
          <Text ta="center">{errorData.message}</Text>
          <Button component={Link} to="/report">
            Fill out this error report form
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
