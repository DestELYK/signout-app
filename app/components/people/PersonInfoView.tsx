import { Badge, Flex, Group, Text } from "@mantine/core";
import { Link } from "@remix-run/react";
import { formatFullName } from "~/utils/utils";

export interface PersonInfoViewProps {
  personId: number;
  firstName: string;
  lastName: string;
  nickname?: string | null;
  role?: { name: string; color: string } | null;
  rightSection?: React.ReactNode;
}

export default function PersonInfoView({
  personId,
  firstName,
  lastName,
  nickname,
  role,
  rightSection,
}: PersonInfoViewProps) {
  const fullName = formatFullName({ firstName, lastName, nickname });

  return (
    <Flex align="center" direction="row" justify="space-between" wrap="nowrap">
      <Text
        ta="center"
        fw="bold"
        component={Link}
        to={`/people/${personId}`}
      >
        {fullName}
      </Text>
      <Group align="center" style={{ flexWrap: "nowrap" }}>
        {role && (
          <Badge color={role.color} autoContrast>
            {role.name}
          </Badge>
        )}
        {rightSection}
      </Group>
    </Flex>
  );
}
