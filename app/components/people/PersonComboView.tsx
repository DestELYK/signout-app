import { Flex, Highlight, Text } from "@mantine/core";
import { Tag } from "@prisma/client";
import { formatFullName } from "~/utils/utils";
import TagGroup from "../tags/TagGroup";

export interface PersonComboViewProps {
  highlight: string | string[];
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
        <TagGroup tags={tags} categories={["Person Role"]} />
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
