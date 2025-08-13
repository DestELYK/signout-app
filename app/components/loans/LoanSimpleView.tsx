import { Text } from "@mantine/core";
import { ItemStatusData, PersonData } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import StatusBadge from "../StatusBadge";

export interface LoanSimpleViewProps {
    id: number;
    person?: PersonData;
    dateLoaned?: Date;
    itemCount?: number;
    status?: ItemStatusData;
}

export default function LoanSimpleView({
    id,
    person,
    dateLoaned,
    itemCount,
    status,
}: LoanSimpleViewProps) {
    return (
        <>
            <Text>
                Loan #{id}
                {person && ` - ${formatFullName(person)}`}
            </Text>
            {itemCount && (
                <Text size="xs">{itemCount === 1 ? "1 item" : `${itemCount} items`}</Text>
            )}
            {dateLoaned && (
                <Text size="xs" fs="italic" c="dimmed">
                    {formatDate(dateLoaned)} ({dateDiff({ date: dateLoaned })})
                </Text>
            )}
            {status && <StatusBadge status={status} />}
        </>
    );
}
