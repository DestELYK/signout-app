/**
 * Locations index route providing location listing and navigation
 *
 * This route provides the default locations listing interface with:
 * - Responsive layout with desktop/mobile variants
 * - Search-enabled location listing
 * - Location navigation with highlight search terms
 * - Desktop placeholder for location selection
 * - Mobile-first location list with pagination
 *
 * @requires ListView component for location display
 * @requires Mantine Card, Center, Flex, Highlight components
 * @requires useDesktopOnly hook for responsive behavior
 *
 * @module routes/locations._index
 *
 * @author Kyle Dunn
 */

import { Card, Center, Flex, Highlight, Loader, Stack, Text, UnstyledButton } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { IconChevronRight } from "@tabler/icons-react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ListView from "~/components/base/ListView";
import { useDesktopOnly } from "~/lib/hooks";
import { loader as locationsLoader } from "./locations";

/**
 * Locations index page component
 * Provides responsive location listing with desktop/mobile variants
 *
 * @returns JSX element containing location list or desktop placeholder
 */
export default function Page() {
  // Get locations data from parent route loader
  const data = useTypedRouteLoaderData<typeof locationsLoader>("routes/locations");
  const navigate = useNavigate();

  // Hook for responsive behavior detection
  const desktopOnly = useDesktopOnly();

  return desktopOnly ? (
    // Desktop: Placeholder card when no location is selected
    <Card w="100%" h="100%" withBorder>
      <Center w="100%" h="100%">
        <Text c="dimmed">No location selected</Text>
      </Center>
    </Card>
  ) : desktopOnly === undefined || data === undefined ? (
    // Loading state with spinner and text
    <Stack w="100%" h="100%" justify="center" align="center">
      <Loader />
      <Text className="loading-text">Loading</Text>
    </Stack>
  ) : (
    // Mobile: Location list view with search and navigation
    <Stack w="100%" p="md">
      <ListView
        w="100%"
        h="calc(100% - 40px)"
        initialItemsPerPage={30}
        data={data.data}
        showPagination={false}
        withQRCode={false}
        searchPlaceholder="Search for locations..."
        emptyText="No location found"
      >
        {(location, query) => (
          // Clickable location item with search highlighting
          <UnstyledButton
            className="list-item"
            w="100%"
            h="100%"
            onClick={() => navigate(`/locations/${location.id}`)}
            p="xs"
          >
            <Flex direction="row" align="center" justify="space-between">
              {/* Location name with search term highlighting */}
              <Highlight highlight={query ? query.split(" ") : ""}>{location.name}</Highlight>
              <IconChevronRight />
            </Flex>
          </UnstyledButton>
        )}
      </ListView>
    </Stack>
  );
}
