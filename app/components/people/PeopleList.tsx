/**
 * PeopleList Component
 *
 * A specialized list component for displaying collections of people
 * in the signout system. Wraps the generic ListView with person-specific
 * rendering and provides people-focused features.
 *
 *
 * @module PeopleList
 *
 * @author Kyle Dunn
 */

import { useNavigation } from "@remix-run/react";
import { PersonData } from "~/utils/types.server";
import ListView, { ListViewProps } from "../base/ListView";
import PersonListView from "./PersonListView";

/**
 * Props for the PeopleList component
 */
export interface PeopleListProps {
  /** Whether to hide role information in the list */
  hideRole?: boolean;
}

/**
 * A specialized list component for person data display
 * Provides person-specific rendering with search and pagination
 *
 * @param props - The component props including list configuration and person-specific options
 * @returns The rendered people list component
 */
export default function PeopleList({
  hideRole = false,
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
}: PeopleListProps & Omit<ListViewProps<PersonData>, "children" | "loading">) {
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
      {(person, query) => {
        return (
          // Render each person with highlighting and role control
          <PersonListView
            key={person.id}
            person={person}
            query={query}
            hideRole={hideRole}
            showChevron={orientation !== "horizontal"}
          />
        );
      }}
    </ListView>
  );
}
