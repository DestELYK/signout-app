/**
 * ItemList Component
 *
 * A specialized list component for displaying collections of items
 * in the signout system. Wraps the generic ListView with item-specific
 * rendering and provides item-focused features.
 *
 *
 * @module ItemList
 *
 * @author Kyle Dunn
 */

import { useNavigation } from "@remix-run/react";
import { ItemData } from "~/utils/types.server";
import ListView, { ListViewProps } from "../base/ListView";
import ItemListView from "./ItemListView";

/**
 * Props for the ItemList component
 */
export interface ItemListProps extends Omit<ListViewProps<ItemData>, "children" | "loading"> {
  /** Whether to display QR codes for items */
  displayQRCode?: boolean;
}

/**
 * A specialized list component for item data display
 * Provides item-specific rendering with search and pagination
 *
 * @param props - The component props
 * @returns The rendered item list component
 */
export default function ItemList({
  w,
  h,
  data,
  totalCount,
  orientation,
  initialItemsPerPage,
  emptyText,
  showPagination,
  withSearch,
  withOffset,
  withQRCode,
  withinParent,
  displayQRCode,
}: ItemListProps) {
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
      withinParent={withinParent}
      withQRCode={withQRCode}
      loading={navigation.state === "loading"}
    >
      {(item, query, qrCode) => {
        return (
          // Render each item with highlighting and QR code support
          <ItemListView key={item.id} data={item} highlight={query} displayQRCode={displayQRCode} />
        );
      }}
    </ListView>
  );
}
