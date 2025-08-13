import { useNavigation } from "@remix-run/react";
import { LoanData } from "~/utils/types.server";
import ListView, { ListViewProps } from "../base/ListView";
import LoanListView from "./LoanListView";

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
        withDetails?: boolean;
    },
    "children" | "loading"
>) {
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
