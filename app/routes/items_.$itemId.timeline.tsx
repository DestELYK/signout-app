import { LoaderFunctionArgs } from "@remix-run/node";
import dayjs from "dayjs";
import { useTypedLoaderData, useTypedRouteLoaderData } from "remix-typedjson";
import DateTimeline, { TimelineItemValues } from "~/components/DateTimeline";
import { getItemById } from "~/lib/items.server";
import { getLoanedItems } from "~/lib/loans.server";
import { INVALID_STATUS_IDS } from "~/utils/consts";
import { loader as itemLoader } from "./items_.$itemId";

export const loader = async ({ params }: LoaderFunctionArgs) => {
    const loanedItemsResult = await getLoanedItems(undefined, params.itemId);

    if (loanedItemsResult.error) {
        return { error: loanedItemsResult.error, loanedItems: undefined };
    } else if (!loanedItemsResult.data) {
        return { error: "No loaned items found", loanedItems: undefined };
    }

    const item = await getItemById(params.itemId);

    if (item.error) {
        return { error: item.error, loanedItems: undefined };
    } else if (!item.data) {
        return { error: "Item not found", loanedItems: undefined };
    }

    const loanedItems: TimelineItemValues[] = [];
    if (loanedItemsResult.data.length > 0) {
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
