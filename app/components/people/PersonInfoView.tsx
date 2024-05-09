import { Group } from "@mantine/core";
import { Tag } from "@prisma/client";
import { dateDiff, formatDate, formatDuration } from "~/utils/utils";
import { OUT_COLOR } from "../OutstandingBadge";
import StatCard from "../StatCard";
import PersonCard from "./PersonCard";

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
    <>
      {/* Person Card */}
      <PersonCard
        {...{ firstName, lastName, nickname, tags, notes, qrCode }}
        outstandingItems={outstandingItems}
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
      <Group w="100%" mt="sm" align="stretch" grow>
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
      <Group w="100%" mt="sm" align="stretch" grow>
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
    </>
  );
}
