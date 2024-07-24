import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSearchParams } from "@remix-run/react";
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

export function usePreventNavigation() {}

export function useCreateModal(): [
  boolean,
  { open: (replace?: boolean) => void; close: (replace?: boolean) => void }
] {
  const [searchParams, setSearchParams] = useSearchParams();
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    searchParams.has("create") ? open() : close();
  }, [searchParams.has("create")]);

  return [
    opened,
    {
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

export function useDesktopOnly() {
  const matches = useMediaQuery("(min-width: 62em)");

  return matches;
}
