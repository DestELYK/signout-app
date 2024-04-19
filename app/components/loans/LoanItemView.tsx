import { Badge, Card, Group, Stack, Text, Title, rem } from "@mantine/core";
import { LoanFindMany } from "~/utils/types.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";

export function LoanItemView({
  loan,
  active,
  onClick,
}: {
  loan: LoanFindMany;
  active?: boolean;
  onClick: React.MouseEventHandler;
}) {
  const loanItemHeight = 100;

  const outstanding = loan.items.find((i) => !i.dateReturned) != undefined;

  const sortedItems = loan.items.sort((a, b) => {
    if (a.dateReturned && b.dateReturned && a.dateReturned > b.dateReturned) {
      return 1;
    } else if (
      a.dateReturned &&
      b.dateReturned &&
      a.dateReturned < b.dateReturned
    ) {
      return -1;
    } else {
      return 0;
    }
  });

  return (
    <Card
      withBorder
      shadow="sm"
      radius="sm"
      p="lg"
      mb="xs"
      mih={rem(loanItemHeight)}
      w="100%"
      onClick={onClick}
      style={{
        cursor: "pointer",
      }}
      {...(active && {
        bg: "blue",
        c: "white",
      })}
    >
      <Card.Section withBorder inheritPadding px="xs" mb="sm">
        <Group justify="space-between" gap={0}>
          <Title
            order={5}
            fw="bold"
            lineClamp={1}
            style={{ justifySelf: "flex-start" }}
          >
            #{loan.id}
          </Title>
          <Group justify="end">
            {loan.tags.map((tag, index) => (
              <Badge key={index} color={tag.color} autoContrast>
                {tag.name}
              </Badge>
            ))}
            <Badge color={outstanding ? "red" : "green"} autoContrast>
              {outstanding ? "Out" : "In"}
            </Badge>
          </Group>
        </Group>
      </Card.Section>
      <Card.Section inheritPadding px="xs" mb="xs">
        <Group justify="space-between" gap={0}>
          <Title
            order={6}
            fw="bold"
            lineClamp={1}
            style={{ justifySelf: "flex-start" }}
          >
            {formatFullName(loan.person)}
          </Title>
          <Group style={{ justifySelf: "center" }}>
            {loan.person.tags.map((tag) => (
              <Badge key={tag.name} color={tag.color} variant="dot" autoContrast>
                {tag.name}
              </Badge>
            ))}
          </Group>
        </Group>
      </Card.Section>
      <Card.Section>
        {outstanding ? (
          <Stack gap={0}>
            <Text size="sm" ta="center">
              Out since{" "}
              {formatDate(loan.createdDate, {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })}{" "}
              ({dateDiff(loan.createdDate)})
            </Text>
            {loan.items.map((i) => (
              <Text key={i.item.id} size="sm" ta="center">
                {`${i.item.name} - ${i.dateReturned ? "In" : "Out"}`}
              </Text>
            ))}
          </Stack>
        ) : (
          <Text size="sm" ta="center">
            All items returned on{" "}
            {formatDate(sortedItems[0].dateReturned!, {
              month: "short",
              day: "2-digit",
              year: "numeric",
            })}
          </Text>
        )}
      </Card.Section>
    </Card>
  );
}
