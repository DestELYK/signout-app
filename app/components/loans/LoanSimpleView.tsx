import { Text } from "@mantine/core";
import { PersonWithTags } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";

export interface LoanSimpleViewProps {
  id: number;
  person?: Pick<PersonWithTags, "firstName" | "lastName" | "nickname">;
  dateLoaned: Date;
  itemCount?: number;
}

export default function LoanSimpleView({
  id,
  person,
  dateLoaned,
  itemCount,
}: LoanSimpleViewProps) {
  return (
    <>
      <Text>
        Loan #{id}
        {person && ` - ${formatFullName(person)}`}
      </Text>
      {itemCount && (
        <Text size="xs">
          {itemCount === 1 ? "1 item" : `${itemCount} items`}
        </Text>
      )}
      <Text size="xs" fs="italic" c="dimmed">
        {formatDate(dateLoaned)} ({dateDiff({ date: dateLoaned })})
      </Text>
    </>
  );
}
