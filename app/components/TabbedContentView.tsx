import { Box, MantineStyleProps, ScrollArea, SegmentedControl, Stack, Tabs } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import React from "react";

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
    h = "100%",
    tabs,
    current,
    children,
    onChange,
}: TabbedContentViewProps) {
    const { ref: tabListRef, height: tabListHeight } = useElementSize();

    return (
        <Stack w={w} h={h} align="stretch" gap="sm" style={{ overflowY: "hidden" }}>
            <div ref={tabListRef}>
                <Tabs
                    w="100%"
                    visibleFrom="md"
                    value={current || tabs[0].value}
                    onChange={onChange}
                >
                    <ScrollArea w="100%" type="auto" scrollbars="x" offsetScrollbars="x">
                        <Tabs.List style={{ flexWrap: "nowrap" }}>
                            {tabs.map((tab) => (
                                <Tabs.Tab key={tab.value} value={tab.value}>
                                    {tab.label}
                                </Tabs.Tab>
                            ))}
                        </Tabs.List>
                    </ScrollArea>
                </Tabs>
                <ScrollArea
                    w="100%"
                    mih={40}
                    type="auto"
                    scrollbars="x"
                    offsetScrollbars="x"
                    hiddenFrom="md"
                >
                    <SegmentedControl
                        w="100%"
                        value={current || tabs[0].value}
                        onChange={onChange}
                        data={tabs}
                    />
                </ScrollArea>
            </div>
            <Box w="100%" h={`calc(100% - ${tabListHeight + 12}px)`}>
                {children}
            </Box>
        </Stack>
    );
}
