import { Badge, Flex, Group, Highlight, Text } from "@mantine/core";
import { Tag } from "@prisma/client";
import { filterTags, formatFullName } from "~/utils/utils";

export interface PersonComboViewProps {
  highlight: string;
  fullName: { firstName: string; lastName: string; nickname?: string | null };
  outStandingLoans: number;
  tags: Tag[];
}

export default function PersonComboView({
  highlight,
  fullName,
  outStandingLoans,
  tags,
}: PersonComboViewProps) {
  return (
    <>
      <Flex direction="row" gap="sm" justify="space-between">
        <Highlight w="100%" lineClamp={2} highlight={highlight}>
          {formatFullName(fullName)}
        </Highlight>
        <Group>
          {filterTags(tags, "Person Role").map((tag) => (
            <Badge key={tag.name} color={tag.color} variant="dot" autoContrast>
              {tag.name}
            </Badge>
          ))}
        </Group>
      </Flex>
      {outStandingLoans > 0 ? (
        <Text c="red" size="xs" fw="bold">
          {outStandingLoans} loan
          {outStandingLoans > 1 ? "s" : ""} out
        </Text>
      ) : null}
    </>
  );
}
