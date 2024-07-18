import {
  Center,
  Collapse,
  Divider,
  Flex,
  Group,
  Pagination,
  Paper,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigation, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { INITIAL_PAGE_SIZE } from "~/utils/consts";
import SearchView from "../SearchView";

// TODO - implement importing and exporting data
// TODO - allow filtering the list
// TODO - lazy load the list
// TODO - allow sorting the list
// TODO - virtual list

export interface ListViewProps<T extends { id: number }> {
  orientation?: "horizontal" | "vertical";
  emptyText?: string;
  data: T[] | undefined;
  totalCount?: number;
  loading?: boolean;
  withSearch?: boolean;
  initialItemsPerPage?: number;
  showPagination?: boolean;
  children: (item: T, query?: string, qrCode?: string) => React.ReactNode;
}

export default function ListView<T extends { id: number }>({
  orientation = "vertical",
  emptyText = "No entries for section",
  data = [],
  totalCount = data?.length ?? 0,
  loading,
  withSearch = true,
  initialItemsPerPage = INITIAL_PAGE_SIZE,
  showPagination = true,
  children,
}: ListViewProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();

  const scrollRef = useRef<HTMLDivElement>(null);

  const [activePage, setPage] = useState(1);

  const [itemsPerPage, setItemsPerPage] = useState(
    searchParams.has("limit")
      ? Number(searchParams.get("limit"))
      : initialItemsPerPage
  );

  const filteredItems =
    data && data.length > itemsPerPage ? data.slice(0, itemsPerPage) : data;

  const form = useForm({
    validateInputOnChange: true,
    initialValues: { query: "", qrCode: "" },
    onValuesChange: (values) => {},
    validate: {
      query: (value) => {
        if (value && /[^A-Z0-9- ]+/gi.test(value)) {
          return "Invalid characters used";
        }
      },
    },
  });

  const searchQuery = searchParams.get("q");
  useEffect(() => {
    form.setFieldValue("query", searchQuery || "");
  }, [searchQuery]);

  const searchQrCode = searchParams.get("qrCode");
  useEffect(() => {
    form.setFieldValue("qrCode", searchQrCode || "");
  }, [searchQrCode]);

  const searchPage = searchParams.get("page");
  useEffect(() => {
    if (searchPage) setPage(Number(searchPage) + 1);
  }, [searchPage]);

  const searchLimit = searchParams.get("limit");
  useEffect(() => {
    if (searchLimit) setItemsPerPage(Number(searchLimit));
  }, [searchLimit]);

  return (
    <Flex w="100%" h="100%" direction="column" align="center">
      {withSearch && (
        <Stack w="100%" gap={0}>
          <SearchView
            loading={
              navigation.location &&
              new URLSearchParams(navigation.location.search).has("q")
            }
            onChanged={(query, qrCode) => {
              form.setFieldValue("query", query);
              form.setFieldValue("qrCode", qrCode);

              if (!form.validate().hasErrors) {
                setSearchParams(
                  (prev) => {
                    if (!query || query === "") {
                      prev.delete("q");
                    } else {
                      prev.set("q", query);
                    }

                    if (!qrCode) {
                      prev.delete("qrCode");
                    } else {
                      prev.set("qrCode", qrCode);
                    }
                    return prev;
                  },
                  { replace: true }
                );
              }
            }}
          />
          {filteredItems.length > 0 && <Divider my="sm" />}
        </Stack>
      )}
      {filteredItems.length === 0 && (data !== undefined || !loading) ? (
        <Paper withBorder w="100%" h="100%">
          <Center w="100%" h="100%" p="xl">
            <Text>{emptyText}</Text>
          </Center>
        </Paper>
      ) : orientation === "horizontal" ? (
        <Paper w="100%" h="100%" withBorder>
          <ScrollArea
            w="100%"
            h="100%"
            type="hover"
            scrollbarSize={20}
            scrollbars="x"
            viewportRef={scrollRef}
          >
            <Flex direction="row" align="center" wrap="nowrap" gap="md">
              {data === undefined || loading
                ? Array(initialItemsPerPage)
                    .fill(0)
                    .map((_, index) => (
                      <Group key={index}>
                        <Skeleton h={100} />
                        <Divider orientation="vertical" />
                      </Group>
                    ))
                : filteredItems.length > 0 &&
                  filteredItems.map((item) => (
                    <Flex
                      direction="row"
                      key={item.id}
                      justify="center"
                      align="center"
                      gap="xs"
                    >
                      {children(item, form.values.query, form.values.qrCode)}
                      <Divider h="100%" orientation="vertical" />
                    </Flex>
                  ))}
              {!showPagination && data.length > itemsPerPage && (
                <UnstyledButton
                  w="100%"
                  onClick={() =>
                    setItemsPerPage((itemsPerPage) =>
                      Math.min(totalCount, itemsPerPage + 10)
                    )
                  }
                  pr="sm"
                >
                  <Text c="dimmed" size="sm" ta="center">
                    Tap to view more entries
                  </Text>
                </UnstyledButton>
              )}
            </Flex>
          </ScrollArea>
        </Paper>
      ) : (
        <Paper w="100%" h="100%" withBorder>
          <ScrollArea
            w="100%"
            h="100%"
            type="hover"
            scrollbars="y"
            viewportRef={scrollRef}
          >
            <Flex
              w="100%"
              direction="column"
              align="center"
              wrap="nowrap"
              gap="md"
            >
              {data === undefined || loading
                ? Array(initialItemsPerPage)
                    .fill(0)
                    .map((_, index) => <Skeleton h={100} />)
                : filteredItems.length > 0 &&
                  filteredItems.map((item) => (
                    <Flex
                      w="100%"
                      direction="column"
                      key={item.id}
                      justify="center"
                      align="center"
                      gap={10}
                    >
                      {children(item, form.values.query, form.values.qrCode)}
                      <Divider w="100%" />
                    </Flex>
                  ))}
              {!showPagination && data.length > itemsPerPage && (
                <UnstyledButton
                  w="100%"
                  onClick={() =>
                    setItemsPerPage((itemsPerPage) =>
                      Math.min(totalCount, itemsPerPage + 10)
                    )
                  }
                  mb="sm"
                >
                  <Text c="dimmed" size="sm" ta="center">
                    {data.length - itemsPerPage} more entries...
                  </Text>
                  <Text c="dimmed" size="sm" ta="center">
                    Tap to view more entries
                  </Text>
                </UnstyledButton>
              )}
            </Flex>
          </ScrollArea>
        </Paper>
      )}
      {showPagination && (
        <Collapse w="100%" in={totalCount > itemsPerPage}>
          <Divider mt="sm" />
          <Pagination.Root
            w="100%"
            py="sm"
            siblings={1}
            size="sm"
            total={
              totalCount > itemsPerPage
                ? Math.ceil(totalCount / itemsPerPage)
                : 1
            }
            value={activePage}
            onChange={(value) => {
              if (value !== (searchPage ?? 0)) {
                scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                setSearchParams(
                  (prev) => {
                    prev.set("page", (value - 1).toString());
                    return prev;
                  },
                  { replace: true }
                );
              }
            }}
          >
            <Group gap={5} justify="center">
              <Pagination.Previous />
              <Pagination.Items />
              <Pagination.Next />
            </Group>
          </Pagination.Root>
        </Collapse>
      )}
    </Flex>
  );
}
