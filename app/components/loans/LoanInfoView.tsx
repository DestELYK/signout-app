import { Group, Title } from "@mantine/core";
import { PersonWithTags } from "~/utils/types.server";
import { dateDiff, formatDate } from "~/utils/utils";

import { Tag } from "@prisma/client";
import { createOutstandingTag } from "~/utils/utils";
import EditableNotes from "../EditableNotes";
import StatView from "../StatView";
import InfoView from "../base/InfoView";
import PersonCard from "../people/PersonCard";
import TagGroup from "../tags/TagGroup";

export interface LoanInfoViewProps {
  id: number;
  person: Omit<
    PersonWithTags,
    "_count" | "createdDate" | "updatedDate" | "loans"
  >;
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
    <>
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
        <EditableNotes action={`/loans/${id}`} value={notes} editable />
      </InfoView>

      {/* Person Card */}
      <Title order={4} mt="sm">
        Person
      </Title>
      <PersonCard {...person} />

      <Group w="100%" mt="sm" align="stretch" grow>
        {/* Outstanding Items */}
        <StatView value={outstandingItems} label="Outstanding Items" />

        {/* Total Items */}
        <StatView value={items} label="Total Items" />
      </Group>

      <Group w="100%" mt="sm" align="stretch" grow>
        {/* Created Date */}
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
    </>
  );
}
