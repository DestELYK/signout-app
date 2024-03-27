import {
  Badge,
  Card,
  Flex,
  Stack,
  Text,
  Title,
  px,
  rem
} from "@mantine/core";
import { dateDiff, fullName } from "~/lib/utils";
import { LoanItemPayload } from "../routes/loans";

export function LoanItemView({
  loan,
  isActive,
  onClick,
}: {
  loan: LoanItemPayload;
  isActive?: boolean | false;
  onClick: React.MouseEventHandler;
}) {
  const loanItemHeight = 100;

  return (
    <Card
      withBorder
      shadow="sm"
      radius="sm"
      p="lg"
      mih={rem(loanItemHeight)}
      w="100%"
      className="active"
      {...(loan._count.items > 0 && {
        style: {
          borderColor: "red",
          borderWidth: px(2),
        },
      })}
    >
      <Card.Section withBorder inheritPadding px="xs">
        <Flex
          direction="row"
          justify="flex-end"
          align="center"
          w="100%"
          gap="md"
        >
          <Title
            w="100%"
            order={5}
            fw="bold"
            lineClamp={1}
            style={{ justifySelf: "flex-start" }}
          >
            {/* @ts-ignore */}
            {fullName(loan.person)}
          </Title>

          <Badge
            color={loan.person.role === "Staff" ? "blue" : "green"}
            miw="max-content"
          >
            {loan.person.role}
          </Badge>
        </Flex>
      </Card.Section>
      <Card.Section onClick={onClick}>
        <Stack mt="xs" gap={0}>
          <Text size="sm" ta="center">{`Out since ${new Date(
            loan.createdDate
          ).toDateString()} (${dateDiff(new Date(loan.createdDate))})`}</Text>
          <Text size="sm" ta="center">{`${loan._count.items} outstanding item${
            loan._count.items > 1 ? "s" : ""
          }`}</Text>
        </Stack>
      </Card.Section>
    </Card>
  );
}
