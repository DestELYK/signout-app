import { Stack, Text } from "@mantine/core";
import { Tag } from "@prisma/client";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import InfoView from "../base/InfoView";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import TagGroup from "../tags/TagGroup";

export interface LastLoanViewProps {
  id: number;
  person: {
    id: number;
    qrCode?: string | null;
    firstName: string;
    lastName: string;
    nickname?: string | null;
    tags: Tag[];
  };
  returnedBy?: {
    id: number;
    firstName: string;
    lastName: string;
    nickname?: string | null;
  } | null;
  dateLoaned: Date;
  dateReturned?: Date | null;
  tags: Tag[];
}

export default function LastLoanView({
  id,
  person,
  returnedBy,
  dateLoaned,
  dateReturned,
  tags,
}: LastLoanViewProps) {
  return (
    <InfoView
      title={`#${id} - ${formatFullName(person)}`}
      href={`/loans/${id}`}
      rightSection={
        <TagGroup tags={person.tags} categories={["Person Role"]} />
      }
      bottomSection={<TagGroup tags={tags} groupProps={{ justify: "end" }} />}
    >
      <QRCodeWithComponent qrCode={person.qrCode} scale={2.5}>
        <Stack gap={0}>
          <Text>
            <b>{dateDiff({ date: dateLoaned, withoutSuffix: true })}</b> since
            last loan
          </Text>
          <Text size="xs" c="dimmed" fs="italic">
            {formatDate(dateLoaned)}
          </Text>
          {dateReturned && (
            <>
              <Text mt="sm">
                <b>{dateDiff({ date: dateReturned, withoutSuffix: true })}</b>{" "}
                since returned
              </Text>
              {returnedBy && (
                <Text size="xs">
                  Returned by:{" "}
                  <Text
                    span
                    inherit
                    fw="bold"
                    {...(returnedBy.id !== person.id && {
                      c: "error",
                    })}
                  >
                    {formatFullName(returnedBy)}
                  </Text>
                </Text>
              )}
              <Text size="xs" c="dimmed" fs="italic">
                {formatDate(dateReturned)}
              </Text>
            </>
          )}
        </Stack>
      </QRCodeWithComponent>
    </InfoView>
  );
}
