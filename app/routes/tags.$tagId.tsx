import { Center, Loader, Text } from "@mantine/core";
import { useParams } from "@remix-run/react";
import { useTypedRouteLoaderData } from "remix-typedjson";
import { isNumeric } from "~/utils/utils";
import { loader as tagsLoader } from "./tags";

export default function Page() {
  const data = useTypedRouteLoaderData<typeof tagsLoader>("routes/tags");

  const { tagId } = useParams();

  const tag =
    data &&
    data.tags &&
    tagId &&
    isNumeric(tagId) &&
    data?.tags?.find((t) => t.id.toString() === tagId);

  return data === undefined ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : tag ? (
    <Center w="100%" h="100%">
      <Text>Displaying {tag.name}</Text>
    </Center>
  ) : (
    <Center w="100%" h="100%">
      <Text c="error">Tag not found</Text>
    </Center>
  );
}
