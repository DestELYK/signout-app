import { notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { UseDataFunctionReturn, useTypedFetcher } from "remix-typedjson";

// TODO - Have errors return with fields

export function useFetcherWithErrorHandler<T>(
  onData: (data: UseDataFunctionReturn<T>) => void,
  onError?: (error: string) => void
) {
  const fetcher = useTypedFetcher<T>();

  useEffect(() => {
    if (fetcher.data && typeof fetcher.data === "object") {
      if ("error" in fetcher.data && typeof fetcher.data.error === "string") {
        notifications.show({
          message: `Error: ${fetcher.data.error}`,
          color: "error",
        });

        onError?.(fetcher.data.error);


      } else {
        onData(fetcher.data);
      }
    }
  }, [fetcher.data]);

  return fetcher;
}

export function usePreventNavigation() {}
