/**
 * Item timeline route displaying chronological history of item loans and returns
 *
 * This route provides a timeline view for item history including:
 * - Chronological display of all loan events
 * - Visual timeline with loan sign-out and sign-in events
 * - Color-coded timeline items based on event type
 * - Integration with item loan history data
 * - Error handling for missing items or loan data
 *
 * @requires DateTimeline component for timeline visualization
 * @requires Item and loan data integration
 * @inherits item data from parent items_.$itemId route
 *
 * @module routes/items/$itemId/timeline
 *
 * @author Kyle Dunn
 */

import { LoaderFunctionArgs } from "@remix-run/node";
import dayjs from "dayjs";
import { useTypedLoaderData, useTypedRouteLoaderData } from "remix-typedjson";
import DateTimeline, { TimelineItemValues } from "~/components/DateTimeline";
import { getItemById } from "~/lib/items.server";
import { getLoanedItems } from "~/lib/loans.server";
import { INVALID_STATUS_IDS } from "~/utils/consts";
import { loader as itemLoader } from "./items_.$itemId";

/**
 * Server-side loader function for item timeline data
 * Fetches loan history for the specific item and builds timeline events
 *
 * @param params - Route parameters containing itemId
 * @returns JSON response with timeline data or error information
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  // Fetch loan history for the item
  const loanedItemsResult = await getLoanedItems(undefined, params.itemId);

  if (loanedItemsResult.error) {
    return { error: loanedItemsResult.error, loanedItems: undefined };
  } else if (!loanedItemsResult.data) {
    return { error: "No loaned items found", loanedItems: undefined };
  }

  // Verify item exists
  const item = await getItemById(params.itemId);

  if (item.error) {
    return { error: item.error, loanedItems: undefined };
  } else if (!item.data) {
    return { error: "Item not found", loanedItems: undefined };
  }

  // Build timeline events from loan data
  const loanedItems: TimelineItemValues[] = [];
  if (loanedItemsResult.data.length > 0) {
    // Create timeline items for returned loans (sign-in events)
    const returnedItems: TimelineItemValues[] = loanedItemsResult.data
      .filter((l) => l.dateReturned !== null)
      .map((l) => ({
        id: l.loanId,
        date: l.dateReturned!,
        label: `Loan #${l.loanId} - Sign-In`,
        type: "sign-in",
        color: "green",
        line: "solid",
      }));

    // Create timeline items for loan creation (sign-out events)
    const loans: TimelineItemValues[] = loanedItemsResult.data.map((l) => ({
      id: l.loanId,
      date: l.dateLoaned!,
      label: `Loan #${l.loanId} - Sign-Out`,
      type: "sign-out",
      color: "red",
      line: "dotted",
    }));

    loanedItems.push(...loans, ...returnedItems);

    const lastLoan = loanedItems.pop();

    loanedItems.push({
      id: loanedItems.length,
      date: new Date(),
      label:
        loanedItemsResult.data.length > 0
          ? `Loan #${lastLoan?.id} - ${item.data.status?.name ?? "Unknown"}`
          : "Available",
      type:
        loanedItemsResult.data.length > 0
          ? INVALID_STATUS_IDS.includes(item.data.status?.id ?? "")
            ? "invalid"
            : item.data.status?.id ?? "unknown"
          : "available",
      color: item.data.status?.color ?? "gray",
      line: "solid",
    });
  } else {
    loanedItems.push({
      id: loanedItems.length,
      date: new Date(),
      label: "Available",
      type: "available",
      color: "green",
      line: "solid",
    });
  }

  loanedItems.unshift({
    id: -1,
    date: item.data.createdDate!,
    label: "Item Added",
    type: "created",
    color: "blue",
    line: "solid",
  });

  return {
    loanedItems: loanedItems.sort((a, b) => {
      return dayjs(a.date).diff(b.date);
    }),
    error: undefined,
  };
};

export default function Page() {
  const parentData = useTypedRouteLoaderData<typeof itemLoader>(`routes/items_.$itemId`);
  const data = useTypedLoaderData<typeof loader>();

  const orderedLoans: TimelineItemValues[] = data.loanedItems ?? [];

  return (
    orderedLoans.length > 0 && (
      <DateTimeline
        href="/loans"
        items={orderedLoans}
        active={
          orderedLoans.length -
          (orderedLoans[orderedLoans.length - 1].label !== "Available" ? 2 : 1)
        }
      />
    )
  );
}
