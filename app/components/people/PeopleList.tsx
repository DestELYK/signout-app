import { useNavigation } from "@remix-run/react";
import { PersonData } from "~/utils/types.server";
import ListView, { ListViewProps } from "../base/ListView";
import PersonListView from "./PersonListView";

export interface PeopleListProps {
    hideRole?: boolean;
}

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
            {(person, query, qrCode) => (
                <PersonListView
                    person={person}
                    query={query}
                    personId={qrCode}
                    showChevron={orientation !== "horizontal"}
                />
            )}
        </ListView>
    );
}
