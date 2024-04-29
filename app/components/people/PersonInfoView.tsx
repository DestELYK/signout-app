import { Badge, Flex, Stack, Text } from "@mantine/core";
import { Tag } from "@prisma/client";
import { Link } from "@remix-run/react";
import { filterTags, formatFullName } from "~/utils/utils";
import QRCodePreview from "../qrCode/QRCodePreview";

export interface PersonInfoViewProps {
  personId: number;
  qrCode?: string | null;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  tags?: Tag[] | null;
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
          <QRCodePreview qrCode={qrCode} />
          <Stack gap={0}>
            <Text
              ta="center"
              fw="bold"
              component={Link}
              to={`/people/${personId}`}
            >
              {fullName}
            </Text>
            {qrCode &&
              tags &&
              filterTags(tags, "Person Role").map((tag) => (
                <Badge key={tag.name} color={tag.color} autoContrast>
                  {tag.name}
                </Badge>
              ))}
          </Stack>
        </Flex>
        <Flex direction="row" wrap="nowrap" align="center" gap="xs">
          {!qrCode &&
            tags &&
            filterTags(tags).map((tag) => (
              <Badge key={tag.name} color={tag.color} autoContrast>
                {tag.name}
              </Badge>
            ))}
          {rightSection}
        </Flex>
      </Flex>
    </Stack>
  );
}
