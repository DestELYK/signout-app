import { Flex, Group, ScrollArea, Textarea } from "@mantine/core";
import { PersonWithTags } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";

import { Tag } from "@prisma/client";
import { createOutstandingTag } from "../OutstandingBadge";
import StatCard from "../StatCard";
import InfoView from "../base/InfoView";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import TagGroup from "../tags/TagGroup";

export interface LoanInfoViewProps {
  id: number;
  person: Omit<PersonWithTags, "_count" | "createdDate" | "updatedDate">;
  tags: Tag[];
  createdDate: Date;
  updatedDate: Date;
  notes?: string | null;
  items: number;
  outstandingItems: number;
}

export default function LoanInfoView({
  id,
  person,
  items,
  tags,
  createdDate,
  updatedDate,
  notes,
  outstandingItems,
}: LoanInfoViewProps) {
  return (
    <Flex direction="column" w="100%" h="100%" gap="md">
      {/* Loan Card */}
      <InfoView
        title={`Loan #${id}`}
        rightSection={
          <TagGroup
            tags={[
              ...tags,
              createOutstandingTag({ out: outstandingItems > 0 }),
            ]}
          />
        }
      >
        <ScrollArea.Autosize type="auto" scrollbars="y">
          <Textarea
            w="100%"
            minRows={5}
            maxRows={5}
            autosize
            value={notes || "No notes"}
            readOnly
          />
        </ScrollArea.Autosize>
      </InfoView>

      {/* Person Card */}
      <InfoView
        title={formatFullName(person)}
        href={`/people/${person.id}`}
        rightSection={
          <TagGroup tags={person.tags} categories={["Person Role"]} />
        }
      >
        <QRCodeWithComponent qrCode={person.qrCode} scale={3}>
          <Textarea
            w="100%"
            minRows={4}
            maxRows={4}
            autosize
            value={person.notes || "No notes"}
            readOnly
          />
        </QRCodeWithComponent>
      </InfoView>

      {/* Outstanding Items */}
      <Group grow>
        <StatCard value={outstandingItems} label="Outstanding Items" />

        {/* Total Items */}
        <StatCard value={items} label="Total Items" />
      </Group>

      {/* Created Date */}
      <Group grow>
        <StatCard
          value={dateDiff(createdDate, true)}
          label="Since Creation"
          caption={formatDate(createdDate)}
        />

        {/* Updated Date */}
        <StatCard
          value={dateDiff(updatedDate, true)}
          label="Since Updated"
          caption={formatDate(updatedDate)}
        />
      </Group>
    </Flex>
  );
}
