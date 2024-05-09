import { Group, Stack, Text, Textarea, Title } from "@mantine/core";
import { Tag } from "@prisma/client";
import { dateDiff, formatDate, formatDuration } from "~/utils/utils";
import StatCard from "../StatCard";
import InfoView from "../base/InfoView";
import LastLoanView, { LastLoanViewProps } from "../loans/LastLoanView";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import TagGroup from "../tags/TagGroup";

export interface ItemInfoViewProps {
  id: number;
  name: string;
  qrCode?: string | null;
  location?: Tag;
  description?: string | null;
  notes?: string | null;
  tags: Tag[];
  lastLoan?: LastLoanViewProps;
  createdDate: Date;
  updatedDate: Date;
  loading?: boolean;
  loans: number;
  averageLoanTime?: number;
}

export default function ItemInfoView({
  id,
  name,
  qrCode,
  description,
  notes,
  tags,
  createdDate,
  updatedDate,
  lastLoan,
  loans,
  loading,
  averageLoanTime,
}: ItemInfoViewProps) {
  const itemOutstanding =
    lastLoan && lastLoan.dateReturned === null ? true : false;

  return (
    <>
      {/* Item Card */}
      <InfoView
        title={name}
        href={`/items/${id}`}
        rightSection={
          <TagGroup
            tags={tags}
            categories={["Item Type"]}
            groupProps={{ justify: "end" }}
          />
        }
        bottomSection={
          <TagGroup
            tags={tags}
            categories={["Location", "Item Status"]}
            groupProps={{ justify: "end" }}
          />
        }
        cardProps={{ p: "sm" }}
      >
        <QRCodeWithComponent qrCode={qrCode} scale={2.5}>
          <Stack gap={0}>
            <Text fw="bold" mb="md" size="sm">
              Current Status:{" "}
              <Text span c={itemOutstanding ? "red" : "green"}>
                {itemOutstanding ? "Outstanding" : "Available"}
              </Text>
            </Text>
            <Text fs="italic">{description || "No description"}</Text>
          </Stack>
        </QRCodeWithComponent>
      </InfoView>

      {/* Last Loan Card */}
      {lastLoan && lastLoan.person && (
        <>
          <Title order={4} mt="sm">
            Last Loan
          </Title>
          <LastLoanView {...lastLoan} />
        </>
      )}
      {/* Notes */}
      <Title order={4} mt="sm">
        Notes
      </Title>
      <Textarea
        w="100%"
        minRows={5}
        maxRows={5}
        autosize
        value={notes || "No notes"}
        readOnly
      />

      {/* Outstanding Items */}
      <Group w="100%" mt="sm" align="stretch" grow>
        <StatCard value={loans} label="Total Signouts" />
        {averageLoanTime && (
          <StatCard
            value={formatDuration(averageLoanTime)}
            label="Average Return Duration"
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
