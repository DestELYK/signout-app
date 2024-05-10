import { MantineSpacing, StyleProp, Text, Textarea } from "@mantine/core";
import { Tag } from "@prisma/client";
import { filterTags, formatFullName } from "~/utils/utils";
import InfoView from "../base/InfoView";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import TagGroup from "../tags/TagGroup";

export interface PersonCardProps {
  id?: number;
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
  withDetails?: boolean;
  p?: StyleProp<MantineSpacing>;
}

export default function PersonCard({
  id,
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
  withDetails = true,
  p,
}: PersonCardProps) {
  return (
    <InfoView
      title={formatFullName({ firstName, lastName, nickname })}
      {...(id && { href: `/people/${id}` })}
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
        filterTags(tags, ["Location", "Person Role"], true).length > 0 && (
          <TagGroup
            tags={tags}
            categories={["Location", "Person Role"]}
            groupProps={{ justify: "end" }}
            blacklist
          />
        )
      }
      cardProps={{
        ...(p !== undefined && { p: p }),
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
      {withDetails && (
        <QRCodeWithComponent qrCode={qrCode} scale={qrScale || 2.5}>
          <Textarea
            w="100%"
            minRows={3}
            maxRows={3}
            autosize
            {...(!notes && { placeholder: "No notes" })}
            value={notes || ""}
          />
        </QRCodeWithComponent>
      )}
    </InfoView>
  );
}
