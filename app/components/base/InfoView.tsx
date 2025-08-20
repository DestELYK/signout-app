/**
 * InfoView Component
 *
 * A card-based component for displaying structured information
 * with optional header, sections, and collapsible content areas.
 * Provides consistent styling for information display throughout the app.
 *
 *
 * @module InfoView
 *
 * @author Kyle Dunn
 */

import {
  Box,
  Card,
  CardProps,
  CardSectionProps,
  Collapse,
  Flex,
  MantineStyleProps,
  Text,
} from "@mantine/core";
import { Link } from "@remix-run/react";

/**
 * Props for the InfoView component
 */
export interface InfoViewProps {
  /** Title text for the card header */
  title?: string;
  /** Styling properties for the title */
  titleProps?: MantineStyleProps;
  /** Optional link URL for navigation */
  href?: string;
  /** Loading state indicator */
  loading?: boolean;
  /** Whether the collapse section is open */
  collapseOpen?: boolean;
  /** Content for the left section of header */
  leftSection?: React.ReactNode;
  /** Content for the right section of header */
  rightSection?: React.ReactNode;
  /** Content for the collapsible section */
  collapseSection?: React.ReactNode;
  /** Content for the bottom section */
  bottomSection?: React.ReactNode;
  /** Props passed to the Card component */
  cardProps?: CardProps;
  /** Props passed to the header section */
  headerProps?: CardSectionProps;
  /** Main content of the component */
  children: React.ReactNode;
}

/**
 * A flexible information display component with card layout
 *
 * @param props - The component props
 * @returns The rendered info view component
 */
export default function InfoView({
  title,
  titleProps,
  href,
  loading,
  collapseOpen = false,
  leftSection,
  rightSection,
  collapseSection,
  bottomSection,
  cardProps,
  headerProps,
  children,
}: InfoViewProps) {
  return (
    <Card w="100%" h="100%" withBorder {...cardProps}>
      {/* Header */}
      {title && (
        <Card.Section inheritPadding withBorder px="sm" {...headerProps}>
          <Flex
            direction="row"
            align="center"
            wrap="nowrap"
            justify="space-between"
            gap="xs"
            py="sm"
          >
            <Flex direction="row" align="center" gap="xs" wrap="nowrap" justify="start">
              {leftSection}
              {href ? (
                <Link to={href}>
                  <Text fw="bold" size="md" aria-label={title} {...titleProps}>
                    {title}
                  </Text>
                </Link>
              ) : (
                <Text fw="bold" size="md" aria-label={title} {...titleProps}>
                  {title}
                </Text>
              )}
            </Flex>
            <Flex direction="row" align="center" gap="xs" wrap="nowrap" justify="end">
              {rightSection}
            </Flex>
          </Flex>
          {collapseSection && (
            <Collapse in={collapseOpen} pb="sm">
              {collapseSection}
            </Collapse>
          )}
        </Card.Section>
      )}
      <Box w="100%" h="100%" style={{ overflow: "hidden" }}>
        {children}
      </Box>
      {bottomSection !== undefined && (
        <Card.Section inheritPadding mt="auto" p="sm" withBorder>
          {bottomSection}
        </Card.Section>
      )}
    </Card>
  );
}
