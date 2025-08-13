import { Space, Stack, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { loader } from "./people.roles.$id";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof loader>("routes/people.roles.$id");

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
                <Text>
                    <b>Color: </b>
                    <Text span c={data.data.color}>
                        {data.data.color}
                    </Text>
                </Text>
                <Space mt="auto" />
            </Stack>
        )
    );
}
