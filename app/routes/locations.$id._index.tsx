import { Space, Stack, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { loader } from "./people.roles.$id";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof loader>("routes/locations.$id");

    return (
        data &&
        data.data && (
            <Stack h="100%">
                <Text>
                    <b>Description: </b>
                    {data.data.description}
                </Text>
                <Space mt="auto" />
            </Stack>
        )
    );
}
