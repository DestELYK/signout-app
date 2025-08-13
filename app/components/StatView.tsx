import {
    DefaultMantineColor,
    Flex,
    MantineStyleProps,
    StyleProp,
    Text,
    TextProps,
} from "@mantine/core";

export interface StatViewProps {
    w?: MantineStyleProps["w"];
    h?: MantineStyleProps["h"];
    value: string | number;
    orientation?: "horizontal" | "vertical";
    color?: StyleProp<DefaultMantineColor>;
    label: string;
    caption?: string;
    size?: TextProps["size"];
    onClick?: () => void;
}

export default function StatView({
    w = "100%",
    h = "100%",
    value,
    orientation = "vertical",
    color,
    size,
    label,
    caption,
    onClick,
}: StatViewProps) {
    return orientation === "vertical" ? (
        <Flex
            w={w}
            h={h}
            direction="column"
            align="center"
            gap={0}
            justify="center"
            onClick={onClick}
            {...(onClick !== undefined && { style: { cursor: "pointer" } })}
        >
            <Text {...(color && { c: color })} size={size ?? "32px"} ta="center">
                {value}
            </Text>
            <Text size="sm" ta="center" fw="bold">
                {label}
            </Text>
            {caption && (
                <Text size="xs" ta="center" mt="xs">
                    {caption}
                </Text>
            )}
        </Flex>
    ) : (
        orientation === "horizontal" && (
            <Flex
                w={w}
                h={h}
                direction="row"
                align="center"
                gap="sm"
                justify="space-between"
                onClick={onClick}
                {...(onClick !== undefined && { style: { cursor: "pointer" } })}
            >
                <Text ta="center" size="sm" fw="bold">
                    {label}
                </Text>
                <Flex direction="column" align="flex-end" justify="end">
                    <Text {...(color && { c: color })} size="32px" ta="center">
                        {value}
                    </Text>
                    {caption && (
                        <Text size="xs" mt="xs" ta="center">
                            {caption}
                        </Text>
                    )}
                </Flex>
            </Flex>
        )
    );
}
