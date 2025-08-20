/**
 * TitlePage Component
 *
 * A reusable page header component that provides consistent
 * title display with optional sections for additional content.
 *
 *
 * @module TitlePage
 *
 * @author Kyle Dunn
 */

import { Divider, Flex, MantineStyleProp, Stack, Title } from "@mantine/core";

/**
 * Props for the TitlePage component
 */
export interface TitlePageProps {
  /** Main title text to display */
  title: string;
  /** Optional content above the title */
  topSection?: React.ReactNode;
  /** Optional content below the title */
  bottomSection?: React.ReactNode;
  /** Optional content on the right side (usually actions) */
  rightSection?: React.ReactNode;
  /** Whether to show a divider below the title */
  withDivider?: boolean;
  /** Additional styling */
  style?: MantineStyleProp;
}

/**
 * A page header component with title and optional content sections
 *
 * @param props - The component props
 * @returns The rendered title page header
 */
export default function TitlePage({
  title,
  topSection,
  bottomSection,
  rightSection,
  withDivider = true,
  style,
}: TitlePageProps) {
  /** Main title element with sections layout */
  const titleElement = (
    <Flex direction="row" justify="space-between" wrap="nowrap" align="center" p="sm">
      <Stack h="100%" mah={100} gap={2} justify="center">
        {topSection}
        <Title order={2}>{title}</Title>
        {bottomSection}
      </Stack>
      {rightSection}
    </Flex>
  );

  return (
    <>
      {titleElement}
      {withDivider && <Divider w="100%" />}
    </>
  );
}
