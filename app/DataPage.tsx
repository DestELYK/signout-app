/**
 * DataPage Component
 *
 * A reusable page layout component for displaying data with tabbed navigation.
 * Provides consistent structure for listing and managing different data types
 * with optional create functionality.
 *
 *
 * @module DataPage
 *
 * @author Kyle Dunn
 */

import { ActionIcon, Button, Flex } from "@mantine/core";
import { upperFirst } from "@mantine/hooks";
import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import TabbedContentView from "./components/TabbedContentView";
import TitlePage from "./components/TitlePage";

/**
 * Props for the DataPage component
 */
export interface DataPageProps {
  /** Base path for navigation */
  path: string;
  /** Page title to display */
  title: string;
  /** Available tabs for navigation */
  tabs: string[];
  /** Label for the create button */
  createLabel?: string;
  /** Handler for create button click */
  onCreateClick?: () => void;
}

/**
 * A reusable data page layout component that provides tabbed navigation
 * and optional create functionality for data management pages.
 *
 * @param props - The component props
 * @returns The rendered data page layout
 */
export default function DataPage({
  path,
  title,
  tabs,
  createLabel = "New",
  onCreateClick,
}: DataPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  /** Determine current active tab based on URL location */
  let currentLocation = tabs.find((tab) => location.pathname.includes(tab)) || tabs[0];

  if (currentLocation === path) {
    currentLocation = tabs[0];
  }

  /**
   * Handle tab navigation changes
   * @param value - The selected tab value
   */
  const handleTabChange = (value: string | null) => {
    if (!value || value === tabs[0]) {
      navigate(`/${path}`, { replace: true, relative: "route" });
    } else if (currentLocation !== value) {
      navigate(`/${path}/${value}`, { replace: true });
    }
  };

  /** Create button section (responsive design) */
  const rightSection = createLabel && onCreateClick && (
    <>
      <ActionIcon onClick={onCreateClick} size="input-sm" color="blue" hiddenFrom="sm">
        <IconPlus />
      </ActionIcon>
      <Button onClick={onCreateClick} color="blue" visibleFrom="sm">
        {createLabel}
      </Button>
    </>
  );

  return (
    <Flex pos="relative" w="100%" h="calc(100dvh - 60px)" direction="column">
      <div
        style={{
          position: "sticky",
          top: 60,
          zIndex: 10,
          backgroundColor: "var(--mantine-color-body)",
          boxShadow: "var(--mantine-shadow-sm)",
        }}
      >
        <TitlePage title={title} rightSection={rightSection} withDivider={false} />
        <TabbedContentView
          tabs={tabs.map((tab) => ({ value: tab, label: upperFirst(tab) }))}
          current={currentLocation}
          onChange={handleTabChange}
        />
      </div>
      <Outlet />
    </Flex>
  );
}
