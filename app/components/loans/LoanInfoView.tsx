import { Card, Divider, Group, Skeleton, Stack, Title } from "@mantine/core";
import { PersonWithTags } from "~/utils/types.server";
import { dateDiff, formatDate } from "~/utils/utils";

import { Tag } from "@prisma/client";
import { useDesktopOnly } from "~/lib/hooks";
import { OUT_COLOR } from "~/utils/consts";
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
  const desktopOnly = useDesktopOnly();

  return desktopOnly === undefined ? (
    <Card withBorder>
      <Stack gap="xs">
        <Skeleton h={160} />
        <Skeleton h={130} />
      </Stack>
    </Card>
  ) : desktopOnly ? (
    <Stack h="100%">
      <StatView
        value={outstandingItems}
        color={outstandingItems > 0 ? OUT_COLOR : undefined}
        label={"Outstanding Items"}
        caption={outstandingItems === 0 ? "All items returned" : undefined}
      />
      <Divider w="100%" />
      <StatView value={items} label="Total Items" />
      <Divider w="100%" />
      <StatView
        value={dateDiff({ date: createdDate, withoutSuffix: true })}
        label="Since Creation"
        caption={formatDate(createdDate)}
      />
      <Divider w="100%" />
      <StatView
        value={dateDiff({ date: updatedDate, withoutSuffix: true })}
        label="Since Updated"
        caption={formatDate(updatedDate)}
      />
      <Divider w="100%" />
    </Stack>
  ) : (
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
        <Card withBorder>
          <StatView value={outstandingItems} label="Outstanding Items" />
        </Card>

        {/* Total Items */}
        <Card withBorder>
          <StatView value={items} label="Total Items" />
        </Card>
      </Group>

      <Group w="100%" mt="sm" align="stretch" grow>
        {/* Created Date */}
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
