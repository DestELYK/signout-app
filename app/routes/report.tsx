/**
 * Report Route
 *
 * A route that displays external reports through an embedded iframe.
 * Loads report content from a configurable external URL and provides
 * a -page viewing experience with loading fallbacks.
 *
 * Environment Variables:
 * - REPORT_URL: The external URL for the report content
 *
 *
 * @author Kyle Dunn
 */

import { Center, Loader } from "@mantine/core";

import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

/**
 * Server-side loader function for the report route
 * Retrieves the report URL from environment variables
 *
 * @param args - Remix loader function arguments
 * @returns Object containing the report source URL
 */
export const loader = ({}: LoaderFunctionArgs) => {
  const reportUrl = process.env.REPORT_URL;

  return {
    src: reportUrl,
  };
};

/**
 * Report page component that displays external reports in an iframe
 * Provides full-page viewing experience with loading fallbacks
 *
 * @returns The rendered report page component
 */
export default function Page() {
  const data = useLoaderData<typeof loader>();

  return (
    <Center w="100%" h="100%">
      {/* External report embedded in full-page iframe */}
      <iframe src={data.src} width="100%" height="100%" style={{ border: "none" }}>
        {/* Fallback content for browsers that don't support iframes */}
        <Center w="100%" h="100%">
          <Loader />
        </Center>
      </iframe>
    </Center>
  );
}
