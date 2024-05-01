import { Card, CardProps, Flex, Text } from "@mantine/core";

export interface DateCardProps {
  value: string | number;
  label: string;
  caption?: string;
  cardProps?: CardProps;
}

export default function StatCard({
  value,
  label,
  caption,
  cardProps,
}: DateCardProps) {
  return (
    <Card withBorder p="sm" {...cardProps}>
      <Flex
        h="100%"
        direction="column"
        align="center"
        gap={0}
        justify="space-between"
      >
        <Text size="32px" ta="center">
          {value}
        </Text>
        <Text size="sm" ta="center" fw="bold">
          {label}
        </Text>
        {caption && (
          <Text size="xs" ta="center">
            {caption}
          </Text>
        )}
      </Flex>
    </Card>
  );
}
