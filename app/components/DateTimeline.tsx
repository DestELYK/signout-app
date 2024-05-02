import { Badge, Center, Text, Timeline, rem } from "@mantine/core";
import { Link } from "@remix-run/react";
import { dateDiff, formatDate } from "~/utils/utils";

export type TimelineItemValues = {
  id: number;
  date: Date;
  label: string;
  icon: React.ReactNode;
  color: string;
  line: "dotted" | "dashed" | "solid";
};

export interface DateTimelineProps {
  active: number;
  prefix?: string;
  href?: string;
  items: TimelineItemValues[];
}

export default function DateTimeline({
  active,
  prefix,
  href,
  items,
}: DateTimelineProps) {
  const timelineItems = items.map((l, index) => {
    const title =
      index === 0 || index == items.length - 1
        ? l.label
        : `${prefix}${l.id} - ${l.label}`;

    return (
      <Timeline.Item
        data-list-item
        key={index}
        bullet={
          <>
            {index !== items.length - 1 && (
              <Badge color={l.color} size="xs" pos="absolute" top={60}>
                {dateDiff({
                  date: l.date,
                  otherDate: items[index + 1].date,
                  withoutSuffix: true,
                  skipToday: true,
                  skipYesterday: true,
                })}
              </Badge>
            )}
            {l.icon}
          </>
        }
        title={
          index === 0 || index === items.length - 1 ? (
            <Text fw="bold">{title}</Text>
          ) : (
            <Text fw="bold" component={Link} to={`${href}/${l.id}`}>
              {title}
            </Text>
          )
        }
        lineVariant={l.line}
        color={l.color}
      >
        <Text size="sm" c="dimmed">
          {formatDate(l.date)}
        </Text>
        <Text size="xs" mt={4}>
          {dateDiff({ date: l.date })}
        </Text>
      </Timeline.Item>
    );
  });

  return items.length > 0 ? (
    <Timeline
      w="100%"
      ml={30}
      active={active}
      bulletSize={rem(40)}
      lineWidth={6}
    >
      {timelineItems}
    </Timeline>
  ) : (
    <Center h="100%">
      <Text>No timeline</Text>
    </Center>
  );
}
