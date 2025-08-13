import { Center, Text } from "@mantine/core";
import { useNavigate } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import TagForm from "~/components/forms/TagForm";
import { loader } from "./tags.$tagId";

export default function Page() {
    const data = useTypedRouteLoaderData<typeof loader>("routes/tags.$tagId");
    const navigate = useNavigate();

    return data && data.tag ? (
        <TagForm
            id={data.tag.id}
            initialValues={{
                name: data.tag.name,
                color: data.tag.color,
                category: data.tag.category,
                priority: data.tag.priority,
                hidden: data.tag.hidden,
            }}
            onResult={(result) => {
                if (result.data) {
                    navigate(`/tags/${result.data?.id}`);
                } else {
                    navigate("/tags");
                }
            }}
        />
    ) : (
        <Center w="100%" h="100%">
            <Text c="error">Tag not found</Text>
        </Center>
    );
}
