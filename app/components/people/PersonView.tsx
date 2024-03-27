import { Badge, Flex, Highlight } from "@mantine/core";
import { fullName } from "~/lib/utils";
import { PersonWithCount } from "~/routes/people";

export default function PersonView({highlight, person}: {highlight: string, person: PersonWithCount}) {
  return (
    <>
      <Highlight
        w="100%"
        truncate="end"
        highlight={highlight}
        {...(person._count.loans > 0 ? { c: "red" } : {})}
      >
        {fullName(person)}
      </Highlight>
      <Flex direction="row" gap="sm" justify="space-between">
        {person._count.loans > 0 ? (
          <Badge color="red" style={{ justifySelf: "flex-start" }}>
            {person._count.loans} loan
            {person._count.loans > 1 ? "s" : ""} out
          </Badge>
        ) : null}
        <Badge
          style={{ justifySelf: "flex-end" }}
          miw="max-content"
          ml="auto"
          color={person.role === "Staff" ? "blue" : "green"}
        >
          {person.role}
        </Badge>
      </Flex>
    </>
  );
}
