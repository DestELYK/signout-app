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
  color?: StyleProp<DefaultMantineColor>;
  label: string;
  caption?: string;
  cardProps?: CardProps;
}

export default function StatCard({
  value,
  color,
  label,
  caption,
  cardProps,
}: DateCardProps) {
  return (
    <Card withBorder p="sm" {...cardProps}>
      <Flex h="100%" direction="column" align="center" gap={0} justify="center">
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
    </Card>
  );
}
