import {
  Card,
  CardProps,
  DefaultMantineColor,
  Flex,
  StyleProp,
  Text,
} from "@mantine/core";

export interface DateCardProps {
  value: string | number;
  orientation?: "horizontal" | "vertical";
  color?: StyleProp<DefaultMantineColor>;
  label: string;
  caption?: string;
  withBorder?: boolean;
  cardProps?: CardProps;
  onClick?: () => void;
}

export default function StatCard({
  value,
  orientation = "vertical",
  color,
  label,
  caption,
  withBorder = true,
  cardProps,
  onClick,
}: DateCardProps) {
  return (
    <Card
      withBorder={withBorder}
      p="sm"
      onClick={onClick}
      {...(onClick && { style: { cursor: "pointer" } })}
      {...cardProps}
    >
      {orientation === "vertical" ? (
        <Flex
          h="100%"
          direction="column"
          align="center"
          gap={0}
          justify="center"
        >
          <Text {...(color && { c: color })} size="32px" ta="center">
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
            h="100%"
            direction="row"
            align="center"
            gap="sm"
            justify="space-between"
          >
            <Text size="sm" fw="bold">
              {label}
            </Text>
            <Flex direction="column" align="flex-start" justify="center">
              <Text {...(color && { c: color })} size="32px" ta="center">
                {value}
              </Text>
              {caption && (
                <Text size="xs" mt="xs">
                  {caption}
                </Text>
              )}
            </Flex>
          </Flex>
        )
      )}
    </Card>
  );
}
