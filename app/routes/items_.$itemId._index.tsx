import { Center, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ItemDetailsView from "~/components/items/ItemDetailsView";
import { loader as itemLoader } from "./items_.$itemId";

export default function Page() {
    const itemData = useTypedRouteLoaderData<typeof itemLoader>("routes/items_.$itemId");

    return itemData?.error ? (
        <Center w="100%" h="100%" p="sm">
            <Text c="red" ta="center">
                {itemData.error}
            </Text>
        </Center>
    ) : (
        <ItemDetailsView data={itemData?.data} />
    );
}
