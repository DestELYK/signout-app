import {
  Card,
  Center,
  Divider,
  Group,
  Loader,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { Tag } from "@prisma/client";
import { useDesktopOnly } from "~/lib/hooks";
import { dateDiff, formatDate, formatDuration } from "~/utils/utils";
import StatView from "../StatView";
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
  lastLoan?: LastLoanViewProps["data"];
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
  const desktopOnly = useDesktopOnly();

  const itemOutstanding =
    lastLoan && lastLoan.dateReturned === null ? true : false;

  return desktopOnly === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : desktopOnly ? (
    <Stack>
      {/* Outstanding Items */}
      <StatView value={loans} label="Total Signouts" />
      <Divider w="100%" />
      {averageLoanTime && (
        <>
          <StatView
            value={formatDuration(averageLoanTime)}
            label="Average Return Duration"
          />
          <Divider w="100%" />
        </>
      )}

      {/* Created Date */}
      <Group w="100%" align="stretch" grow>
        <StatView
          value={dateDiff({ date: createdDate, withoutSuffix: true })}
          label="Since Creation"
          caption={formatDate(createdDate)}
        />

        {/* Updated Date */}
        <StatView
          value={dateDiff({ date: updatedDate, withoutSuffix: true })}
          label="Since Updated"
          caption={formatDate(updatedDate)}
        />
      </Group>
    </Stack>
  ) : (
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
        cardProps={{ h: undefined, p: "sm" }}
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
          <LastLoanView data={lastLoan} />
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
      <Group w="100%" align="stretch" grow>
        <Card withBorder>
          <StatView value={loans} label="Total Signouts" />
        </Card>
        {averageLoanTime && (
          <Card withBorder>
            <StatView
              value={formatDuration(averageLoanTime)}
              label="Average Return Duration"
            />
          </Card>
        )}
      </Group>

      {/* Created Date */}
      <Group w="100%" align="stretch" grow>
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
