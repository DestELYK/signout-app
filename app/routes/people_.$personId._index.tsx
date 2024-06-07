import { Center, Flex, Skeleton, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import PersonInfoView from "~/components/people/PersonInfoView";
import { loader as personLoader } from "./people_.$personId";

export default function Page() {
  const data = useTypedRouteLoaderData<typeof personLoader>(
    "routes/people_.$personId"
  );

  return (
    <Flex direction="column" w="100%" h="100%" gap="md">
      {data !== undefined ? (
        data.error !== undefined ? (
          <Center w="100%" h="100%">
            <Text ta="center">{data.error}</Text>
          </Center>
        ) : data.person !== undefined && data.person !== undefined ? (
          <PersonInfoView
            id={data.person.id}
            firstName={data.person.firstName}
            lastName={data.person.lastName}
            nickname={data.person.nickname}
            qrCode={data.person.qrCode}
            notes={data.person.notes}
            tags={data.person.tags}
            createdDate={data.person.createdDate}
            updatedDate={data.person.updatedDate}
            outstandingItems={data.outstandingItems}
            lostItems={data.lostItems}
            loans={data.totalItems}
            averageReturnTime={data.averageReturnTime}
          />
        ) : (
          <>?</>
        )
      ) : (
        <>
          <Skeleton h={160} />
          <Skeleton h={130} />
        </>
      )}
    </Flex>
  );
}
