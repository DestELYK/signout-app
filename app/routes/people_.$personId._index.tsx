import { Center, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import PersonDetailsView from "~/components/people/PersonDetailsView";
import { loader as personLoader } from "./people_.$personId";

export default function Page() {
    const personData = useTypedRouteLoaderData<typeof personLoader>("routes/people_.$personId");

    return personData?.error ? (
        <Center w="100%" h="100%">
            <Text c="red" ta="center">
                {personData.error}
            </Text>
        </Center>
    ) : (
        <PersonDetailsView data={personData?.data} />
    );
}
