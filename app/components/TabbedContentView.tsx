import { Box, MantineStyleProps, ScrollArea, SegmentedControl, Stack, Tabs } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import React from "react";
import { useDesktopOnly } from "~/lib/hooks";

export interface TabbedContentViewProps {
    w?: MantineStyleProps["w"];
    h?: MantineStyleProps["h"];
    tabs: {
        value: string;
        label: string | React.ReactNode;
        disabled?: boolean;
    }[];
    current?: string | null;
    children: React.ReactNode;
    onChange: (value: string | null) => void;
}

export default function TabbedContentView({
    w = "100%",
    h = "calc(100% - 60px)",
    tabs,
    current,
    children,
    onChange,
}: TabbedContentViewProps) {
    const desktopOnly = useDesktopOnly();
    const { ref: tabListRef, width: tabListWidth, height: tabListHeight } = useElementSize();

    return (
        <Stack w={w} h={h} align="stretch" gap="sm" style={{ overflowY: "hidden" }}>
            {desktopOnly ? (
                <Tabs w="100%" value={current || tabs[0].value} onChange={onChange}>
                    <ScrollArea
                        ref={tabListRef}
                        w="100%"
                        type="auto"
                        scrollbars="x"
                        offsetScrollbars="x"
                    >
                        <Tabs.List style={{ flexWrap: "nowrap" }}>
                            {tabs.map((tab) => (
                                <Tabs.Tab key={tab.value} value={tab.value}>
                                    {tab.label}
                                </Tabs.Tab>
                            ))}
                        </Tabs.List>
                    </ScrollArea>
                </Tabs>
            ) : (
                <ScrollArea w="100%" type="always" scrollbars="x" offsetScrollbars="x">
                    <SegmentedControl
                        w="100%"
                        h={40}
                        value={current || tabs[0].value}
                        onChange={onChange}
                        data={tabs}
                    />
                </ScrollArea>
            )}
            <Box w="100%" h={`calc(100% - (${tabListHeight}px + 12px))`}>
                {children}
            </Box>
        </Stack>
    );
}
