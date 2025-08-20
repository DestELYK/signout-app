/**
 * Person profile redirect route for external profile system integration
 *
 * This route provides redirection to external person profile systems:
 * - Redirects to external profile URL based on person ID
 * - Integration with external identity/profile management systems
 * - URL parameter validation and error handling
 * - Environment-based profile URL configuration
 *
 * Environment Variables:
 * - PROFILE_URL: Base URL for external profile system
 *
 *
 * @module routes/people/profile/$id
 *
 * @author Kyle Dunn
 * @requires Environment configuration for profile URL
 */

import { LoaderFunctionArgs, redirect } from "@remix-run/node";

/**
 * Server-side loader function for profile redirection
 * Redirects to external profile system based on person ID
 *
 * @param params - Route parameters containing person ID
 * @returns Redirect response to external profile or 404 error
 */
export const loader = ({ params }: LoaderFunctionArgs) => {
  if (params.id) {
    // Redirect to external profile system with person ID
    return redirect(process.env.PROFILE_URL + params.id);
  }

  // Return 404 if no ID provided
  throw new Response(null, { status: 404 });
};
