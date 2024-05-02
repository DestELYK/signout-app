import { LoaderFunctionArgs } from "@remix-run/node";
import {
  IconCheck,
  IconCircle,
  IconMinus,
  IconPlus,
  IconQuestionMark,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import {
  typedjson,
  useTypedLoaderData,
  useTypedRouteLoaderData,
} from "remix-typedjson";
import invariant from "tiny-invariant";
import DateTimeline, { TimelineItemValues } from "~/components/DateTimeline";
import { IN_COLOR, OUT_COLOR } from "~/components/OutstandingBadge";
import { prisma } from "~/lib/prisma.server";
import { filterTags } from "~/utils/utils";
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
};

export default function Page() {
  const parentData =
    useTypedRouteLoaderData<typeof itemLoader>(`routes/items.$itemId`);
  const data = useTypedLoaderData<typeof loader>();

  const returnedLoans = data.loans.filter((l) => l.dateReturned !== null);

  //@ts-ignore
  const orderedLoans: TimelineItemValues[] = data && [
    ...data.loans.map((l) => ({
      id: l.loan.id,
      person: l.loan.person,
      date: l.dateLoaned,
      label: `Loan #${l.loan.id} - Sign-Out`,
      icon: <IconMinus size={40} />,
      color: OUT_COLOR,
      line: "dotted",
    })),
    ...returnedLoans.map((l) => ({
      id: l.loan.id,
      person: l.loan.person,
      date: l.dateReturned,
      label: `Loan #${l.loan.id} - Sign-In`,
      icon: <IconPlus size={40} />,
      color: IN_COLOR,
      line: "solid",
    })),
  ];

  orderedLoans.sort((a, b) => {
    return dayjs(a.date).diff(b.date);
  });

  if (parentData && parentData.item) {
    orderedLoans.unshift({
      id: -1,
      date: parentData.item.createdDate,
      label: "Item Added",
      icon: <IconCircle size={40} />,
      color: "blue",
      line: "solid",
    });

    const status = filterTags(parentData.item.tags, "Item Status");

    const lastItem = orderedLoans[orderedLoans.length - 1];

    if (lastItem.label.includes("Sign-Out")) {
      orderedLoans.push({
        id: orderedLoans.length,
        date: new Date(),
        label: status.length > 0 ? status[0].name : "Outstanding",
        icon:
          status.length > 0 ? (
            status[0].name === "Missing" || status[0].name === "Lost" ? (
              <IconQuestionMark size={40} />
            ) : (
              <IconTrash size={40} />
            )
          ) : (
            <IconX size={40} />
          ),
        color: status.length > 0 ? "red" : "blue",
        line: "dotted",
      });
    } else {
      orderedLoans.push({
        id: orderedLoans.length,
        date: new Date(),
        label: "Available",
        icon: <IconCheck size={40} />,
        color: "blue",
        line: "solid",
      });
    }
  }

  return (
    <DateTimeline
      href="/loans"
      items={orderedLoans}
      active={
        orderedLoans.length -
        (orderedLoans[orderedLoans.length - 1].label !== "Available" ? 2 : 1)
      }
    />
  );
}
