import { Center, Text } from "@mantine/core";
import { useTypedRouteLoaderData } from "remix-typedjson";
import CreateTagForm from "~/components/tags/CreateTagForm";
import { loader } from "./tags.$tagId";

export default function Page() {
  const data = useTypedRouteLoaderData<typeof loader>("routes/tags.$tagId");

  return data && data.tag ? (
    <CreateTagForm {...data.tag} formType="edit" />
  ) : (
    <Center w="100%" h="100%">
      <Text c="error">Tag not found</Text>
    </Center>
  );
}
