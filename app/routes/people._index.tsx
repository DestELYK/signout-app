import { BarChart } from "@mantine/charts";
import { Box, Center, Flex, Group, Loader, Stack } from "@mantine/core";
import { Tag } from "@prisma/client";
import { useNavigate, useNavigation } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import InfoView from "~/components/base/InfoView";
import PeopleList from "~/components/people/PeopleList";
import StatCard from "~/components/StatCard";
import { useDesktopOnly } from "~/lib/hooks";
import { prisma } from "~/lib/prisma.server";
import { IN_COLOR, OUT_COLOR, ROLE_ORDER } from "~/utils/consts";

export const loader = async () => {
  const allPeople = await prisma.person.findMany({
    include: {
      loans: {
        select: {
          id: true,
          createdDate: true,
          items: {
            select: {
              dateLoaned: true,
              dateReturned: true,
              item: {
                select: {
                  id: true,
                  name: true,
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

  //#region Loans by Role

  const roleLoans = await prisma.tag.findMany({
    where: { category: "Person Role" },
    select: {
      name: true,
      people: { select: { id: true } },
    },
  });

  let roleCount: {
    role: string;
    loanCount: number;
    returnCount: number;
  }[] = [];

  for (let i = 0; i < roleLoans.length; i++) {
    const role = roleLoans[i];

    const loans = await prisma.loan.findMany({
      where: { personId: { in: role.people.map((person) => person.id) } },
      include: { items: true },
    });

    const existingRole = roleCount.find((r) => r.role === role.name);

    if (existingRole) {
      existingRole.loanCount = loans.length;
      existingRole.returnCount = loans.filter((loan) =>
        loan.items.some((item) => item.dateReturned)
      ).length;
    } else {
      roleCount.push({
        role: role.name,
        loanCount: loans.length,
        returnCount: loans.filter((loan) =>
          loan.items.some((item) => item.dateReturned)
        ).length,
      });
    }
  }

  roleCount = roleCount.sort(
    (a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role)
  );

  //#endregion

  //#region People with Outstanding Loans
  const peopleWithOutstandingLoans: {
    id: number;
    firstName: string;
    lastName: string;
    nickname: string | null;
    tags: Tag[];
    outstandingLoans: number;
  }[] = [];
  //#endregion

  //#region Invalid Items

  const peopleWithInvalidItems: {
    id: number;
    firstName: string;
    lastName: string;
    nickname: string | null;
    tags: Tag[];
    invalidItems: {
      id: number;
      name: string;
      dateLoaned: Date;
      status: Tag;
    }[];
  }[] = [];

  for (let i = 0; i < allPeople.length; i++) {
    const person = allPeople[i];
    const outstandingLoans = person.loans.filter((loan) =>
      loan.items.some((item) => !item.dateReturned)
    );

    if (outstandingLoans.length <= 0) {
      continue;
    }

    peopleWithOutstandingLoans.push({
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      nickname: person.nickname,
      tags: person.tags,
      outstandingLoans: outstandingLoans.length,
    });

    const invalidItems: {
      id: number;
      name: string;
      dateLoaned: Date;
      status: Tag;
    }[] = [];
    outstandingLoans
      .filter((loan) =>
        loan.items.some((item) =>
          item.item.tags.find((tag) => tag.category === "Item Status")
        )
      )
      .forEach((loan) => {
        loan.items.forEach((item) => {
          const statusTag = item.item.tags.find(
            (tag) => tag.category === "Item Status"
          );

          if (statusTag) {
            invalidItems.push({
              id: item.item.id,
              name: item.item.name,
              dateLoaned: item.dateLoaned,
              status: statusTag,
            });
          }
        });
      });

    if (invalidItems.length > 0) {
      peopleWithInvalidItems.push({
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        nickname: person.nickname,
        tags: person.tags,
        invalidItems: invalidItems,
      });
    }
  }

  return typedjson({
    roleLoans: roleCount,
    peopleWithInvalidItems: peopleWithInvalidItems,
    peopleWithOutstandingLoans: peopleWithOutstandingLoans,
    totalPeople: allPeople.length,
  });
};

export default function Page() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const desktopOnly = useDesktopOnly();

  const data = useTypedLoaderData<typeof loader>();

  return (
    <>
      {desktopOnly === undefined ? (
        <Center>
          <Loader />
        </Center>
      ) : desktopOnly ? (
        //#region Desktop
        <Flex
          w={{
            md: "calc(100% - 20rem)",
            lg: "calc(100% - 24rem)",
            xl: "calc(100% - 26rem)",
          }}
          mih={600}
          h="calc(100dvh - 13rem)"
          direction="row"
          wrap="nowrap"
          gap="sm"
          visibleFrom="md"
        >
          <Stack w="100%" h="100%">
            <Group w="100%" grow style={{ flexWrap: "nowrap" }}>
              <StatCard
                label="People"
                value={data.totalPeople}
                cardProps={{ h: "100%" }}
              />
              <StatCard
                label="People with Outstanding Loans"
                value={data.peopleWithOutstandingLoans.length}
                color={OUT_COLOR}
                cardProps={{ w: 150, h: "100%" }}
              />
              <StatCard
                label="People with Invalid Items"
                value={data.peopleWithInvalidItems.length}
                color="red"
                cardProps={{ w: 150, h: "100%" }}
              />
            </Group>
            <InfoView title="Loans by Role" headerProps={{ withBorder: true }}>
              {data.roleLoans && data.roleLoans.length > 0 ? (
                <BarChart
                  w="100%"
                  h="100%"
                  miw={250}
                  mih={200}
                  p="sm"
                  orientation="vertical"
                  data={data.roleLoans.map(
                    ({ role, loanCount, returnCount }) => {
                      return {
                        role: role,
                        loaned: loanCount,
                        returned: returnCount,
                      };
                    }
                  )}
                  dataKey="role"
                  barChartProps={{
                    barCategoryGap: 3,
                    barGap: 1,
                  }}
                  barProps={{
                    onClick: (data) => {
                      if ("role" in data) {
                        navigate(`/people/list?role=${data.role}`);
                      }
                    },
                    style: { cursor: "pointer" },
                  }}
                  gridAxis="y"
                  xAxisProps={{ allowDecimals: false, tickCount: 10 }}
                  yAxisProps={{ width: 80, interval: 0, axisLine: true }}
                  series={[
                    { name: "loaned", label: "Loans", color: OUT_COLOR },
                    { name: "returned", label: "Returns", color: IN_COLOR },
                  ]}
                />
              ) : (
                <Center h={300}>No data</Center>
              )}
            </InfoView>
            <Box w="100%" h={250}>
              <PeopleList
                data={data.peopleWithInvalidItems.map((person) => ({
                  ...person,
                  tags: undefined,
                }))}
                totalCount={data.peopleWithInvalidItems.length}
                orientation="horizontal"
                initialItemsPerPage={20}
                emptyText="No people found"
                showPagination={false}
                withSearch={false}
              />
            </Box>
          </Stack>
          <InfoView
            title={`People with Outstanding Loans`}
            headerProps={{ withBorder: true }}
            cardProps={{
              w: "auto",
              miw: { md: 300, lg: 350, xl: 400 },
            }}
          >
            <Box h="100%" mih={300}>
              <PeopleList
                data={data.peopleWithOutstandingLoans.map((person) => ({
                  ...person,
                  _count: {
                    loans: person.outstandingLoans,
                  },
                }))}
                totalCount={data.peopleWithOutstandingLoans.length}
                initialItemsPerPage={20}
                emptyText="No people found"
                showPagination={false}
                withSearch={false}
              />
            </Box>
          </InfoView>
        </Flex>
      ) : (
        //#endregion
        //#region Mobile
        <Flex
          w="100%"
          mih={400}
          h="100%"
          align="center"
          direction="column"
          wrap="nowrap"
          gap="sm"
          hiddenFrom="md"
        >
          <Group w="100%" h={100} grow style={{ flexWrap: "nowrap" }}>
            <StatCard
              label="People"
              value={data.totalPeople}
              cardProps={{ h: "100%" }}
            />
            <StatCard
              label="People with Outstanding Loans"
              value={data.peopleWithOutstandingLoans.length}
              color={OUT_COLOR}
              cardProps={{ w: 150, h: "100%" }}
            />
            <StatCard
              label="People with Invalid Items"
              value={data.peopleWithInvalidItems.length}
              color="red"
              cardProps={{ w: 150, h: "100%" }}
            />
          </Group>

          <InfoView
            title={`People with Outstanding Loans`}
            headerProps={{ withBorder: true }}
            cardProps={{ mih: 300 }}
          >
            <PeopleList
              data={data.peopleWithOutstandingLoans.map((person) => ({
                ...person,
                _count: {
                  loans: person.outstandingLoans,
                },
              }))}
              totalCount={data.peopleWithOutstandingLoans.length}
              initialItemsPerPage={20}
              emptyText="No people found"
              showPagination={false}
              withSearch={false}
            />
          </InfoView>
        </Flex>
        //#endregion
      )}
    </>
  );
}
