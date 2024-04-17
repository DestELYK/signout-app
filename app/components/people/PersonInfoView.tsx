import { Badge, Flex, Stack, Text } from "@mantine/core";
import { Link } from "@remix-run/react";
import { formatFullName } from "~/utils/utils";
import QRCodePreview from "../QRCodePreview";

export interface PersonInfoViewProps {
  personId: number;
  qrCode?: string | null;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  role?: { name: string; color: string } | null;
  rightSection?: React.ReactNode;
}

export default function PersonInfoView({
  personId,
  qrCode,
  firstName,
  lastName,
  nickname,
  role,
  rightSection,
}: PersonInfoViewProps) {
  const fullName = formatFullName({ firstName, lastName, nickname });

  return (
    <Stack gap={0} w="100%">
      <Flex
        w="100%"
        direction="row"
        wrap="nowrap"
        align="center"
        justify="space-between"
      >
        <Flex direction="row" wrap="nowrap" align="center" gap="xs">
          {/* QR Code Image */}
          {qrCode && <QRCodePreview qrCode={qrCode} />}
          <Stack gap={0}>
            <Text
              ta="center"
              fw="bold"
              component={Link}
              to={`/people/${personId}`}
            >
              {fullName}
            </Text>
            {qrCode && role && (
              <Badge color={role.color} autoContrast>
                {role.name}
              </Badge>
            )}
          </Stack>
        </Flex>
        <Flex direction="row" wrap="nowrap" align="center" gap="xs">
          {!qrCode && role && (
            <Badge color={role.color} autoContrast>
              {role.name}
            </Badge>
          )}
          {rightSection}
        </Flex>
      </Flex>
    </Stack>
  );
}
