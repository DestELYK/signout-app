import { Center, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import LocationForm from "~/components/forms/LocationForm";
import { loader } from "./locations.$id";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof loader>("routes/locations.$id");
    const navigate = useNavigate();

    return data && data.data ? (
        <LocationForm
            id={data.data.id}
            initialValues={{
                name: data.data.name,
            }}
            onResult={(result) => {
                if (result.data) {
                    navigate(`/locations/${result.data?.id}`);
                } else {
                    navigate("/locations");
                }
            }}
        />
    ) : (
        <Center w="100%" h="100%">
            <Text c="error">Location not found</Text>
        </Center>
    );
}
