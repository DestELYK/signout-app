import { Badge, Center, Text, Timeline, rem } from "@mantine/core";
import { Link } from "@remix-run/react";
import { IconCheck, IconCircle, IconMinus, IconPlus, IconQuestionMark } from "@tabler/icons-react";
import { dateDiff, formatDate } from "~/utils/utils";

export type TimelineItemValues = {
    id: number;
    type: "created" | "sign-out" | "sign-in" | "available" | "outstanding" | "invalid" | string;
    date: Date;
    label: string;
    children?: React.ReactNode;
    color: string;
    line: "dotted" | "dashed" | "solid";
};

export interface DateTimelineProps {
    active: number;
    href?: string;
    items: TimelineItemValues[];
}

export default function DateTimeline({ active, href, items }: DateTimelineProps) {
    const timelineItems = items.map((l, index) => {
        return (
            <Timeline.Item
                data-list-item
                key={index}
                bullet={
                    <>
                        {index !== items.length - 1 && (
                            <Badge color={l.color} size="xs" pos="absolute" top={60} autoContrast>
                                {dateDiff({
                                    date: l.date,
                                    otherDate: items[index + 1].date,
                                    withoutSuffix: true,
                                    skipToday: true,
                                    skipYesterday: true,
                                })}
                            </Badge>
                        )}
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
        <Timeline py="sm" ml={30} active={active} bulletSize={rem(40)} lineWidth={6}>
            {timelineItems}
        </Timeline>
    ) : (
        <Center w="100%" h="100%">
            <Text>No timeline</Text>
        </Center>
    );
}
