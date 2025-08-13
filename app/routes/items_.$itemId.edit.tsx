import { Box, Divider, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import ItemForm from "~/components/forms/ItemForm";
import { loader } from "./items_.$itemId";

export default function Page() {
    const itemData = useTypedRouteLoaderData<typeof loader>("routes/items_.$itemId");
    const navigate = useNavigate();

    return (
        <>
            <Text fw="bold" visibleFrom="md" p="xs">
                Edit Person
            </Text>
            <Divider w="100%" visibleFrom="md" />
            <Box p="sm">
                <ItemForm
                    id={itemData?.data?.id}
                    initialValues={{
                        name: itemData?.data?.name ?? "",
                        description: itemData?.data?.description ?? "",
                        tags: itemData?.data?.tags,
                        location: itemData?.data?.location ?? undefined,
                        notes: itemData?.data?.notes ?? "",
                        status: itemData?.data?.status?.id ?? undefined,
                        type: itemData?.data?.type ?? undefined,
                    }}
                    confirmContent={(values) => (
                        <Text>Are you sure you want to update this item?</Text>
                    )}
                    onResult={(itemData) => {
                        if (itemData.data) {
                            navigate(-1);
                        }
                    }}
                />
            </Box>
        </>
    );
}
