import { Space, Stack, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { loader } from "./items.types.$id";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof loader>("routes/items.types.$id");

    return (
        data &&
        data.data && (
            <Stack h="100%">
                <Text>
                    <b>Description: </b>
                    {data.data.description && data.data.description.length > 0
                        ? data.data.description
                        : "None"}
                </Text>
                <Space mt="auto" />
            </Stack>
        )
    );
}
