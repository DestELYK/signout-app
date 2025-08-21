/**
 * DateDisplay Component
 *
 * A reusable component for displaying dates with consistent formatting
 * and hydration safety. Wraps the formatDate utility with ClientOnly
 * rendering to prevent server/client hydration mismatches caused by
 * timezone differences.
 *
 * Features:
 * - Client-only rendering to prevent hydration issues
 * - Extends formatDate utility parameters
 * - Customizable fallback content during SSR
 * - TypeScript support with proper date type handling
 * - Flexible styling through Mantine Text props
 *
 * @module DateDisplay
 */

import { Text, TextProps } from "@mantine/core";
import { ClientOnly } from "remix-utils/client-only";
import { formatDate } from "~/utils/utils";

/**
 * Props for the DateDisplay component
 */
export interface DateDisplayProps extends TextProps {
  /** The date to display (string or Date object) */
  date: string | Date | undefined;
  /** Optional formatting options passed to formatDate */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** Custom date formatting function that overrides formatDate */
  dateFormat?: (date: string | Date) => string;
  /** Optional fallback content to show during SSR */
  fallback?: React.ReactNode;
  /** Whether to show "None" for undefined dates (default: true) */
  showNoneForUndefined?: boolean;
  /** Text to display before the date */
  prefix?: React.ReactNode;
  /** Text to display after the date */
  suffix?: string;
}

/**
 * A component for displaying dates with hydration safety
 * Prevents server/client mismatches by rendering dates only on the client
 *
 * @param props - The component props
 * @returns The rendered date display component
 */
export default function DateDisplay({
  date,
  formatOptions,
  dateFormat,
  fallback = "Loading date...",
  showNoneForUndefined = true,
  prefix,
  suffix,
  ...textProps
}: DateDisplayProps) {
  // Handle undefined dates early if showNoneForUndefined is true
  if (date === undefined && showNoneForUndefined) {
    return (
      <Text {...textProps}>
        {prefix}None{suffix}
      </Text>
    );
  }

  // Handle undefined dates when showNoneForUndefined is false
  if (date === undefined) {
    return null;
  }

  return (
    <ClientOnly
      fallback={
        <Text {...textProps}>
          {prefix}
          {fallback}
          {suffix}
        </Text>
      }
    >
      {() => (
        <Text {...textProps}>
          {prefix}
          {dateFormat ? dateFormat(date) : formatDate(date, formatOptions)}
          {suffix}
        </Text>
      )}
    </ClientOnly>
  );
}
