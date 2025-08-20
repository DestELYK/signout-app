/**
 * StatView Component
 *
 * A statistics display component that shows numerical data
 * with labels and optional captions. Supports both vertical and
 * horizontal orientations with customizable styling.
 *
 *
 * @module StatView
 *
 * @author Kyle Dunn
 */

import {
  DefaultMantineColor,
  Flex,
  MantineStyleProps,
  StyleProp,
  Text,
  TextProps,
} from "@mantine/core";

/**
 * Props for the StatView component
 */
export interface StatViewProps {
  /** Width of the stat container */
  w?: MantineStyleProps["w"];
  /** Height of the stat container */
  h?: MantineStyleProps["h"];
  /** The numerical or text value to display */
  value: string | number;
  /** Layout orientation of the stat display */
  orientation?: "horizontal" | "vertical";
  /** Color theme for the value text */
  color?: StyleProp<DefaultMantineColor>;
  /** Label text describing the statistic */
  label: string;
  /** Optional caption for additional context */
  caption?: string;
  /** Text size for the value display */
  size?: TextProps["size"];
  /** Optional click handler for interaction */
  onClick?: () => void;
}

/**
 * A statistics display component with customizable layout and styling
 *
 * @param props - The component props
 * @returns The rendered stat view component
 */
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
  /** Vertical layout with stacked elements */
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
