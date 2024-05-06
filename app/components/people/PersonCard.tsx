import { Text, Textarea } from "@mantine/core";
import { Tag } from "@prisma/client";
import { formatFullName } from "~/utils/utils";
import InfoView from "../base/InfoView";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import TagGroup from "../tags/TagGroup";

export interface PersonCardProps {
  qrCode?: string | null;
  qrScale?: number;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  tags: Tag[];
  notes?: string | null;
  outstandingItems?: number;
  rightSection?: React.ReactNode;
  withBorder?: boolean;
}

export default function PersonCard({
  qrCode,
  qrScale,
  firstName,
  lastName,
  nickname,
  tags,
  notes,
  outstandingItems,
  rightSection,
  withBorder = true,
}: PersonCardProps) {
  return (
    <InfoView
      title={formatFullName({ firstName, lastName, nickname })}
      rightSection={
        <>
          <TagGroup
            tags={tags}
            categories={["Person Role"]}
            groupProps={{ justify: "end" }}
          />

          {rightSection}
        </>
      }
      bottomSection={
        <TagGroup
          tags={tags}
          categories={["Location", "Person Role"]}
          groupProps={{ justify: "end" }}
          blacklist
        />
      }
      cardProps={{
        p: 0,
        withBorder: withBorder,
        style: { overflow: "visible" },
      }}
    >
      {outstandingItems !== undefined && (
        <Text fw="bold" mb="sm" size="sm">
          Current Status:{" "}
          <Text span c={outstandingItems > 0 ? "red" : "green"}>
            {outstandingItems > 0 ? "Outstanding Items" : "All Items Returned"}
          </Text>
        </Text>
      )}
      <QRCodeWithComponent qrCode={qrCode} scale={qrScale || 2.5}>
        <Textarea
          w="100%"
          value={notes || "No notes"}
          minRows={3}
          maxRows={3}
          autosize
          readOnly
        />
      </QRCodeWithComponent>
    </InfoView>
  );
}
