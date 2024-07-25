import { AreaChart } from "@mantine/charts";
import { Center, Flex, Stack } from "@mantine/core";
import { useSearchParams } from "@remix-run/react";
import dayjs from "dayjs";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import MonthCombobox from "~/components/MonthCombobox";
import StatView from "~/components/StatView";
import InfoView from "~/components/base/InfoView";
import { prisma } from "~/lib/prisma.server";
import { IN_COLOR, OUT_COLOR } from "~/utils/consts";
import { updateByMonth } from "~/utils/utils";

export const loader = async () => {
  //#region Items by Month
  const allItems = await prisma.item.findMany({
    include: {
      loans: {
        select: {
          loanId: true,
          dateLoaned: true,
          dateReturned: true,
          loan: {
            select: {
              person: {
                include: {
                  tags: true,
                },
              },
            },
          },
        },
      },
      tags: true,
    },
  });

  let itemsByMonth: {
    month: string;
    totalLoans: number;
    totalReturns: number;
    days: { addedCount: number; loanCount: number; returnCount: number }[];
  }[] = [];

  const initialize = (month: string, days: number) => {
    return {
      month: month,
      totalLoans: 0,
      totalReturns: 0,
      days: Array.from({ length: days }).map(() => ({
        addedCount: 0,
        loanCount: 0,
        returnCount: 0,
      })),
    };
  };

  // add count of items added
  allItems.forEach((item) => {
    // item added
    updateByMonth(
      itemsByMonth,
      item.createdDate,
      initialize,
      (month, day, count) => {
        month.days[day].addedCount += count;
      }
    );

    item.loans.forEach((loan) => {
      // item loaned
      updateByMonth(
        itemsByMonth,
        loan.dateLoaned,
        initialize,
        (month, day, count) => {
          month.totalLoans += count;
          month.days[day].loanCount += count;
        }
      );

      // item returned
      if (loan.dateReturned) {
        updateByMonth(
          itemsByMonth,
          loan.dateReturned,
          initialize,
          (month, day, count) => {
            month.totalReturns += count;
            month.days[day].returnCount += count;
          }
        );
      }
    });
  });

  itemsByMonth = itemsByMonth.sort((a, b) => a.month.localeCompare(b.month));
  //#endregion

  return typedjson({
    itemsByMonth,
  });
};

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();

  const [searchParams, setSearchParams] = useSearchParams();

  const currentMonth = dayjs().format("MM-YYYY");

  const selectedMonth = searchParams.has("month")
    ? searchParams.get("month")
    : dayjs().format("MM-YYYY");

  const loansInCurrentMonth = data.itemsByMonth.find(
    (month) => month.month === selectedMonth
  );

  const months = data.itemsByMonth.map((month) => month.month);

  return (
    <InfoView
      title={`Items in ${dayjs(selectedMonth, "MM-YYYY").format("MMMM YYYY")}`}
      headerProps={{ withBorder: true }}
      rightSection={
        <MonthCombobox
          months={months}
          value={selectedMonth}
          onChange={(value) =>
            setSearchParams(
              (prev) => {
                if (value === currentMonth) prev.delete("month");
                else prev.set("month", value);
                return prev;
              },
              { replace: true }
            )
          }
        />
      }
    >
      {loansInCurrentMonth ? (
        <>
          <Flex
            w="100%"
            h="100%"
            direction="row"
            gap="sm"
            justify="center"
            align="center"
          >
            <Stack visibleFrom="lg">
              <StatView
                orientation="horizontal"
                label="Items Loaned"
                value={loansInCurrentMonth.totalLoans}
              />
              <StatView
                orientation="horizontal"
                label="Items Returned"
                value={loansInCurrentMonth.totalReturns}
              />
            </Stack>
            <Stack hiddenFrom="lg">
              <StatView
                orientation="vertical"
                label="Items Loaned"
                value={loansInCurrentMonth.totalLoans}
              />
              <StatView
                orientation="vertical"
                label="Items Returned"
                value={loansInCurrentMonth.totalReturns}
              />
            </Stack>
            {
              //#region Area Chart
            }
            <AreaChart
              w="100%"
              h="100%"
              miw={{ lg: 300, md: 200 }}
              mih={200}
              p="sm"
              data={loansInCurrentMonth.days.map(
                ({ addedCount, loanCount, returnCount }, day) => {
                  return {
                    date: dayjs(selectedMonth, "MM-YYYY")
                      .set("date", day + 1)
                      .format("DD"),
                    loaned: loanCount,
                    returned: returnCount,
                    added: addedCount,
                  };
                }
              )}
              dotProps={{
                r: 1,
              }}
              xAxisProps={{ axisLine: true }}
              xAxisLabel="Day in Month"
              yAxisProps={{ axisLine: true }}
              dataKey="date"
              series={[
                {
                  name: "loaned",
                  label: "Items Loaned",
                  color: OUT_COLOR,
                },
                {
                  name: "returned",
                  label: "Items Returned",
                  color: IN_COLOR,
                },
                {
                  name: "added",
                  label: "Items Added",
                  color: "orange",
                },
              ]}
              withLegend
              curveType="linear"
            />
            {
              //#endregion
            }
          </Flex>
        </>
      ) : (
        <Center h={300}>No data for this month</Center>
      )}
    </InfoView>
  );
}
