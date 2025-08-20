/**
 * Tag details index route displaying tag information
 *
 * This route provides the default view for individual tags with:
 * - Tag category and usage statistics
 * - Item count and relationship statistics
 * - Loan count and tag usage analytics
 * - Error handling for missing tags
 * - Interactive statistics display
 *
 * @requires StatView component for statistics display
 * @requires Mantine Group, Stack, Text components for layout
 * @inherits tag data from parent tags.$tagId route
 *
 * @module routes/tags/$tagId/_index
 *
 * @author Kyle Dunn
 */

import { Group, Space, Stack, Text } from "@mantine/core";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import StatView from "~/components/StatView";
import { loader } from "./tags.$tagId";

/**
 * Tag details index page component
 * Displays comprehensive tag statistics and category information
 *
 * @returns JSX element containing tag details or null for missing data
 */
export default function Page() {
  // Get tag data from parent route loader
  const data = useTypedRouteLoaderData<typeof loader>("routes/tags.$tagId");
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Calculate category statistics for context
  const category = data
    ? {
        name: data.tag?.category ?? "Unknown",
        count: data.categoryCount?.find((c) => c.category === data.tag?.category)?.count ?? 0,
      }
    : undefined;

  return (
    data &&
    data.tag && (
      <Stack h="100%">
        {/* Tag category information with total count */}
        {category && (
          <Text>
            <b>Category: </b>
            {category.name}
            <Text
              span
              c="dimmed"
              size="xs"
              onClick={() =>
                setSearchParams(
                  (prev) => {
                    prev.set("category", category.name);
                    return prev;
                  },
                  { replace: true }
                )
              }
              style={{ cursor: "pointer" }}
            >
              {/* Clickable category count for filtering */}
              {` (${category.count} tags)`}
            </Text>
          </Text>
        )}
        {/* Tag priority information */}
        <Text>
          <b>Priority: </b>
          {`${data.tag.priority}`}
        </Text>
        {/* Tag visibility status */}
        <Text>
          <b>Hidden: </b>
          {data.tag.hidden ? "Yes" : "No"}
        </Text>
        <Space mt="auto" />
        {/* Tag usage statistics group */}
        <Group>
          {/* Items count statistic with navigation */}
          {data.itemCount && data.itemCount > 0 && (
            <StatView label="Items" value={data.itemCount} onClick={() => navigate("/items")} />
          )}
          {/* Loans count statistic with navigation */}
          {data.loanCount && data.loanCount > 0 && (
            <StatView label="Loans" value={data.loanCount} onClick={() => navigate("/loans")} />
          )}
          {/* People count statistic with navigation */}
          {data.personCount && data.personCount > 0 && (
            <StatView label="People" value={data.personCount} onClick={() => navigate("/people")} />
          )}
        </Group>
      </Stack>
    )
  );
}
