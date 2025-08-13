import { useNavigation } from "@remix-run/react";
import { ItemData } from "~/utils/types.server";
import ListView, { ListViewProps } from "../base/ListView";
import ItemListView from "./ItemListView";

export interface ItemListProps extends Omit<ListViewProps<ItemData>, "children" | "loading"> {
    displayQRCode?: boolean;
}

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
                    <ItemListView
                        key={item.id}
                        data={item}
                        highlight={query}
                        displayQRCode={displayQRCode}
                    />
                );
            }}
        </ListView>
    );
}
