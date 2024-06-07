import {
  Card,
  Center,
  Collapse,
  Divider,
  Group,
  Pagination,
  ScrollArea,
  Skeleton,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigation, useSearchParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import SearchView from "../SearchView";

const ITEMS_PER_PAGE = 15;

// TODO - implement importing and exporting data
// TODO - allow filtering the list
// TODO - lazy load the list
// TODO - allow sorting the list
// TODO - virtual list

export interface ListViewProps<T extends { id: number }> {
  emptyText?: string;
  data: T[] | undefined;
  totalCount?: number;
  loading?: boolean;
  children: (item: T, query?: string, qrCode?: string) => React.ReactNode;
}

export default function ListView<T extends { id: number }>({
  emptyText = "No entries for section",
  data = [],
  totalCount = data?.length ?? 0,
  loading,
  children,
}: ListViewProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();

  const scrollRef = useRef<HTMLDivElement>(null);

  const [activePage, setPage] = useState(1);

  const itemsPerPage = searchParams.has("limit")
    ? Number(searchParams.get("limit"))
    : ITEMS_PER_PAGE;

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

  useEffect(() => {
    const query = searchParams.get("q");
    const qrCode = searchParams.get("qrCode");

    form.setFieldValue("query", query || "");
    form.setFieldValue("qrCode", qrCode || "");
  }, [searchParams]);

  useEffect(() => {
    const page = Number(searchParams.get("page")) ?? 0;

    setPage(page + 1);
  }, [searchParams.get("page")]);

  useEffect(() => {
    if (!searchParams.has("limit")) {
      setSearchParams(
        (prev) => {
          prev.set("limit", itemsPerPage.toString());
          return prev;
        },
        { replace: true }
      );
    }
  }, [itemsPerPage]);

  return (
    <>
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
                if (!query) {
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
      <Divider />
      <ScrollArea
        w="100%"
        h="calc(100dvh - 20rem)"
        type="always"
        scrollbars="y"
        viewportRef={scrollRef}
      >
        <Card m="sm" withBorder>
          {data === undefined || loading ? (
            Array.from(Array(itemsPerPage)).map((item, index) => (
              <Card.Section key={index} inheritPadding withBorder py="sm">
                <Skeleton h={100} />
              </Card.Section>
            ))
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Card.Section key={item.id} inheritPadding withBorder py="sm">
                {children(item, form.values.query, form.values.qrCode)}
              </Card.Section>
            ))
          ) : (
            <Center w="100%" h="100%">
              <Text m="auto">{emptyText}</Text>
            </Center>
          )}
        </Card>
      </ScrollArea>
      <Divider />
      <Collapse py="sm" in={totalCount > itemsPerPage}>
        <Pagination.Root
          w="100%"
          siblings={1}
          total={
            totalCount > itemsPerPage ? Math.ceil(totalCount / itemsPerPage) : 1
          }
          value={activePage}
          onChange={(value) => {
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
            setSearchParams(
              (prev) => {
                prev.set("page", (value - 1).toString());
                return prev;
              },
              { replace: true }
            );
          }}
        >
          <Group gap={5} justify="center">
            <Pagination.Previous />
            <Pagination.Items />
            <Pagination.Next />
          </Group>
        </Pagination.Root>
      </Collapse>
    </>
  );
}
