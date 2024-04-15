import { Center, ScrollArea, Text, Timeline } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import {
  IconMinus,
  IconPlus,
  IconQuestionMark,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";
import { useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { dateDiff, formatDate } from "~/utils/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.itemId, "Expected params.itemId");

  return await prisma.item.findFirstOrThrow({
    where: { id: parseInt(params.itemId) },
    select: {
      id: true,
      name: true,
      loans: {
        include: {
          loan: {
            include: {
              person: true,
              tags: true,
            },
          },
          returnedBy: {
            include: {
              role: true,
            },
          },
        },
        orderBy: {
          dateLoaned: "asc",
        },
      },
      tags: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export default function Page() {
  const item = useTypedLoaderData<typeof loader>();
  const viewportRef = useRef<HTMLDivElement>(null);

  const returnedLoans = item.loans.filter((l) => l.dateReturned);

  const orderedLoans: {
    id: number;
    dateLoaned: Date;
    dateReturned?: Date;
    lost?: boolean;
  }[] = item && [
    ...item.loans.map((l) => {
      return {
        id: l.loanId,
        person: l.loan.person,
        dateLoaned: l.dateLoaned,
      };
    }),
    ...returnedLoans.map((l) => {
      return {
        id: l.loanId,
        person: l.loan.person,
        dateLoaned: l.dateLoaned,
        dateReturned: l.dateReturned,
      };
    }),
  ];

  orderedLoans.sort((a, b) => {
    if (a.id && b.id && a.dateReturned) {
      return dayjs(a.dateReturned).diff(b.dateLoaned);
    } else {
      return dayjs(a.dateLoaned).diff(b.dateLoaned);
    }
  });

  if (item && item.tags.find((t) => t.name === "Lost")) {
    const lastItem = orderedLoans[orderedLoans.length - 1];

    orderedLoans.push({
      ...lastItem,
      lost: true,
    });
  }

  const timelineItems = orderedLoans ? (
    orderedLoans.map((l) => {
      return (
        <Timeline.Item
          data-list-item
          key={
            l.dateReturned ? `${l.id}-returned` : l.lost ? `${l.id}-lost` : l.id
          }
          bullet={
            l.dateReturned ? (
              <IconPlus />
            ) : l.lost ? (
              <IconQuestionMark />
            ) : (
              <IconMinus />
            )
          }
          title={
            <Text component={Link} to={`/loans/${l.id}`}>
              {`Loan #${l.id} - ${
                l.lost ? "Lost" : `Sign ${l.dateReturned ? "In" : "Out"}`
              }`}
            </Text>
          }
          lineVariant={l.dateReturned ? "solid" : "dashed"}
          color={l.dateReturned ? "green" : l.lost ? "orange" : "red"}
          style={{ justifyItems: "center" }}
        >
          <Text size="sm" c="dimmed">
            {formatDate(l.dateReturned || l.dateLoaned)}
          </Text>
          <Text size="xs" mt={4}>
            {dateDiff(l.dateReturned || l.dateLoaned)}
          </Text>
        </Timeline.Item>
      );
    })
  ) : (
    <Timeline.Item bullet={<IconX />} title="No history" />
  );

  useEffect(() => {
    viewportRef.current
      ?.querySelectorAll("[data-list-item]")
      [orderedLoans.length - 1]?.scrollIntoView({ block: "nearest" });
  }, [timelineItems]);

  return (
    <Center w="100%" h="100%">
      <ScrollArea
        w="100%"
        h="calc(100dvh - 1rem)"
        scrollbars="y"
        type="auto"
        ref={viewportRef}
      >
        <Timeline active={orderedLoans.length} bulletSize={32} lineWidth={4}>
          {timelineItems}
        </Timeline>
      </ScrollArea>
    </Center>
  );
}
