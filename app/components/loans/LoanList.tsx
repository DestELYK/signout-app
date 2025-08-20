/**
 * LoanList Component
 *
 * A specialized list component for displaying collections of loans
 * in the signout system. Wraps the generic ListView with loan-specific
 * rendering and provides loan-focused features.
 *
 *
 * @module LoanList
 *
 * @author Kyle Dunn
 */

import { useNavigation } from "@remix-run/react";
import { LoanData } from "~/utils/types.server";
import ListView, { ListViewProps } from "../base/ListView";
import LoanListView from "./LoanListView";

/**
 * A specialized list component for loan data display
 * Provides loan-specific rendering with search and pagination
 *
 * @param props - The component props including list configuration and loan-specific options
 * @returns The rendered loan list component
 */
export function LoanList({
  w,
  h,
  data,
  totalCount,
  orientation,
  initialItemsPerPage,
  emptyText,
  showPagination,
  withSearch,
  withDetails,
  withOffset,
  withQRCode,
  withinParent,
}: Omit<
  ListViewProps<LoanData> & {
    /** Whether to show detailed loan information */
    withDetails?: boolean;
  },
  "children" | "loading"
>) {
  // Track navigation state for loading indicators
  const navigation = useNavigation();

  return (
    <ListView
      w={w}
      h={h}
      data={data}
      totalCount={totalCount}
      emptyText={emptyText}
      orientation={orientation}
      withSearch={withSearch}
      initialItemsPerPage={initialItemsPerPage}
      showPagination={showPagination}
      withOffset={withOffset}
      withQRCode={withQRCode}
      withinParent={withinParent}
      loading={navigation.state === "loading"}
    >
      {(item, query, qrCode) => (
        <LoanListView data={item} query={withDetails ? query : undefined} />
      )}
    </ListView>
  );
}
