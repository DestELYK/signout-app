/**
 * LoanSimpleView Component
 *
 * A simplified view component for displaying basic loan information
 * in compact spaces within the signout system. Provides essential
 * loan details in a condensed format.
 *
 *
 * @module LoanSimpleView
 *
 * @author Kyle Dunn
 */

import { Text } from "@mantine/core";
import { ClientOnly } from "remix-utils/client-only";
import { ItemStatusData, PersonData } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import StatusBadge from "../StatusBadge";

/**
 * Props for the LoanSimpleView component
 */
export interface LoanSimpleViewProps {
  /** Loan ID number */
  id: number;
  /** Optional person associated with the loan */
  person?: PersonData;
  /** Optional date when the loan was created */
  dateLoaned?: Date;
  /** Optional count of items in the loan */
  itemCount?: number;
  /** Optional status of the loan */
  status?: ItemStatusData;
}

/**
 * A simplified view component for basic loan information
 * Shows essential loan details in a compact format
 *
 * @param props - The component props
 * @returns The rendered loan simple view component
 */
export default function LoanSimpleView({
  id,
  person,
  dateLoaned,
  itemCount,
  status,
}: LoanSimpleViewProps) {
  return (
    <>
      {/* Loan ID and person name */}
      <Text>
        Loan #{id}
        {person && ` - ${formatFullName(person)}`}
      </Text>
      {/* Item count with proper pluralization */}
      {itemCount && <Text size="xs">{itemCount === 1 ? "1 item" : `${itemCount} items`}</Text>}
      {/* Loan date with relative timing */}
      {dateLoaned && (
        <ClientOnly
          fallback={
            <Text size="xs" fs="italic" c="dimmed">
              Loading date...
            </Text>
          }
        >
          {() => (
            <Text size="xs" fs="italic" c="dimmed">
              {formatDate(dateLoaned)} ({dateDiff({ date: dateLoaned })})
            </Text>
          )}
        </ClientOnly>
      )}
      {/* Status badge if available */}
      {status && <StatusBadge status={status} />}
    </>
  );
}
