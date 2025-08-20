/**
 * DateTimeline Component
 *
 * A visual timeline component that displays chronological events with
 * icons, colors, and time differences. Used to show item history,
 * loan status changes, and other time-based activities.
 *
 *
 * @module DateTimeline
 *
 * @author Kyle Dunn
 */

import { Badge, Center, Text, Timeline, rem } from "@mantine/core";
import { Link } from "@remix-run/react";
import { IconCheck, IconCircle, IconMinus, IconPlus, IconQuestionMark } from "@tabler/icons-react";
import { dateDiff, formatDate } from "~/utils/utils";

/**
 * Represents a single timeline item with its properties
 */
export type TimelineItemValues = {
  /** Unique identifier for the timeline item */
  id: number;
  /** Type of event determining the icon displayed */
  type: "created" | "sign-out" | "sign-in" | "available" | "outstanding" | "invalid" | string;
  /** Date when the event occurred */
  date: Date;
  /** Display label for the timeline item */
  label: string;
  /** Optional child content to render */
  children?: React.ReactNode;
  /** Color theme for the timeline item */
  color: string;
  /** Style of the connecting line */
  line: "dotted" | "dashed" | "solid";
};

/**
 * Props for the DateTimeline component
 */
export interface DateTimelineProps {
  /** Index of the currently active timeline item */
  active: number;
  /** Base URL for navigation links */
  href?: string;
  /** Array of timeline items to display */
  items: TimelineItemValues[];
}

/**
 * A chronological timeline component with interactive elements
 * Displays events with icons, time differences, and navigation
 *
 * @param props - The component props
 * @returns The rendered timeline component or empty state
 */
export default function DateTimeline({ active, href, items }: DateTimelineProps) {
  /** Map timeline items to Timeline.Item components with custom styling and icons */
  const timelineItems = items.map((l, index) => {
    return (
      <Timeline.Item
        data-list-item
        key={index}
        bullet={
          <>
            {/* Time difference badge between consecutive items */}
            {index !== items.length - 1 && (
              <Badge
                w="max-content"
                maw={100}
                color={l.color}
                size="xs"
                pos="absolute"
                top={60}
                autoContrast
                fullWidth
              >
                {dateDiff({
                  date: l.date,
                  otherDate: items[index + 1].date,
                  withoutSuffix: true,
                  skipToday: true,
                  skipYesterday: true,
                })}
              </Badge>
            )}
            {/* Icon selection based on event type */}
            {l.type === "created" ? (
              <IconCircle size={40} />
            ) : l.type === "sign-out" ? (
              <IconMinus size={40} />
            ) : l.type === "sign-in" ? (
              <IconPlus size={40} />
            ) : l.type === "available" ? (
              <IconCheck size={40} />
            ) : l.type === "outstanding" ? (
              <IconCircle size={40} />
            ) : l.type === "invalid" ? (
              <IconQuestionMark size={40} />
            ) : null}
          </>
        }
        title={
          /* First and last items are non-clickable, middle items link to details */
          index === 0 || index === items.length - 1 ? (
            <Text fw="bold">{l.label}</Text>
          ) : (
            <Text fw="bold" component={Link} to={`${href}/${l.id}`}>
              {l.label}
            </Text>
          )
        }
        lineVariant={l.line}
        color={l.color}
      >
        {l.children}
        {/* Formatted date display */}
        <Text size="sm" c="dimmed">
          {formatDate(l.date)}
        </Text>
        {/* Relative time display */}
        <Text size="xs" mt={4}>
          {dateDiff({ date: l.date })}
        </Text>
      </Timeline.Item>
    );
  });

  /** Render timeline with items or empty state */
  return items.length > 0 ? (
    <Timeline py="sm" ml={30} active={active} bulletSize={rem(40)} lineWidth={6}>
      {timelineItems}
    </Timeline>
  ) : (
    <Center w="100%" h="100%">
      <Text>No timeline</Text>
    </Center>
  );
}
