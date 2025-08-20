/**
 * Tags index route providing tag listing and category filtering
 *
 * This route provides the default tags listing interface with:
 * - Responsive layout with desktop/mobile variants
 * - Category-based tag filtering with segmented control
 * - Search-enabled tag listing with highlighting
 * - Tag navigation with usage count display
 * - Mobile-first tag list with pagination
 *
 * @requires ListView component for tag display
 * @requires Mantine SegmentedControl for category filtering
 * @requires useDesktopOnly hook for responsive behavior
 *
 * @module routes/tags._index
 *
 * @author Kyle Dunn
 */

import {
  Box,
  Card,
  Center,
  Flex,
  Highlight,
  Loader,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { IconChevronRight } from "@tabler/icons-react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ListView from "~/components/base/ListView";
import { useDesktopOnly } from "~/lib/hooks";
import { loader as tagsLoader } from "./tags";

/**
 * Tags index page component
 * Provides responsive tag listing with category filtering
 *
 * @returns JSX element containing tag list or desktop placeholder
 */
export default function Page() {
  // Get tags data from parent route loader
  const data = useTypedRouteLoaderData<typeof tagsLoader>("routes/tags");
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  // Hook for responsive behavior detection
  const desktopOnly = useDesktopOnly();

  /**
   * Handles category filter changes in segmented control
   * @param value - Selected category value or "all" for no filter
   */
  const onChange = (value: string) => {
    setSearchParams(
      (prev) => {
        if (value === "all") {
          prev.delete("category");
        } else {
          prev.set("category", value);
        }

        return prev;
      },
      { replace: true }
    );
  };

  return desktopOnly ? (
    // Desktop: Placeholder card when no tag is selected
    <Card w="100%" h="100%" withBorder>
      <Center w="100%" h="100%">
        <Text c="dimmed">No tag selected</Text>
      </Center>
    </Card>
  ) : desktopOnly === undefined || data === undefined ? (
    // Loading state with spinner and text
    <Stack w="100%" h="100%" justify="center" align="center">
      <Loader />
      <Text className="loading-text">Loading</Text>
    </Stack>
  ) : (
    // Mobile: Tag list view with category filtering and search
    <Stack w="100%" p="md">
      {/* Category filter controls */}
      <Box w="100%" h={40}>
        <ScrollArea w="100%" type="always" scrollbars="x" offsetScrollbars="x">
          <SegmentedControl
            w="100%"
            mih={40}
            fullWidth
            data={[
              {
                value: "all",
                label: "All",
              },
              // Dynamic categories from loader data
              ...(data.categories
                ? data.categories.map((category) => {
                    return {
                      value: category.category,
                      label: category.category,
                    };
                  })
                : []),
            ]}
            value={searchParams.get("category") ?? "all"}
            onChange={(value) => onChange(value ?? "all")}
          />
        </ScrollArea>
      </Box>
      <ListView
        w="100%"
        initialItemsPerPage={30}
        data={data.tags}
        showPagination={false}
        withQRCode={false}
        searchPlaceholder="Search for tags..."
        emptyText="No tags found"
      >
        {(tag, query) => (
          <UnstyledButton
            className="list-item"
            w="100%"
            h="100%"
            onClick={() => navigate(`/tags/${tag.id}`)}
            p="xs"
          >
            <Flex direction="row" align="center" justify="space-between">
              <Highlight highlight={query ? query.split(" ") : ""}>{tag.name}</Highlight>
              <IconChevronRight />
            </Flex>
          </UnstyledButton>
        )}
      </ListView>
    </Stack>
  );
}
