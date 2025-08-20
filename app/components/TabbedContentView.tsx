/**
 * TabbedContentView Component
 *
 * A responsive tabbed navigation component that adapts between
 * traditional tabs on desktop and segmented control on mobile.
 * Provides consistent navigation experience across different screen sizes.
 *
 *
 * @module TabbedContentView
 *
 * @author Kyle Dunn
 */

import { Collapse, MantineStyleProps, ScrollArea, SegmentedControl, Tabs } from "@mantine/core";
import React from "react";

/**
 * Props for the TabbedContentView component
 */
export interface TabbedContentViewProps {
  /** Width of the component */
  w?: MantineStyleProps["w"];
  /** Height of the component */
  h?: MantineStyleProps["h"];
  /** Array of tab configurations */
  tabs: {
    value: string;
    label: string | React.ReactNode;
    disabled?: boolean;
  }[];
  /** Currently active tab value */
  current?: string | null;
  /** Whether to hide the tab bar */
  hideTabs?: boolean;
  /** Whether tabs are disabled */
  disabled?: boolean;
  /** Callback when tab selection changes */
  onChange: (value: string | null) => void;
}

/**
 * A responsive tabbed navigation component with desktop/mobile adaptations
 *
 * @param props - The component props
 * @returns The rendered tabbed content view
 */
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
      {/* Desktop tabs with horizontal scroll support */}
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
      {/* Mobile segmented control with horizontal scroll */}
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
