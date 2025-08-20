/**
 * PersonCard Component
 *
 * A card component for displaying person information
 * in the signout system. Provides person details with QR code,
 * role badges, and navigation capabilities.
 *
 *
 * @module PersonCard
 *
 * @author Kyle Dunn
 */

import {
  Badge,
  Box,
  Flex,
  Group,
  MantineSpacing,
  MantineStyleProps,
  Space,
  StyleProp,
  Text,
  Textarea,
} from "@mantine/core";
import { PersonData } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";
import InfoView from "../base/InfoView";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import TagGroup from "../tags/TagGroup";

/**
 * Props for the PersonCard component
 */
export interface PersonCardProps {
  /** Width of the card component */
  w?: MantineStyleProps["w"];
  /** Height of the card component */
  h?: MantineStyleProps["h"];
  /** Person data to display */
  person: PersonData;
  /** Scale factor for QR code display */
  qrScale?: number;
  /** Optional content to display on the right side */
  rightSection?: React.ReactNode;
  /** Whether to display border around the card */
  withBorder?: boolean;
  /** Whether to show detailed person information */
  withDetails?: boolean;
  /** Padding for the card content */
  p?: StyleProp<MantineSpacing>;
  /** Whether the person has returned items */
  returned?: boolean;
}

/**
 * A comprehensive card component for person information display
 * Shows person details with role, tags, and navigation capabilities
 *
 * @param props - The component props
 * @returns The rendered person card component
 */
export default function PersonCard({
  w = "100%",
  h = "100%",
  person,
  qrScale,
  rightSection,
  withBorder = true,
  withDetails = true,
  returned,
  p,
}: PersonCardProps) {
  return (
    <InfoView
      title={formatFullName(person)}
      {...(person.id && { href: `/people/${person.id}` })}
      rightSection={
        <>
          {/* Role badge with color coding */}
          {person.role && (
            <Badge color={person.role.color} variant="outline" autoContrast>
              {person.role.name}
            </Badge>
          )}

          {rightSection}
        </>
      }
      bottomSection={
        person.tags && person.tags.length > 0 ? (
          <TagGroup
            tags={person.tags}
            categories={["Location"]}
            groupProps={{ justify: "end" }}
            blacklist
          />
        ) : undefined
      }
      cardProps={{
        w: w,
        h: h,
        withBorder: withBorder,
      }}
      headerProps={{
        withBorder: person.outstandingItemsCount === undefined && !withDetails ? false : true,
      }}
    >
      <Box py="sm">
        {withDetails && (
          <QRCodeWithComponent qrCode={person.schoolId} scale={qrScale || 2.5} showQRCode={false}>
            <Flex w="100%" direction="column">
              <Text size="xs">
                {person.loansCount ?? 0} Total Loans{" "}
                {person.outstandingItemsCount ? (
                  <>
                    <Text span inherit c="red" fw="bold">
                      ({person.outstandingItemsCount} Outstanding)
                    </Text>
                  </>
                ) : undefined}
              </Text>
              {person.lostItemsCount !== undefined && person.lostItemsCount > 0 && (
                <Text mt="sm" fw="bold" size="xs" c="red">
                  {person.lostItemsCount} Lost Item
                  {person.lostItemsCount > 1 ? "s" : ""}
                </Text>
              )}
              {person.lostItems?.slice(0, 2).map((i) => (
                <Group key={i.id}>
                  <Text size="xs" c="dimmed">
                    {i.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {i.status && i.status.id === "returned"
                      ? `(${i.status.name})`
                      : i.status
                      ? ` (${i.status.name})`
                      : "Unknown Status"}
                  </Text>
                </Group>
              ))}
              {person.lostItems !== undefined && person.lostItems.length > 2 && (
                <Text fs="italic" size="xs">
                  ...and {person.lostItems.length - 2} other items
                </Text>
              )}
              {returned && (
                <Text mt="sm" size="xs" c="red">
                  Person did not return all of their items
                </Text>
              )}
              <Space h="xs" />
              <Textarea value={person.notes} placeholder="No notes" readOnly tabIndex={-1} />
            </Flex>
          </QRCodeWithComponent>
        )}
      </Box>
    </InfoView>
  );
}
