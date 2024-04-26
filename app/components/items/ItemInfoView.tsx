import { Fieldset, Flex, Paper, Space, Stack, Text } from "@mantine/core";
import { Tag } from "@prisma/client";
import { Link } from "@remix-run/react";
import { formatFullName } from "~/utils/utils";
import QRCodePreview from "../qrCode/QRCodePreview";

export interface ItemInfoViewProps {
  id: number;
  name: string;
  qrCode?: string | null;
  description?: string | null;
  lastLoan: {
    id: number;
    person: {
      id: number;
      firstName: string;
      lastName: string;
      nickname?: string | null;
    };
    dateLoaned: Date;
    dateReturned?: Date | null;
    tags: Tag[];
  };
  createdDate: Date;
  updatedDate: Date;
  loading?: boolean;
}

export default function ItemInfoView({
  id,
  name,
  qrCode,
  description,
  lastLoan,
  createdDate,
  updatedDate,
  loading,
}: ItemInfoViewProps) {
  function editQRCode() {}

  return (
    <Stack gap="sm">
      <Fieldset legend="Details" disabled={loading}>
        <Flex direction="row" gap="sm">
          {qrCode ? (
            <QRCodePreview qrCode={qrCode} scale={4} />
          ) : (
            <Paper
              withBorder
              w={100}
              h={100}
              ta="center"
              component={Stack}
              justify="center"
              gap="sm"
              onClick={() => editQRCode()}
              style={{ cursor: "pointer" }}
            >
              <Text>No QRCode</Text>
              <Text size="xs">Click to add QRCode</Text>
            </Paper>
          )}
          <Stack gap={0}>
            <Text size="md">{description || "No description"}</Text>
          </Stack>
        </Flex>
      </Fieldset>
      <Fieldset legend="Last Loan" disabled={loading}>
        <Flex direction="row" gap="sm">
          <Text fw="bold" component={Link} to={`/people/${lastLoan.person.id}`}>
            {formatFullName(lastLoan.person)}
          </Text>
        </Flex>
      </Fieldset>
      <Space mb="auto" />
    </Stack>
  );
}
