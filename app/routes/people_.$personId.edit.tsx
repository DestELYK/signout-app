import { Box, Divider, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import PersonForm from "~/components/forms/PersonForm";
import { loader } from "./people_.$personId";

export default function Page() {
    const personData = useTypedRouteLoaderData<typeof loader>("routes/people_.$personId");
    const navigate = useNavigate();

    return (
        <>
            <Text fw="bold" visibleFrom="md" p="xs">
                Edit Person
            </Text>
            <Divider w="100%" visibleFrom="md" />
            <Box p="sm">
                <PersonForm
                    id={personData?.data?.id}
                    initialValues={{
                        firstName: personData?.data?.firstName ?? "",
                        lastName: personData?.data?.lastName ?? "",
                        nickname: personData?.data?.nickname ?? "",
                        role: personData?.data?.role ?? undefined,
                        schoolId: personData?.data?.schoolId ?? "",
                        tags: personData?.data?.tags,
                    }}
                    onResult={(personData) => {
                        if (personData.data) {
                            navigate(-1);
                        }
                    }}
                />
            </Box>
        </>
    );
}
