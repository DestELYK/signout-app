import { Center, Text, Timeline } from "@mantine/core";
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
import {
  typedjson,
  useTypedLoaderData,
  useTypedRouteLoaderData,
} from "remix-typedjson";
import invariant from "tiny-invariant";
import { dateDiff, formatDate } from "~/utils/utils";
import { loader as itemLoader } from "./items.$itemId";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.itemId, "Expected params.itemId");

  return typedjson({
    loans: await prisma.loanedItem.findMany({
      where: {
        itemId: parseInt(params.itemId),
      },
      select: {
        dateLoaned: true,
        dateReturned: true,
        loan: {
          select: {
            id: true,
            tags: true,
            person: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                nickname: true,
              },
            },
          },
        },
      },
    }),
  });

  // return {await prisma.item.findFirstOrThrow({
  //   where: { id: parseInt(params.itemId) },
  //   select: {
  //     id: true,
  //     name: true,
  //     loans: {
  //       include: {
  //         loan: {
  //           include: {
  //             person: true,
  //             tags: true,
  //           },
  //         },
  //         returnedBy: {
  //           include: {
  //             tags: true,
  //           },
  //         },
  //       },
  //       orderBy: {
  //         dateLoaned: "asc",
  //       },
  //     },
  //     tags: true,
  //   },
  //   orderBy: {
  //     name: "asc",
  //   },
  // })};
};

export default function Page() {
  const parentData =
    useTypedRouteLoaderData<typeof itemLoader>(`/items.$itemId`);
  const data = useTypedLoaderData<typeof loader>();
  const viewportRef = useRef<HTMLDivElement>(null);

  const returnedLoans = data.loans.filter((l) => l.dateReturned);

  const orderedLoans: {
    id: number;
    dateLoaned: Date;
    dateReturned?: Date;
    lost?: boolean;
  }[] = data && [
    ...data.loans.map((l) => {
      return {
        id: l.loan.id,
        person: l.loan.person,
        dateLoaned: l.dateLoaned,
      };
    }),
    ...returnedLoans.map((l) => {
      return {
        id: l.loan.id,
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

  if (
    parentData &&
    parentData.item &&
    parentData.item.tags.find((t) => t.name === "Lost")
  ) {
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

  return orderedLoans.length > 0 ? (
    <Timeline active={orderedLoans.length} bulletSize={32} lineWidth={4}>
      {timelineItems}
    </Timeline>
  ) : (
    <Center h="60dvh" w="100%">
      <Text>No timeline</Text>
    </Center>
  );
}
