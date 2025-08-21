/**
 * Custom React Hooks
 *
 * Collection of custom hooks for common functionality across the signout
 * application. Provides reusable logic for data fetching, error handling,
 * responsive design, and URL state management.
 *
 *
 * @module hooks
 *
 * @author Kyle Dunn
 */

import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { UseDataFunctionReturn, useTypedFetcher } from "remix-typedjson";

// TODO - Have errors return with fields

/**
 * Custom hook for typed data fetching with automatic error handling
 * Provides notifications for errors and callbacks for successful data
 *
 * @template T - The expected response data type
 * @param onData - Callback fired when data is successfully received
 * @param onError - Optional callback fired when an error occurs
 * @returns The typed fetcher instance
 */
export function useFetcherWithErrorHandler<T>(
  onData: (data: UseDataFunctionReturn<T>) => void,
  onError?: (error: string) => void
) {
  const fetcher = useTypedFetcher<T>();
  const navigate = useNavigate();

  useEffect(() => {
    if (fetcher.data && typeof fetcher.data === "object") {
      if ("error" in fetcher.data && typeof fetcher.data.error === "string") {
        notifications.show({
          title: "Error",
          message: fetcher.data.error,
          color: "red",
        });

        onError?.(fetcher.data.error);
      } else {
        onData(fetcher.data);
      }
    }
  }, [fetcher.data]);

  return fetcher;
}

/**
 * Hook for preventing navigation (placeholder implementation)
 * TODO: Implement navigation prevention logic
 */
export function usePreventNavigation() {}

/**
 * Custom hook for managing create modal state through URL parameters
 * Syncs modal open/closed state with URL search parameters for deep linking
 *
 * @returns Tuple containing modal state and control functions
 */
export function useCreateModal(): [
  boolean,
  { open: (replace?: boolean) => void; close: (replace?: boolean) => void }
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const [opened, { open, close }] = useDisclosure(false);

  // Sync modal state with URL parameters
  useEffect(() => {
    searchParams.has("create") ? open() : close();
  }, [searchParams.has("create")]);

  return [
    opened,
    {
      /**
       * Open the create modal and update URL
       * @param replace - Whether to replace current history entry
       */
      open: (replace: boolean = false) => {
        open();
        setSearchParams(
          (prev) => {
            prev.set("create", "");
            return prev;
          },
          { replace: replace }
        );
      },
      /**
       * Close the create modal and update URL
       * @param replace - Whether to replace current history entry
       */
      close: (replace: boolean = true) => {
        close();
        setSearchParams(
          (prev) => {
            prev.delete("create");
            return prev;
          },
          { replace: replace }
        );
      },
    },
  ];
}

/**
 * Hook for detecting desktop screen sizes
 * Uses media query to determine if viewport is desktop width
 *
 * @returns Boolean indicating if screen is desktop size (min-width: 62em)
 */
export function useDesktopOnly() {
  const matches = useMediaQuery("(min-width: 62em)", true, {
    getInitialValueInEffect: false,
  });

  return matches;
}
