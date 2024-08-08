import { PersonRole, Tag } from "@prisma/client";
import { useNavigation } from "@remix-run/react";
import { PersonWithTags } from "~/utils/types.server";
import { filterTags } from "~/utils/utils";
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
}: PeopleListProps &
    Omit<
        ListViewProps<
            Partial<PersonWithTags> & {
                id: number;
                firstName: string;
                lastName: string;
                nickname?: string | null;
                role: PersonRole;
                lastLoan?: {
                    id: number;
                    items: {
                        id: number;
                        name: string;
                        loanedDate: Date;
                        returnedDate?: Date;
                    };
                };
                invalidItems?: {
                    id: number;
                    name: string;
                    status: Tag;
                }[];
            }
        >,
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
            loading={navigation.state === "loading"}
        >
            {(person, query, qrCode) => (
                <PersonListView
                    id={person.id}
                    firstName={person.firstName}
                    lastName={person.lastName}
                    nickname={person.nickname}
                    role={hideRole ? undefined : person.role}
                    tags={person.tags}
                    totalLoans={person.loans && person.loans.length}
                    outstandingLoans={person._count && person._count.loans}
                    query={query}
                    qrCode={qrCode}
                    showChevron={orientation === "vertical"}
                    invalidItems={person.loans?.flatMap((loan) =>
                        loan.items.map((item) => ({
                            id: item.itemId,
                            name: item.item.name,
                            status: filterTags(item.item.tags, "Item Status")[0],
                        }))
                    )}
                />
            )}
        </ListView>
    );
}
