import {
  ActionIcon,
  Button,
  Card,
  CloseButton,
  Divider,
  Flex,
  FocusTrap,
  Group,
  Loader,
  Modal,
  Pagination,
  ScrollArea,
  SegmentedControl,
  Space,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useNavigation, useSearchParams } from "@remix-run/react";
import { IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import InfoView from "./InfoView";
import QrButton from "./qrCode/QrButton";

const ITEMS_PER_PAGE = 15;

// TODO - implement importing and exporting data
// TODO - allow filtering the list

export interface ListViewProps<T extends { id: number }> {
  title: string;
  createTitle?: string;
  createSection?: React.ReactNode;
  itemsPerPage: number;
  data: {
    [value: string]: { label: string; items: T[] };
  };
  children: (item: T, query?: string, qrCode?: string) => React.ReactNode;
}

export default function ListView<T extends { id: number }>({
  title,
  createTitle,
  createSection,
  itemsPerPage = ITEMS_PER_PAGE,
  data,
  children,
}: ListViewProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const [filterOpened, { toggle: toggleFilter }] = useDisclosure(false);
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

  const filteredItems = items.slice(
    (activePage - 1) * itemsPerPage,
    (activePage - 1) * itemsPerPage + itemsPerPage
  );

  const controlData = Object.keys(data).map((key) => {
    return {
      value: key,
      label: `${data[key].label} (${data[key].items.length})`,
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
    setPage(1);
  }, [value]);

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
        size="95%"
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
      <InfoView
        title={title}
        collapseSection={
          <>
            <Flex w="100%" direction="row" align="center" gap={0}>
              <FocusTrap active={collapseOpened}>
                <TextInput
                  w="100%"
                  rightSection={
                    navigation.location &&
                    new URLSearchParams(navigation.location.search).has("q") ? (
                      <Loader size="xs" />
                    ) : (
                      form.values.query.length !== 0 && (
                        <CloseButton
                          onClick={() =>
                            updateSearch({ query: "", qrCode: "" })
                          }
                        />
                      )
                    )
                  }
                  placeholder="Search for loan by item or person's name"
                  {...form.getInputProps("query")}
                  onChange={(event) => {
                    updateSearch({
                      query: event.currentTarget.value,
                      qrCode: "",
                    });
                  }}
                  ref={queryRef}
                />
              </FocusTrap>
              <QrButton
                onResult={(result) =>
                  updateSearch({ query: "", qrCode: result.data })
                }
              />
            </Flex>
            {form.values.qrCode.length !== 0 && (
              <Flex
                w="100%"
                mt="sm"
                direction="row"
                align="center"
                justify="center"
              >
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
          </>
        }
        collapseOpen={collapseOpened}
        rightSection={
          <ActionIcon
            variant="subtle"
            color="gray"
            autoContrast
            onClick={() => {
              if (!collapseOpened) {
                openCollapse();

                queryRef.current?.focus();
              } else {
                updateSearch({ query: "", qrCode: "" });
                closeCollapse();
              }
            }}
          >
            {collapseOpened ? <IconX /> : <IconSearch />}
          </ActionIcon>
        }
      >
        <>
          <Flex direction="column" wrap="nowrap">
            <Flex direction="row" align="center" gap="xs" mb="sm" wrap="nowrap">
              <SegmentedControl
                w="100vw"
                data={controlData}
                value={value}
                onChange={(value) => {
                  setSearchParams(
                    (prev) => {
                      if (value == Object.keys(data)[0]) {
                        prev.delete("display");
                      } else {
                        prev.set("display", value);
                      }
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
            <Button
              mb="sm"
              variant="outline"
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
          </Flex>
          <ScrollArea.Autosize
            type="always"
            scrollbars="y"
            viewportRef={scrollRef}
            px="xs"
            pb="xs"
            offsetScrollbars={"y"}
          >
            <Card withBorder p="sm">
              {items.length > 0 ? (
                filteredItems.map((item) => (
                  <Card.Section key={item.id} inheritPadding withBorder py="sm">
                    {children(item, form.values.query, form.values.qrCode)}
                  </Card.Section>
                ))
              ) : (
                <div className="h-full w-full">No Outstanding Loans</div>
              )}
            </Card>
          </ScrollArea.Autosize>
          {filteredItems.length < itemsPerPage && <Space mb="auto" />}
          {items.length > itemsPerPage && (
            <>
              <Divider />
              <Pagination.Root
                mt="md"
                siblings={1}
                px="sm"
                total={
                  items.length > itemsPerPage
                    ? Math.ceil(items.length / itemsPerPage)
                    : items.length
                }
                value={activePage}
                onChange={(value) => {
                  setPage(value);

                  scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <Group gap={5} justify="center">
                  <Pagination.Previous />
                  <Pagination.Items />
                  <Pagination.Next />
                </Group>
              </Pagination.Root>
            </>
          )}
        </>
      </InfoView>
    </>
  );
}
