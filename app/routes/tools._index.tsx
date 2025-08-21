/**
 * Tools Index Route
 *
 * Redirects to the default tools tab (import-export)
 *
 * @module ToolsIndexRoute
 */

import { redirect, type LoaderFunction } from "@remix-run/node";

/**
 * Redirect to the default tools tab
 */
export const loader: LoaderFunction = async () => {
  return redirect("/tools/migration");
};
