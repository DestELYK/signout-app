import { Badge, Flex, Group, Highlight } from "@mantine/core";
import { Tag } from "@prisma/client";
import { formatFullName } from "~/utils/utils";

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
      <Highlight
        w="100%"
        truncate="end"
        highlight={highlight}
        {...(outStandingLoans > 0 ? { c: "red" } : {})}
      >
        {formatFullName(fullName)}
      </Highlight>
      <Flex direction="row" gap="sm" justify="space-between">
        {outStandingLoans > 0 ? (
          <Badge color="red" style={{ justifySelf: "flex-start" }} autoContrast>
            {outStandingLoans} loan
            {outStandingLoans > 1 ? "s" : ""} out
          </Badge>
        ) : null}
        <Group>
          {tags.map((tag) => (
            <Badge
              key={tag.name}
              style={{ justifySelf: "flex-end" }}
              miw="max-content"
              ml="auto"
              color={tag.color}
              autoContrast
            >
              {tag.name}
            </Badge>
          ))}
        </Group>
      </Flex>
    </>
  );
}
