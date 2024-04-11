import {
  Card,
  CardSection,
  Flex,
  LoadingOverlay,
  Text,
  Title
} from "@mantine/core";
import { formatDate } from "~/utils/utils";

export interface InfoViewProps {
  title: string;
  children: React.ReactNode;
  createdDate: Date;
  updatedDate: Date;
  loading?: boolean;
  rightSection?: React.ReactNode;
  onClose?: () => void;
}

export default function InfoView({
  title,
  children,
  createdDate,
  updatedDate,
  loading,
  rightSection,
  onClose,
}: InfoViewProps) {
  return (
    <>
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Card padding="sm" radius="sm" withBorder w="100%" h="100%">
        {/* Header */}
        <Card.Section withBorder inheritPadding py="xs">
          <Flex direction="row" align="center" wrap="nowrap" justify="space-between">
            <Title order={4}>{title}</Title>
            <Flex direction="row" align="center" gap="sm" wrap="nowrap" justify="end">
              {rightSection}
            </Flex>
          </Flex>
        </Card.Section>
        {children}
        {/* Footer Date Created & Updated */}
        <CardSection withBorder inheritPadding py="xs">
          <Text size="xs" ta="center">
            Created:{" "}
            <span style={{ fontWeight: "bold" }}>
              {formatDate(createdDate)}
            </span>
          </Text>
          <Text size="xs" ta="center">
            Last Updated:{" "}
            <span style={{ fontWeight: "bold" }}>
              {formatDate(updatedDate)}
            </span>
          </Text>
        </CardSection>
      </Card>
    </>
  );
}
