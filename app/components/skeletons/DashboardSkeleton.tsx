/**
 * DashboardSkeleton Component
 *
 * Loading skeleton components specifically designed for the dashboard layout.
 * Provides realistic placeholders for stats, charts, and list sections
 * to improve perceived performance during data loading.
 *
 * @module DashboardSkeleton
 */

import { Card, Flex, Group, Skeleton, Stack } from "@mantine/core";

/**
 * Skeleton for stat cards showing numbers and labels
 */
export function StatCardSkeleton() {
  return (
    <Card withBorder h="100%">
      <Card.Section inheritPadding withBorder p="sm">
        <Stack gap="xs" align="center">
          <Skeleton h={40} w={80} />
          <Skeleton h={16} w={120} />
          <Skeleton h={12} w={100} />
        </Stack>
      </Card.Section>
    </Card>
  );
}

/**
 * Skeleton for individual stat views (without card wrapper)
 */
export function StatViewSkeleton() {
  return (
    <Stack gap="xs" align="center" h="100%" justify="center">
      <Skeleton h={32} w={60} />
      <Skeleton h={16} w={120} />
      <Skeleton h={12} w={100} />
    </Stack>
  );
}

/**
 * Skeleton for list sections with headers
 */
export function ListSectionSkeleton({ itemCount = 5 }: { itemCount?: number }) {
  return (
    <Card h="100%" withBorder>
      <Card.Section inheritPadding withBorder>
        <Stack gap="xs" align="center" h={100} justify="center">
          <Skeleton h={32} w={80} />
          <Skeleton h={16} w={150} />
        </Stack>
      </Card.Section>
      <Card.Section h="calc(100% - 100px)" p="sm">
        <Stack gap="xs">
          {Array.from({ length: itemCount }).map((_, index) => (
            <Group key={index} justify="space-between" align="center" p="xs">
              <Stack gap="xs" flex={1}>
                <Skeleton h={16} w="60%" />
                <Skeleton h={12} w="40%" />
              </Stack>
              <Skeleton h={20} w={60} />
            </Group>
          ))}
        </Stack>
      </Card.Section>
    </Card>
  );
}

/**
 * Skeleton for chart sections
 */
export function ChartSkeleton() {
  return (
    <Card withBorder h="100%" w="100%">
      <Card.Section inheritPadding withBorder p="sm">
        <Group justify="space-between" align="center">
          <Skeleton h={20} w={150} />
          <Skeleton h={16} w={100} />
        </Group>
      </Card.Section>
      <Card.Section p="sm" h="calc(100% - 60px)">
        <Skeleton h="100%" w="100%" />
      </Card.Section>
    </Card>
  );
}

/**
 * Skeleton for the desktop dashboard layout
 */
export function DesktopDashboardSkeleton() {
  return (
    <Flex direction="column" w="100%" h="100%" gap="sm">
      {/* Main content area with cards */}
      <Group w="100%" h="75%" grow>
        <ListSectionSkeleton itemCount={4} />
        <ListSectionSkeleton itemCount={3} />
        <ListSectionSkeleton itemCount={6} />
      </Group>

      {/* Bottom section with chart and stats */}
      <Flex direction="row" wrap="nowrap" w="100%" h={180} gap="sm">
        <ChartSkeleton />
        <Stack h="100%">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </Stack>
      </Flex>
    </Flex>
  );
}

/**
 * Skeleton for the mobile dashboard layout
 */
export function MobileDashboardSkeleton() {
  return (
    <Stack gap="sm" w="100%">
      <Card withBorder>
        <Card.Section inheritPadding withBorder p="sm">
          <Stack gap="xs" align="center">
            <Skeleton h={24} w={120} />
            <Skeleton h={16} w={180} />
            <Skeleton h={32} w={60} />
          </Stack>
        </Card.Section>
        <Card.Section inheritPadding withBorder p="sm">
          <Stack gap="xs" align="center">
            <Skeleton h={24} w={140} />
            <Skeleton h={16} w={200} />
            <Skeleton h={32} w={40} />
          </Stack>
        </Card.Section>
        <Card.Section inheritPadding withBorder p="sm">
          <Stack gap="xs" align="center">
            <Skeleton h={24} w={100} />
            <Skeleton h={16} w={160} />
            <Skeleton h={32} w={80} />
          </Stack>
        </Card.Section>
      </Card>

      <Card withBorder w="100%" mih={130}>
        <Card.Section inheritPadding withBorder p="sm">
          <Group justify="space-between" align="center">
            <Skeleton h={20} w={150} />
            <Skeleton h={16} w={100} />
          </Group>
        </Card.Section>
        <Card.Section p="sm">
          <Skeleton h={50} w="100%" />
        </Card.Section>
      </Card>

      <Group grow gap="xs">
        <Card withBorder>
          <Stack gap="xs" align="center" p="sm">
            <Skeleton h={16} w={80} />
            <Skeleton h={24} w={40} />
          </Stack>
        </Card>
        <Card withBorder>
          <Stack gap="xs" align="center" p="sm">
            <Skeleton h={16} w={90} />
            <Skeleton h={24} w={40} />
          </Stack>
        </Card>
      </Group>
    </Stack>
  );
}
