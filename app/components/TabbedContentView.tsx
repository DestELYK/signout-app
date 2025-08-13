import { Collapse, MantineStyleProps, ScrollArea, SegmentedControl, Tabs } from "@mantine/core";
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
    hideTabs?: boolean;
    disabled?: boolean;
    onChange: (value: string | null) => void;
}

export default function TabbedContentView({
    w = "100%",
    h = "100%",
    tabs,
    current,
    hideTabs = false,
    disabled,
    onChange,
}: TabbedContentViewProps) {
    return (
        <Collapse in={!hideTabs}>
            <Tabs w="100%" visibleFrom="md" value={current || tabs[0].value} onChange={onChange}>
                <ScrollArea w="100%" type="auto" scrollbars="x">
                    <Tabs.List style={{ flexWrap: "nowrap" }}>
                        {tabs.map((tab) => (
                            <Tabs.Tab key={tab.value} disabled={disabled} value={tab.value}>
                                {tab.label}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                </ScrollArea>
            </Tabs>
            <ScrollArea w="100%" mih={40} type="auto" scrollbars="x" hiddenFrom="md">
                <SegmentedControl
                    w="100%"
                    disabled={disabled}
                    value={current || tabs[0].value}
                    onChange={onChange}
                    data={tabs}
                />
            </ScrollArea>
        </Collapse>
    );
}
