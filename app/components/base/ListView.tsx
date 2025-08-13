import {
    Box,
    Center,
    Collapse,
    Divider,
    Flex,
    Group,
    MantineStyleProps,
    Pagination,
    ScrollArea,
    Skeleton,
    Stack,
    Text,
    UnstyledButton,
} from "@mantine/core";
import { useField } from "@mantine/form";
import { useNavigation, useSearchParams } from "@remix-run/react";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { INITIAL_PAGE_SIZE } from "~/utils/consts";
import QRInputField from "./QRInputField";

// TODO - implement importing and exporting data
// TODO - allow filtering the list
// TODO - lazy load the list
// TODO - allow sorting the list
// TODO - virtual list
// TODO - selection

export interface ListViewProps<T extends { id: number }> {
    w?: MantineStyleProps["w"];
    h?: MantineStyleProps["w"];
    orientation?: "horizontal" | "vertical";
    emptyText?: string;
    data: T[] | undefined;
    totalCount?: number;
    loading?: boolean;
    withSearch?: boolean;
    initialItemsPerPage?: number;
    showPagination?: boolean;
    withOffset?: boolean;
    withQRCode?: boolean;
    searchPlaceholder?: string;
    rightSearchSection?: React.ReactNode;
    withinParent?: boolean;
    error?: string;
    children: (item: T, query?: string, qrCodeUsed?: boolean) => React.ReactNode;
}

export default function ListView<T extends { id: number }>({
    w,
    h,
    orientation = "vertical",
    emptyText = "No entries for section",
    data = [],
    totalCount = data?.length ?? 0,
    loading,
    withSearch = true,
    initialItemsPerPage = INITIAL_PAGE_SIZE,
    showPagination = true,
    withOffset = true,
    rightSearchSection,
    withQRCode = true,
    searchPlaceholder = "Search...",
    withinParent = false,
    error,
    children,
}: ListViewProps<T>) {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigation = useNavigation();

    const scrollRef = useRef<HTMLDivElement>(null);

    const [activePage, setPage] = useState(1);

    const [itemsPerPage, setItemsPerPage] = useState(
        searchParams.has("limit") ? Number(searchParams.get("limit")) : initialItemsPerPage
    );

    const filteredItems = data && data.length > itemsPerPage ? data.slice(0, itemsPerPage) : data;

    const [qrCodeUsed, setQRCodeUsed] = useState(false);

    const searchField = useField({
        initialValue: "",
        clearErrorOnChange: true,
        validateOnBlur: false,
        validateOnChange: true,
        validate: (value) => {
            const result = z
                .string()
                .regex(/^[a-zA-Z0-9-_\s]+$|^$/)
                .max(100)
                .safeParse(value);

            if (!result.success) {
                return "Invalid search query";
            }
        },
    });

    const searchQuery = searchParams.get("qrCode") || searchParams.get("q");
    useEffect(() => {
        searchField.setValue(searchQuery || "");
    }, [searchQuery]);

    const searchPage = searchParams.get("page");
    useEffect(() => {
        if (searchPage) setPage(Number(searchPage) + 1);
    }, [searchPage]);

    const searchLimit = searchParams.get("limit");
    useEffect(() => {
        if (searchLimit) setItemsPerPage(Number(searchLimit));
    }, [searchLimit]);

    return (
        <Flex pos="relative" w={w} h={h} direction="column" align="center">
            {withSearch && (
                <Stack w="100%" gap={0}>
                    <QRInputField
                        icon={<IconSearch />}
                        withQRCode={withQRCode}
                        placeholder={searchPlaceholder}
                        rightSection={rightSearchSection}
                        loading={
                            navigation.location &&
                            new URLSearchParams(navigation.location.search).has("q")
                        }
                        value={searchField.getValue()}
                        onScan={(result) => {
                            setQRCodeUsed(true);
                            searchField.setValue(result.data);
                            setSearchParams(
                                (prev) => {
                                    prev.set("qrCode", result.data);
                                    prev.delete("q");
                                    return prev;
                                },
                                { replace: true }
                            );
                        }}
                        onClear={() => {
                            setQRCodeUsed(false);
                            searchField.setValue("");
                            setSearchParams(
                                (prev) => {
                                    prev.delete("qrCode");
                                    prev.delete("q");
                                    return prev;
                                },
                                { replace: true }
                            );
                        }}
                        error={searchField.error}
                        onChange={(value) => {
                            setQRCodeUsed(false);
                            searchField.setValue(value);

                            searchField.validate().then(() => {
                                setSearchParams(
                                    (prev) => {
                                        prev.delete("qrCode");
                                        if (!value || value === "") {
                                            prev.delete("q");
                                        } else {
                                            prev.set("q", value);
                                        }

                                        return prev;
                                    },
                                    { replace: true }
                                );
                            });
                        }}
                    />
                    {filteredItems.length > 0 && <Divider my="sm" />}
                </Stack>
            )}
            <Box w="100%" h="100%" pos="relative">
                {error !== undefined && error.length > 0 ? (
                    <Center w="100%" h="100%">
                        <Text c="error">{error}</Text>
                    </Center>
                ) : filteredItems.length === 0 && (data !== undefined || !loading) ? (
                    <Center w="100%" h="100%" p="xl">
                        <Text>{emptyText}</Text>
                    </Center>
                ) : orientation === "horizontal" ? (
                    <ScrollArea
                        pos={withinParent ? "absolute" : undefined}
                        w="100%"
                        h="100%"
                        type="auto"
                        scrollbarSize={20}
                        scrollbars="x"
                        offsetScrollbars={withOffset ? "x" : undefined}
                        viewportRef={scrollRef}
                    >
                        <Flex
                            h="100%"
                            direction="row"
                            justify="center"
                            align="stretch"
                            wrap="nowrap"
                        >
                            {data === undefined || loading
                                ? Array(initialItemsPerPage)
                                      .fill(0)
                                      .map((_, index) => (
                                          <Group key={index}>
                                              {index !== 0 && <Divider orientation="vertical" />}
                                              <Skeleton w={100} />
                                          </Group>
                                      ))
                                : filteredItems.length > 0 &&
                                  filteredItems.map((item, index) => (
                                      <Flex
                                          direction="row"
                                          key={item.id}
                                          justify="center"
                                          align="stretch"
                                          pos="relative"
                                      >
                                          {index !== 0 && <Divider orientation="vertical" />}
                                          {children(item, searchField.getValue(), qrCodeUsed)}
                                      </Flex>
                                  ))}
                            {!showPagination && data.length > itemsPerPage && (
                                <>
                                    <Divider h="100%" orientation="vertical" />
                                    <UnstyledButton
                                        className="list-item"
                                        w="100%"
                                        onClick={() =>
                                            setItemsPerPage((itemsPerPage) =>
                                                Math.min(totalCount, itemsPerPage + 10)
                                            )
                                        }
                                        p="sm"
                                    >
                                        <Text miw={100} c="dimmed" size="sm" ta="center">
                                            Tap to view more entries
                                        </Text>
                                    </UnstyledButton>
                                </>
                            )}
                        </Flex>
                    </ScrollArea>
                ) : (
                    <ScrollArea
                        pos={withinParent ? "absolute" : undefined}
                        w="100%"
                        h="100%"
                        type="auto"
                        scrollbars="y"
                        offsetScrollbars={withOffset ? "y" : undefined}
                        viewportRef={scrollRef}
                    >
                        <Flex
                            w="100%"
                            direction="column"
                            justify="center"
                            align="stretch"
                            wrap="nowrap"
                        >
                            {data === undefined || loading
                                ? Array(initialItemsPerPage)
                                      .fill(0)
                                      .map((_, index) => (
                                          <Stack key={index}>
                                              {index !== 0 && <Divider />}
                                              <Skeleton h={100} />
                                          </Stack>
                                      ))
                                : filteredItems.length > 0 &&
                                  filteredItems.map((item, index) => (
                                      <Flex
                                          direction="column"
                                          key={item.id}
                                          justify="center"
                                          align="stretch"
                                      >
                                          {index !== 0 && <Divider w="100%" />}
                                          {children(item, searchField.getValue(), qrCodeUsed)}
                                      </Flex>
                                  ))}
                            {!showPagination && data.length > itemsPerPage && (
                                <>
                                    <Divider w="100%" />
                                    <UnstyledButton
                                        className="list-item"
                                        w="100%"
                                        onClick={() =>
                                            setItemsPerPage((itemsPerPage) =>
                                                Math.min(totalCount, itemsPerPage + 10)
                                            )
                                        }
                                        p="sm"
                                    >
                                        <Text c="dimmed" size="sm" ta="center">
                                            {data.length - itemsPerPage} more entries...
                                        </Text>
                                        <Text c="dimmed" size="sm" ta="center">
                                            Tap to view more entries
                                        </Text>
                                    </UnstyledButton>
                                </>
                            )}
                        </Flex>
                    </ScrollArea>
                )}
            </Box>
            {showPagination && (
                <Collapse w="100%" in={totalCount > itemsPerPage}>
                    <Divider mt="sm" />
                    <Pagination.Root
                        w="100%"
                        py="sm"
                        siblings={1}
                        size="sm"
                        total={totalCount > itemsPerPage ? Math.ceil(totalCount / itemsPerPage) : 1}
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
