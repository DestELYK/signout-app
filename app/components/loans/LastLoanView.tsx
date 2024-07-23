import { Button, Card, MantineStyleProps, Stack, Text } from "@mantine/core";
import { Tag } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import InfoView from "../base/InfoView";
import { QRCodeWithComponent } from "../qrCode/QRCodeWithComponent";
import TagGroup from "../tags/TagGroup";

export interface LastLoanViewProps {
  w?: MantineStyleProps["w"];
  h?: MantineStyleProps["h"];
  data?: {
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
  };
}

export default function LastLoanView({ w, h, data }: LastLoanViewProps) {
  const navigate = useNavigate();

  return data === undefined ? (
    <Card withBorder>
      <Stack w="100%" h="100%" align="center" justify="center">
        <Text c="dimmed">No Previous Loan</Text>
        <Button
          onClick={() => {
            navigate("/loans?create=");
          }}
        >
          Create New Loan
        </Button>
      </Stack>
    </Card>
  ) : (
    <InfoView
      title={`#${data.id} - ${formatFullName(data.person)}`}
      href={`/loans/${data.id}`}
      rightSection={
        <TagGroup tags={data.person.tags} categories={["Person Role"]} />
      }
      bottomSection={
        <TagGroup tags={data.tags} groupProps={{ justify: "end" }} />
      }
      cardProps={{ w, h }}
    >
      <QRCodeWithComponent qrCode={data.person.qrCode} scale={2.5}>
        <Stack gap={0}>
          <Text>
            <b>{dateDiff({ date: data.dateLoaned, withoutSuffix: true })}</b>{" "}
            since last loan
          </Text>
          <Text size="xs" c="dimmed" fs="italic">
            {formatDate(data.dateLoaned)}
          </Text>
          {data.dateReturned && (
            <>
              <Text mt="sm">
                <b>
                  {dateDiff({ date: data.dateReturned, withoutSuffix: true })}
                </b>{" "}
                since returned
              </Text>
              {data.returnedBy && (
                <Text size="xs">
                  Returned by:{" "}
                  <Text
                    span
                    inherit
                    fw="bold"
                    {...(data.returnedBy.id !== data.person.id && {
                      c: "error",
                    })}
                  >
                    {formatFullName(data.returnedBy)}
                  </Text>
                </Text>
              )}
              <Text size="xs" c="dimmed" fs="italic">
                {formatDate(data.dateReturned)}
              </Text>
            </>
          )}
        </Stack>
      </QRCodeWithComponent>
    </InfoView>
  );
}
