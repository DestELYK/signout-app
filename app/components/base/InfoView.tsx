import {
  Card,
  CardProps,
  CardSectionProps,
  Collapse,
  Flex,
  LoadingOverlay,
  ScrollArea,
  Text,
} from "@mantine/core";
import { Link } from "@remix-run/react";

export interface InfoViewProps {
  title?: string;
  href?: string;
  loading?: boolean;
  collapseOpen?: boolean;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  collapseSection?: React.ReactNode;
  bottomSection?: React.ReactNode;
  cardProps?: CardProps;
  headerProps?: CardSectionProps;
  children: React.ReactNode;
}

export default function InfoView({
  title,
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
        <Card.Section inheritPadding {...headerProps}>
          <Flex
            direction="row"
            align="center"
            wrap="nowrap"
            justify="space-between"
            gap="xs"
            py="sm"
          >
            <Flex
              direction="row"
              align="center"
              gap="xs"
              wrap="nowrap"
              justify="start"
            >
              {leftSection}
              {/* @ts-ignore */}
              <Text
                fw="bold"
                size="md"
                aria-label={title}
                {...(href && { component: Link, to: href })}
              >
                {title}
              </Text>
            </Flex>
            <Flex
              direction="row"
              align="center"
              gap="xs"
              wrap="nowrap"
              justify="end"
            >
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
      <LoadingOverlay visible={loading} zIndex={1000} />

      <ScrollArea type="auto" scrollbars="y">
        {children}
      </ScrollArea>
      {bottomSection && (
        <Card.Section inheritPadding py="sm">
          {bottomSection}
        </Card.Section>
      )}
    </Card>
  );
}
