/**
 * DetailsPage Component
 *
 * A reusable page layout component for displaying information with:
 * - Title and header section with action buttons (Edit/Delete)
 * - Tabbed navigation for different views
 * - Responsive design (desktop with side panel, mobile -width)
 * - Tag display support
 * - Banner text for important notifications
 * - Custom desktop component support
 *
 * Used by items, loans, people detail pages to maintain consistent layout
 *
 *
 * @author Kyle Dunn
 */

import {
  ActionIcon,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  ScrollArea,
  Text,
} from "@mantine/core";
import { Outlet, useLocation, useNavigate, useNavigation } from "@remix-run/react";
import { IconEdit, IconInfoCircle, IconTrash } from "@tabler/icons-react";
import TabbedContentView from "./components/TabbedContentView";
import TagGroup, { TagGroupProps } from "./components/tags/TagGroup";
import TitlePage from "./components/TitlePage";

/**
 * Props for the DetailsPage component
 */
export interface DetailsPageProps {
  /** Data configuration for tabs - defines available tabs and their properties */
  data: {
    [value: string]: {
      /** Display name for the tab */
      label: string;
      /** Icon to show in tab */
      icon: React.ReactNode;
      /** Whether tab is disabled */
      disabled?: boolean;
      /** Optional count to show in tab label */
      count?: number;
    };
  };
  /** Optional content above the title */
  topSection?: React.ReactNode;
  /** Tags to display below title */
  tags?: TagGroupProps["tags"];
  /** Page title */
  title?: string;
  /** Warning/info banner text */
  bannerText?: string;
  /** Content for desktop left panel */
  desktopComponent?: React.ReactNode;
  /** Whether actions are disabled */
  disabled?: boolean;
  /** Delete action handler */
  handleDelete: () => void;
  /** The route type to navigate to when a tag is clicked */
  tagsRedirectRoute?: "items" | "loans" | "people" | "tag";
}

/**
 * A reusable detail page layout component that provides consistent structure
 * for displaying entity details with tabbed navigation, edit/delete actions,
 * and responsive design.
 *
 * @param props - The component props
 * @returns The rendered detail page layout
 */
export default function DetailsPage({
  data,
  tags,
  title = "Unknown",
  bannerText,
  topSection,
  desktopComponent,
  disabled,
  handleDelete,
  tagsRedirectRoute = "tag",
}: DetailsPageProps) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const location = useLocation();

  /** Check if we're in edit mode based on URL path */
  const editing = location.pathname.endsWith("/edit");

  const keys = Object.keys(data);

  /** Determine which tab is currently active based on URL */
  let value = keys[0];

  keys.forEach((key) => {
    if (location.pathname.includes(`/${key}`)) {
      value = key;
    }
  });

  /**
   * Handle tab navigation changes
   * @param value - The selected tab value
   */
  function onChange(value?: string | null) {
    switch (value) {
      case "overview":
        navigate(`.`, {
          replace: true,
          relative: "route",
        });
        break;
      default:
        navigate(`./${value}`, {
          replace: true,
          relative: "route",
        });
        break;
    }
  }

  /** Action buttons for the header (Edit/Delete or Cancel when editing) */
  const rightSection = (
    <Group justify="end" gap="xs">
      {editing ? (
        <Button
          h={40}
          disabled={disabled}
          variant="outline"
          onClick={() => {
            navigate(`.`, { replace: true, relative: "route" });
          }}
        >
          Cancel
        </Button>
      ) : (
        <>
          <Button
            h={40}
            disabled={disabled}
            visibleFrom="md"
            variant="outline"
            onClick={() => {
              navigate(`edit`, { relative: "route" });
            }}
          >
            Edit
          </Button>
          <ActionIcon
            size={40}
            disabled={disabled}
            hiddenFrom="md"
            onClick={() => {
              navigate(`edit`, { relative: "route" });
            }}
          >
            <IconEdit />
          </ActionIcon>
          <Button
            h={40}
            disabled={disabled}
            visibleFrom="md"
            variant="outline"
            color="red"
            onClick={handleDelete}
          >
            Delete
          </Button>
          <ActionIcon
            size={40}
            disabled={disabled}
            color="red"
            hiddenFrom="md"
            onClick={handleDelete}
          >
            <IconTrash />
          </ActionIcon>
        </>
      )}
    </Group>
  );

  return (
    <>
      <Flex pos="relative" w="100%" h="100%" direction="column" visibleFrom="md">
        <div
          style={{
            position: "sticky",
            top: 60,
            zIndex: 10,
            backgroundColor: "var(--mantine-color-body)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <TitlePage
            title={title}
            rightSection={rightSection}
            topSection={topSection}
            withDivider={bannerText === undefined}
            bottomSection={
              tags && (
                <TagGroup
                  tags={tags}
                  groupProps={{ justify: "start" }}
                  clickable
                  redirectRoute={tagsRedirectRoute}
                />
              )
            }
          />
          {bannerText && (
            <>
              <Divider color="red" />
              <Group p={2}>
                <IconInfoCircle size={12} color="red" />
                <Text fw="bold" size="sm" c="red" ta="center">
                  {bannerText}
                </Text>
              </Group>
              <Divider color="red" />
            </>
          )}
        </div>
        <Flex pos="relative" w="100%" h="100%" justify="stretch" direction="row" p="sm" gap="sm">
          <Box pos="relative" w="100%">
            {desktopComponent}
          </Box>
          <Card
            pos="relative"
            miw={{ base: 500, lg: 600, xl: 700 }}
            h="100%"
            withBorder
            padding={0}
          >
            <TabbedContentView
              h="100%"
              tabs={keys.map((key) => ({
                value: key,
                label: data[key].label + (data[key].count ? ` (${data[key].count})` : ""),
                disabled: data[key].disabled,
              }))}
              hideTabs={editing}
              current={value}
              onChange={onChange}
              disabled={disabled}
            />
            <Box w="100%" h="100%" pos="relative">
              <ScrollArea w="100%" h="100%" type="auto" scrollbars="y" pos="absolute">
                <Outlet />
              </ScrollArea>
            </Box>
          </Card>
        </Flex>
      </Flex>
      <Flex direction="column" hiddenFrom="md">
        <div
          style={{
            position: "sticky",
            top: 60,
            zIndex: 10,
            backgroundColor: "var(--mantine-color-body)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <TitlePage
            title={title}
            rightSection={rightSection}
            topSection={topSection}
            bottomSection={
              tags && (
                <TagGroup
                  tags={tags}
                  groupProps={{ justify: "start" }}
                  clickable
                  redirectRoute={tagsRedirectRoute}
                />
              )
            }
            withDivider={false}
          />
          <TabbedContentView
            h="100%"
            tabs={keys.map((key) => ({
              value: key,
              label: data[key].label + (data[key].count ? ` (${data[key].count})` : ""),
              disabled: data[key].disabled,
            }))}
            hideTabs={editing}
            current={value}
            onChange={onChange}
            disabled={disabled}
          />
          <Divider />
        </div>
        <Outlet />
      </Flex>
    </>
  );
}
