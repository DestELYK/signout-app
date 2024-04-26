import {
  Card,
  Collapse,
  Flex,
  LoadingOverlay,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { ClientOnly } from "remix-utils/client-only";
import { ToggleSchemeButton } from "./ToggleSchemeButton.client";

export interface InfoViewProps {
  title: string;
  loading?: boolean;
  collapseOpen?: boolean;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
  collapseSection?: React.ReactNode;
  children: React.ReactNode;
}

export default function InfoView({
  title,
  loading,
  collapseOpen = false,
  leftSection,
  rightSection,
  collapseSection,
  children,
}: InfoViewProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Card w="100%" h="100%" bg="none">
      {/* Header */}
      <Card.Section withBorder inheritPadding mb="sm">
        <Flex
          direction="row"
          align="center"
          wrap="nowrap"
          justify="space-between"
          gap="xs"
        >
          <Flex
            direction="row"
            align="center"
            gap="xs"
            wrap="nowrap"
            justify="start"
          >
            {leftSection}

            <Title py="sm" order={4} fw="bold" lineClamp={1}>
              {title}
            </Title>
          </Flex>
          <Flex
            direction="row"
            align="center"
            gap="xs"
            wrap="nowrap"
            justify="end"
          >
            {rightSection}
            <ClientOnly fallback={null}>
              {() => <ToggleSchemeButton />}
            </ClientOnly>
          </Flex>
        </Flex>
        {collapseSection && (
          <Collapse in={collapseOpen} pb="sm">
            {collapseSection}
          </Collapse>
        )}
      </Card.Section>
      <LoadingOverlay
        visible={loading}
        zIndex={200}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      {children}
    </Card>
  );
}
