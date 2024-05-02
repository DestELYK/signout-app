import { Text } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import dayjs from "dayjs";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import DateTimeline, { TimelineItemValues } from "~/components/DateTimeline";
import { IN_COLOR, OUT_COLOR } from "~/components/OutstandingBadge";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.personId, "Expected params.personId");

  const personId = Number(params.personId);

  return typedjson({
    loans: await prisma.loanedItem.findMany({
      where: {
        loan: {
          personId: personId,
        },
      },
      select: {
        dateLoaned: true,
        dateReturned: true,
        loan: {
          select: {
            id: true,
            tags: true,
          },
        },
        item: {
          select: {
            name: true,
          },
        },
      },
    }),
  });
};

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();

  const returnedLoans = data.loans.filter((l) => l.dateReturned !== null);

  //@ts-ignore
  const orderedLoans: TimelineItemValues[] = data && [
    ...data.loans.map((l) => ({
      id: l.loan.id,
      date: l.dateLoaned,
      children: <Text>{l.item.name}</Text>,
      label: `Loan #${l.loan.id} - Sign-Out`,
      icon: <IconMinus size={40} />,
      color: OUT_COLOR,
      line: "dotted",
    })),
    ...returnedLoans.map((l) => ({
      id: l.loan.id,
      date: l.dateReturned,
      children: <Text>{l.item.name}</Text>,
      label: `Loan #${l.loan.id} - Sign-In`,
      icon: <IconPlus size={40} />,
      color: IN_COLOR,
      line: "solid",
    })),
  ];

  orderedLoans.sort((a, b) => {
    return dayjs(a.date).diff(b.date);
  });

  return (
    <DateTimeline
      href="/loans"
      items={orderedLoans}
      active={orderedLoans.length - 1}
    />
  );
}
