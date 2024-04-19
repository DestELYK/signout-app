import {
    ActionIcon,
    Card,
    Collapse,
    Flex,
    Group,
    Pagination,
    ScrollArea,
    Text,
    Title
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "@remix-run/react";
import { IconHome } from "@tabler/icons-react";
import { useRef, useState } from "react";

const ITEMS_PER_PAGE = 15;

export interface ListViewProps<T extends { id: number }> {
  title: string;
  itemsPerPage: number;
  items: T[];
  bottomSection?: React.ReactNode;
  children: (item: T) => React.ReactNode;
}

export default function ListView<T extends { id: number }>({
  title,
  itemsPerPage = ITEMS_PER_PAGE,
  items,
  bottomSection,
  children,
}: ListViewProps<T>) {
  const [filterOpened, { toggle: toggleFilter }] = useDisclosure(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [activePage, setPage] = useState(1);

  const filteredItems = items.slice(
    (activePage - 1) * itemsPerPage,
    (activePage - 1) * itemsPerPage + itemsPerPage
  );

  return (
    <Card
      padding="sm"
      radius="sm"
      withBorder
      miw={{ base: "20rem", lg: "40rem" }}
      h="100%"
      shadow="sm"
    >
      <Card.Section withBorder inheritPadding p="xs" mb="sm">
        <Flex
          direction="row"
          justify="flex-end"
          align="center"
          w="100%"
          gap="md"
        >
          <ActionIcon variant="subtle" color="gray" component={Link} to="/">
            <IconHome />
          </ActionIcon>
          <Title
            order={4}
            ta="center"
            fw="bold"
            w="100%"
            lineClamp={1}
            style={{ justifySelf: "flex-start" }}
          >
            {title}
          </Title>
        </Flex>
      </Card.Section>
      <Collapse in={filterOpened}>
        <Text>Filter stuff</Text>
      </Collapse>
      {items.length > 0 ? (
        <ScrollArea.Autosize
          mah="calc(100dvh - 10rem)"
          type="auto"
          scrollbars="y"
          viewportRef={scrollRef}
        >
          {filteredItems.map((item) => children(item))}
        </ScrollArea.Autosize>
      ) : (
        <div className="h-full w-full">No Outstanding Loans</div>
      )}
      {items.length > itemsPerPage && (
        <Pagination.Root
          w="100%"
          mt="md"
          px="sm"
          style={{ flexWrap: "nowrap" }}
          total={
            items.length > itemsPerPage
              ? Math.ceil(items.length / itemsPerPage)
              : items.length
          }
          value={activePage}
          onChange={(value) => {
            setPage(value);

            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <Group gap={5} justify="center">
            <Pagination.Previous />
            <Pagination.Items />
            <Pagination.Next />
          </Group>
        </Pagination.Root>
      )}
      <Card.Section withBorder inheritPadding p="lg" mt="xs">
        {bottomSection}
      </Card.Section>
    </Card>
  );
}
