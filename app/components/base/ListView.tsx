import {
  ActionIcon,
  Button,
  Card,
  Center,
  CloseButton,
  Collapse,
  Divider,
  Flex,
  Group,
  Loader,
  Modal,
  Pagination,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useNavigation, useSearchParams } from "@remix-run/react";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import QrButton from "../qrCode/QrButton";
import ListSkeleton from "../skeletons/ListSkeleton";

const ITEMS_PER_PAGE = 15;

// TODO - implement importing and exporting data
// TODO - allow filtering the list
// TODO - lazy load the list
// TODO - allow sorting the list
// TODO - virtual list

export interface ListViewProps<T extends { id: number }> {
  title: string;
  createTitle?: string;
  createSection?: React.ReactNode;
  itemsPerPage: number;
  emptyText?: string;
  data: {
    [value: string]: { label: string; items?: T[]; size: number };
  };
  children: (item: T, query?: string, qrCode?: string) => React.ReactNode;
}

export default function ListView<T extends { id: number }>({
  title,
  createTitle,
  createSection,
  itemsPerPage = ITEMS_PER_PAGE,
  emptyText = "No entries for section",
  data,
  children,
}: ListViewProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const queryRef = useRef<HTMLInputElement>(null);
  const [collapseOpened, { open: openCollapse, close: closeCollapse }] =
    useDisclosure(searchParams.has("q", "qrCode"));

  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [activePage, setPage] = useState(1);

  const [value, setValue] = useState(
    searchParams.get("display") || Object.keys(data)[0]
  );

  const items = data[value].items;

  const totalCount = data[value].size;

  const filteredItems =
    items && items.length > itemsPerPage ? items.slice(0, itemsPerPage) : items;

  const controlData = Object.keys(data).map((key) => {
    return {
      value: key,
      label: `${data[key].label} (${data[key].size})`,
    };
  });

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

    (query || qrCode) && openCollapse();
  }, []);

  useEffect(() => {
    const create = searchParams.has("create");

    create ? openCreate() : closeCreate();
  }, [searchParams.has("create")]);

  useEffect(() => {
    const offset = Number(searchParams.get("offset")) ?? 0;

    setPage(offset === 0 ? 1 : Math.round(offset / itemsPerPage) + 1);
  }, [value, searchParams.get("offset")]);

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

  function updateSearch({
    query,
    qrCode,
  }: {
    query?: string;
    qrCode?: string;
  }) {
    form.setFieldValue("query", query || "");
    form.setFieldValue("qrCode", qrCode || "");

    setSearchParams((prev) => {
      query === undefined || query.length === 0
        ? prev.delete("q")
        : prev.set("q", query!);
      qrCode === undefined || qrCode.length === 0
        ? prev.delete("qrCode")
        : prev.set("qrCode", qrCode!);

      return prev;
    });
  }

  return (
    <>
      <Modal
        title={createTitle || ""}
        opened={createOpened}
        onClose={() => {
          setSearchParams(
            (prev) => {
              prev.delete("create");
              return prev;
            },
            { replace: true }
          );
        }}
        centered
      >
        {createSection}
      </Modal>
      <Flex w="100%" h="100%" direction="column" align="center" wrap="nowrap">
        <Flex
          w="100%"
          direction="column"
          align="center"
          wrap="nowrap"
          gap="sm"
          p="sm"
          {...(filteredItems &&
            filteredItems.length > 0 && {
              style: { boxShadow: "0px 10px 10px 5px #8686862d", zIndex: 10 },
            })}
        >
          <Flex w="100%" direction="row" align="center" gap="xs">
            <TextInput
              data-autofocus
              radius="lg"
              w="100%"
              leftSection={<IconSearch />}
              rightSection={
                navigation.location &&
                new URLSearchParams(navigation.location.search).has("q") ? (
                  <Loader size="xs" />
                ) : (
                  form.values.query.length !== 0 && (
                    <CloseButton
                      onClick={() => updateSearch({ query: "", qrCode: "" })}
                    />
                  )
                )
              }
              placeholder={`Search ${title.toLowerCase()}...`}
              {...form.getInputProps("query")}
              onChange={(event) => {
                updateSearch({
                  query: event.currentTarget.value,
                  qrCode: "",
                });
              }}
              ref={queryRef}
            />
            <QrButton
              onResult={(result) =>
                updateSearch({ query: "", qrCode: result.data })
              }
            />
          </Flex>
          {form.values.qrCode.length !== 0 && (
            <Flex w="100%" direction="row" align="center" justify="center">
              <Text size="xs" ta="center">
                QRCode: {form.values.qrCode}
              </Text>
              <Button
                variant="subtle"
                onClick={() => updateSearch({ query: "", qrCode: "" })}
              >
                Clear
              </Button>
            </Flex>
          )}
          <Flex w="100%" direction="row" align="center" gap="xs" wrap="nowrap">
            <SegmentedControl
              w="100%"
              data={controlData}
              value={value}
              onChange={(value) => {
                scrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
                setSearchParams(
                  (prev) => {
                    if (value == Object.keys(data)[0]) {
                      prev.delete("display");
                    } else {
                      prev.set("display", value);
                    }
                    prev.delete("offset");
                    return prev;
                  },
                  {
                    replace: true,
                  }
                );

                setValue(value);
              }}
            ></SegmentedControl>
            <ActionIcon
              size={40}
              variant="outline"
              autoContrast
              visibleFrom="xs"
              onClick={() =>
                setSearchParams(
                  (prev) => {
                    prev.set("create", "");
                    return prev;
                  },
                  {
                    replace: true,
                  }
                )
              }
            >
              <IconPlus />
            </ActionIcon>
          </Flex>
        </Flex>
        <ScrollArea.Autosize
          h="100%"
          w="100%"
          type="always"
          scrollbars="y"
          viewportRef={scrollRef}
          offsetScrollbars={"y"}
        >
          {filteredItems === undefined ||
          (navigation.location !== undefined &&
            !navigation.location?.search.includes("create") &&
            navigation.location.pathname === location.pathname &&
            !/^\/.*\/\d+$/.test(navigation.location.pathname)) ? (
            <ListSkeleton height={80} itemCount={itemsPerPage} gap={2} />
          ) : filteredItems.length > 0 ? (
            <Card m="sm" withBorder>
              {filteredItems.map((item) => (
                <Card.Section key={item.id} inheritPadding withBorder py="sm">
                  {children(item, form.values.query, form.values.qrCode)}
                </Card.Section>
              ))}
            </Card>
          ) : (
            <Center w="100%" h="100%">
              <Text m="auto">{emptyText}</Text>
            </Center>
          )}
        </ScrollArea.Autosize>
        <Stack
          w="100%"
          px="sm"
          pb="sm"
          {...(filteredItems &&
            filteredItems.length > 0 && {
              style: { boxShadow: "0px -10px 10px 5px #8686862d", zIndex: 10 },
            })}
        >
          <Divider />
          <Button
            autoContrast
            leftSection={<IconPlus />}
            hiddenFrom="xs"
            onClick={() =>
              setSearchParams(
                (prev) => {
                  prev.set("create", "");
                  return prev;
                },
                {
                  replace: true,
                }
              )
            }
          >
            {createTitle}
          </Button>
          <Collapse in={totalCount > itemsPerPage}>
            <Pagination.Root
              siblings={1}
              total={
                totalCount > itemsPerPage
                  ? Math.ceil(totalCount / itemsPerPage)
                  : 1
              }
              value={activePage}
              onChange={(value) => {
                setPage(value);

                scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });

                setSearchParams(
                  (prev) => {
                    if (value === 1) {
                      prev.delete("offset");
                    } else {
                      prev.set(
                        "offset",
                        ((value - 1) * itemsPerPage).toString()
                      );
                    }
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
        </Stack>
      </Flex>
      {/* </InfoView> */}
    </>
  );
}
