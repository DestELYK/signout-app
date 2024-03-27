import { Badge, Flex, Highlight } from "@mantine/core";
import { ItemWithCount } from "~/routes/items";

export default function ItemView({highlight, item}: {highlight: string, item: ItemWithCount}) {
  return (
    <>
      <Highlight highlight={highlight}>
        {item.name}
      </Highlight>
      <Flex direction="row" gap="sm" justify="space-between">
        <Badge
          style={{ justifySelf: "flex-start" }}
          color={item._count.loans > 0 ? "red" : "green"}
        >
          {item._count.loans > 0 ? "Out" : "In"}
        </Badge>
        <Badge style={{ justifySelf: "flex-end" }} miw="max-content" ml="auto">
          {item.type}
        </Badge>
      </Flex>
    </>
  );
}
