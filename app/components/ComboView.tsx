import { Flex, Highlight, Stack, Text } from "@mantine/core";
import { TagData } from "~/utils/types.server";
import TagGroup from "./tags/TagGroup";

export interface ComboViewProps {
    highlight: string | string[];
    title: string;
    caption?: string;
    tags?: TagData[];
    tagFilter?: string[];
    rightSection?: React.ReactNode;
}

export default function ComboView({
    title,
    caption,
    highlight,
    tags,
    tagFilter,
    rightSection,
}: ComboViewProps) {
    return (
        <Stack gap={2}>
            <Flex direction="row" wrap="nowrap" align="center" justify="space-between" gap="sm">
                <Highlight highlight={highlight}>{title}</Highlight>
                {rightSection}
            </Flex>
            {caption && (
                <Text size="xs" c="dimmed">
                    {caption}
                </Text>
            )}
            <Flex direction="row" gap="sm" align="center" wrap="nowrap" justify="space-between">
                {tags && tags.length > 0 && (
                    <TagGroup tags={tags} categories={tagFilter} badgeProps={{ size: "xs" }} />
                )}
            </Flex>
        </Stack>
    );
}
