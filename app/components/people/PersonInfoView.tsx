import { Flex, Group, Stack, Text, Textarea, Title } from "@mantine/core";
import { Tag } from "@prisma/client";
import {
  dateDiff,
  formatDate,
  formatDuration,
  formatFullName,
} from "~/utils/utils";
import { OUT_COLOR } from "../OutstandingBadge";
import StatCard from "../StatCard";
import InfoView from "../base/InfoView";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import TagGroup from "../tags/TagGroup";

export interface PersonInfoViewProps {
  id: number;
  qrCode?: string | null;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  notes?: string | null;
  tags: Tag[];
  createdDate: Date;
  updatedDate: Date;
  loading?: boolean;
  lostItems: number;
  outstandingItems: number;
  loans: number;
  averageReturnTime?: number;
}

export default function PersonInfoView({
  id,
  firstName,
  lastName,
  nickname,
  qrCode,
  notes,
  tags,
  createdDate,
  updatedDate,
  loans,
  outstandingItems,
  lostItems,
  averageReturnTime,
}: PersonInfoViewProps) {
  return (
    <Flex direction="column" w="100%" h="100%" gap="sm">
      {/* Person Card */}
      <Title order={4}>Details</Title>
      <InfoView
        title={formatFullName({ firstName, lastName, nickname })}
        rightSection={
          <TagGroup
            tags={tags}
            categories={["Person Role"]}
            groupProps={{ justify: "end" }}
          />
        }
        bottomSection={
          <TagGroup
            tags={tags}
            categories={["Location", "Person Role"]}
            groupProps={{ justify: "end" }}
            blacklist
          />
        }
        cardProps={{ p: "sm" }}
      >
        <QRCodeWithComponent qrCode={qrCode} scale={2.5}>
          <Stack gap={0}>
            <Text fw="bold" mb="md" size="sm">
              Current Status:{" "}
              <Text span c={outstandingItems > 0 ? "red" : "green"}>
                {outstandingItems > 0
                  ? "Outstanding Items"
                  : "All Items Returned"}
              </Text>
            </Text>
          </Stack>
        </QRCodeWithComponent>
      </InfoView>

      {/* Notes */}
      <Title order={4}>Notes</Title>
      <Textarea
        w="100%"
        minRows={5}
        maxRows={5}
        autosize
        value={notes || "No notes"}
        readOnly
      />

      {/* Outstanding Items */}
      <Group align="stretch" grow>
        {outstandingItems && (
          <StatCard
            color={OUT_COLOR}
            value={outstandingItems}
            label="Outstanding Items"
          />
        )}
        <StatCard value={loans} label="Total Item Sign-Outs" />
      </Group>

      {/* Average Return Time */}
      <Group align="stretch" grow>
        {lostItems && lostItems > 0 && (
          <StatCard color="red" value={lostItems} label="Lost Items" />
        )}
        {averageReturnTime && Math.round(averageReturnTime) > 0 && (
          <StatCard
            value={formatDuration(averageReturnTime)}
            label="Average Return Time"
          />
        )}
      </Group>

      {/* Created Date */}
      <Group align="stretch" grow>
        <StatCard
          value={dateDiff({ date: createdDate, withoutSuffix: true })}
          label="Since Creation"
          caption={formatDate(createdDate)}
        />

        {/* Updated Date */}
        <StatCard
          value={dateDiff({ date: updatedDate, withoutSuffix: true })}
          label="Since Updated"
          caption={formatDate(updatedDate)}
        />
      </Group>
    </Flex>
  );
}
