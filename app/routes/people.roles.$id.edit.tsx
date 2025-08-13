import { Center, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import PersonRoleForm from "~/components/forms/PersonRoleForm";
import { loader } from "./people.roles.$id";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof loader>("routes/people.roles.$id");
    const navigate = useNavigate();

    return data && data.data ? (
        <PersonRoleForm
            id={data.data.id}
            initialValues={{
                name: data.data.name,
                color: data.data.color,
                description: data.data.description,
            }}
            onResult={(result) => {
                if (result.data) {
                    navigate(`/people/roles/${result.data?.id}`);
                } else {
                    navigate("/people/roles");
                }
            }}
        />
    ) : (
        <Center w="100%" h="100%">
            <Text c="error">Person Role not found</Text>
        </Center>
    );
}
