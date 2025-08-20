/**
 * Client Entry Point
 *
 * This file handles the client-side hydration of the Remix application.
 * By default, Remix will handle hydrating your app on the client for you.
 * You are free to delete this file if you'd like to, but if you ever want it
 * revealed again, you can run `npx remix reveal` ✨
 *
 * For more information, see https://remix.run/file-conventions/entry.client
 *
 *
 * @author Kyle Dunn
 */

import { RemixBrowser } from "@remix-run/react";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";

/**
 * Hydrate the React application on the client side
 * Uses React 18's concurrent features with startTransition
 */
startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <RemixBrowser />
    </StrictMode>
  );
});
