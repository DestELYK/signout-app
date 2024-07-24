import { Card, Center, Group, Loader } from "@mantine/core";
import { Tag } from "@prisma/client";
import { useDesktopOnly } from "~/lib/hooks";
import { OUT_COLOR } from "~/utils/consts";
import { LastLoanData } from "~/utils/types.server";
import { dateDiff, formatDate, formatDuration } from "~/utils/utils";
import StatView from "../StatView";
import LastLoanView from "../loans/LastLoanView";
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
  lastLoan?: LastLoanData;
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
  lastLoan,
}: PersonInfoViewProps) {
  const desktopOnly = useDesktopOnly();

  return desktopOnly === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : (
    <>
      {!desktopOnly && (
        <>
          <PersonCard
            {...{ firstName, lastName, nickname, tags, notes, qrCode }}
            outstandingItems={outstandingItems}
          />

          <LastLoanView data={lastLoan} showPerson={false} showItems={false} />
        </>
      )}

      {/* Outstanding Items */}
      <Group align="stretch" grow>
        {outstandingItems && (
          <Card withBorder>
            <StatView
              color={OUT_COLOR}
              value={outstandingItems}
              label="Outstanding Items"
            />
          </Card>
        )}

        <Card withBorder>
          <StatView value={loans} label="Total Item Sign-Outs" />
        </Card>
      </Group>

      {/* Average Return Time */}
      <Group w="100%" mt="sm" align="stretch" grow>
        {lostItems && lostItems > 0 && (
          <Card withBorder>
            <StatView color="red" value={lostItems} label="Lost Items" />
          </Card>
        )}
        {averageReturnTime && Math.round(averageReturnTime) > 0 && (
          <Card withBorder>
            <StatView
              value={formatDuration(averageReturnTime)}
              label="Average Return Time"
            />
          </Card>
        )}
      </Group>

      {/* Created Date */}
      <Group w="100%" mt="sm" align="stretch" grow>
        <Card withBorder>
          <StatView
            value={dateDiff({ date: createdDate, withoutSuffix: true })}
            label="Since Creation"
            caption={formatDate(createdDate)}
          />
        </Card>

        {/* Updated Date */}
        <Card withBorder>
          <StatView
            value={dateDiff({ date: updatedDate, withoutSuffix: true })}
            label="Since Updated"
            caption={formatDate(updatedDate)}
          />
        </Card>
      </Group>
    </>
  );
}
