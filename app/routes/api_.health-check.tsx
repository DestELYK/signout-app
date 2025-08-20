/**
 * Health check API endpoint for system monitoring
 *
 * This route provides a simple health check endpoint that responds with "OK"
 * to indicate the application server is running and responsive.
 *
 * Response:
 * - Status: 200 OK
 * - Content-Type: text/plain
 * - Body: "OK"
 *
 * @module routes/api/health-check
 *
 * @author Kyle Dunn
 */

/**
 * Health check loader function
 * Returns a simple OK response to indicate server health
 *
 * @returns Response with "OK" text and plain text content type
 */
export const loader = async () => {
  return new Response("OK", {
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
