import { BarChart } from "@mantine/charts";
import { Card, Center, Flex, Group, Loader, Stack } from "@mantine/core";
import { useNavigate, useNavigation } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import InfoView from "~/components/base/InfoView";
import PeopleList from "~/components/people/PeopleList";
import StatView from "~/components/StatView";
import { useDesktopOnly } from "~/lib/hooks";
import {
  getPeople,
  getPeopleWithInvalidItems,
  getPeopleRoleCounts as getRoleCount,
} from "~/lib/people.server";
import { prisma } from "~/lib/prisma.server";
import { IN_COLOR, OUT_COLOR } from "~/utils/consts";

export const loader = async () => {
  const roleCount = await getRoleCount();

  const peopleWithInvalidItems = await getPeopleWithInvalidItems();

  return typedjson({
    roleLoans: roleCount.roleCounts ?? [],
    peopleWithInvalidItems: peopleWithInvalidItems.peopleWithInvalidItems ?? [],
    peopleWithOutstandingLoans:
      (await getPeople({ outstanding: true })).people ?? [],
    totalPeople: await prisma.person.count(),
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
          w="100%"
          h="100%"
          direction="row"
          wrap="nowrap"
          gap="sm"
          visibleFrom="md"
        >
          <Stack w={{ md: "60%", lg: "65%" }} h="100%">
            <Group w="100%" align="stretch" grow style={{ flexWrap: "nowrap" }}>
              <Card withBorder>
                <StatView label="People" value={data.totalPeople} />
              </Card>
              <Card w={150} withBorder>
                <StatView
                  label="People with Outstanding Loans"
                  value={data.peopleWithOutstandingLoans.length}
                  color={OUT_COLOR}
                />
              </Card>
              <Card w={150} withBorder>
                <StatView
                  label="People with Invalid Items"
                  value={data.peopleWithInvalidItems.length}
                  color="red"
                />
              </Card>
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
                <Center h={200}>No data</Center>
              )}
            </InfoView>
            <Card w="100%" p={0} withBorder>
              <PeopleList
                h={220}
                data={data.peopleWithInvalidItems.map((person) => ({
                  ...person,
                  tags: undefined,
                }))}
                totalCount={data.peopleWithInvalidItems.length}
                orientation="horizontal"
                withOffset={true}
                initialItemsPerPage={20}
                emptyText="No people found"
                showPagination={false}
                withSearch={false}
              />
            </Card>
          </Stack>
          <InfoView
            title={`People with Outstanding Loans`}
            headerProps={{ withBorder: true }}
            cardProps={{
              w: { md: "40%", lg: "35%" },
            }}
          >
            <Card.Section h="calc(100% - 20px)">
              <PeopleList
                data={data.peopleWithOutstandingLoans}
                totalCount={data.peopleWithOutstandingLoans.length}
                initialItemsPerPage={20}
                emptyText="No people found"
                showPagination={false}
                withSearch={false}
              />
            </Card.Section>
          </InfoView>
        </Flex>
      ) : (
        //#endregion
        //#region Mobile
        <Flex
          w="100%"
          h="100%"
          align="center"
          direction="column"
          wrap="nowrap"
          gap="sm"
          hiddenFrom="md"
        >
          <Group
            w="100%"
            h={100}
            align="stretch"
            grow
            style={{ flexWrap: "nowrap" }}
          >
            <Card withBorder>
              <StatView label="People" value={data.totalPeople} />
            </Card>
            <Card w={150} withBorder>
              <StatView
                label="People with Outstanding Loans"
                value={data.peopleWithOutstandingLoans.length}
                color={OUT_COLOR}
              />
            </Card>
            <Card w={150} withBorder>
              <StatView
                label="People with Invalid Items"
                value={data.peopleWithInvalidItems.length}
                color="red"
              />
            </Card>
          </Group>

          <InfoView
            title={`People with Outstanding Loans`}
            headerProps={{ withBorder: true }}
          >
            <Card.Section h="calc(100% - 20px)">
              <PeopleList
                data={data.peopleWithOutstandingLoans}
                totalCount={data.peopleWithOutstandingLoans.length}
                initialItemsPerPage={20}
                emptyText="No people found"
                showPagination={false}
                withSearch={false}
                withOffset={false}
              />
            </Card.Section>
          </InfoView>
        </Flex>
        //#endregion
      )}
    </>
  );
}
