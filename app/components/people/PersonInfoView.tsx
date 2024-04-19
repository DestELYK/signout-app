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
  tags?: { name: string; color: string }[] | null;
  rightSection?: React.ReactNode;
}

export default function PersonInfoView({
  personId,
  qrCode,
  firstName,
  lastName,
  nickname,
  tags,
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
            {qrCode && tags && tags.map(tag=>(
              <Badge color={tag.color} autoContrast>
                {tag.name}
              </Badge>
            ))}
          </Stack>
        </Flex>
        <Flex direction="row" wrap="nowrap" align="center" gap="xs">
          {!qrCode && tags && tags.map(tag => (
            <Badge color={tag.color} autoContrast>
              {tag.name}
            </Badge>
          ))}
          {rightSection}
        </Flex>
      </Flex>
    </Stack>
  );
}
