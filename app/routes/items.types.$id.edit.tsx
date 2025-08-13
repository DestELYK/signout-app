import { Center, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ItemTypeForm from "~/components/forms/ItemTypeForm";
import { loader } from "./items.types.$id";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof loader>("routes/items.types.$id");
    const navigate = useNavigate();

    return data && data.data ? (
        <ItemTypeForm
            id={data.data.id}
            initialValues={{
                name: data.data.name,
                description: data.data.description,
            }}
            onResult={(result) => {
                if (result.data) {
                    navigate(`/items/types/${result.data?.id}`);
                } else {
                    navigate("items/types");
                }
            }}
        />
    ) : (
        <Center w="100%" h="100%">
            <Text c="error">Item Type not found</Text>
        </Center>
    );
}
