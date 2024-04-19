import { Badge, Flex, Group, Highlight } from "@mantine/core";
import { PersonFindMany } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";

export default function PersonComboView({
  highlight,
  person,
}: {
  highlight: string;
  person: PersonFindMany;
}) {
  return (
    <>
      <Highlight
        w="100%"
        truncate="end"
        highlight={highlight}
        {...(person._count.loans > 0 ? { c: "red" } : {})}
      >
        {formatFullName(person)}
      </Highlight>
      <Flex direction="row" gap="sm" justify="space-between">
        {person._count.loans > 0 ? (
          <Badge color="red" style={{ justifySelf: "flex-start" }} autoContrast>
            {person._count.loans} loan
            {person._count.loans > 1 ? "s" : ""} out
          </Badge>
        ) : null}
        <Group>
          {person.tags.map((tag) => (
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
