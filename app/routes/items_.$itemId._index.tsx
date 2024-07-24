import { Center, Flex, Skeleton, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ItemInfoView from "~/components/items/ItemInfoView";
import { loader as itemLoader } from "./items_.$itemId";

export default function Page() {
  const data = useTypedRouteLoaderData<typeof itemLoader>(
    "routes/items_.$itemId"
  );

  return (
    <Flex direction="column" w="100%" h="100%" gap="md">
      {data !== undefined ? (
        data.error !== undefined ? (
          <Center w="100%" h="100%">
            <Text ta="center">{data.error}</Text>
          </Center>
        ) : data.item !== undefined && data.item !== undefined ? (
          <ItemInfoView
            id={data.item.id}
            qrCode={data.item.qrCode}
            name={data.item.name}
            description={data.item.description}
            tags={data.item.tags}
            notes={data.item.notes}
            createdDate={data.item.createdDate}
            updatedDate={data.item.updatedDate}
            lastLoan={data?.lastLoan}
            loans={data.item._count.loans}
            averageLoanTime={data.averageLoanTime}
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
