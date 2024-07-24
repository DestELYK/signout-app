import { Center, Loader, Text } from "@mantine/core";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useLocation, useNavigation } from "@remix-run/react";
import { redirect, typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { handleError } from "~/lib/db.server";
import { isNumeric } from "~/utils/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: data.tag
        ? `${data.tag.name} Tag`
        : "No Tag Found" + ` | SJK Sign-Out`,
    },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.tagId, "Expected params.tagId");

  const tagId = params.tagId;

  try {
    if (!isNumeric(tagId)) return redirect("/tags");

    const tag = await prisma.tag.findUniqueOrThrow({
      where: {
        id: Number(tagId),
      },
    });

    return typedjson({
      tag: tag,
      error: undefined,
    });
  } catch (e) {
    const error = handleError(e, "no tag was returned");

    if (error) {
      return typedjson({
        error: error,
        tag: undefined,
      });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
};
export default function Page() {
  const data = useTypedLoaderData<typeof loader>();
  const navigation = useNavigation();
  const location = useLocation();

  return navigation.state === "loading" &&
    location.pathname !== navigation.location.pathname ? (
    <Center w="100%" h="100%">
      <Loader />
    </Center>
  ) : data.error ? (
    <Center w="100%" h="100%">
      <Text c="error">{data.error}</Text>
    </Center>
  ) : data.tag ? (
    <Center w="100%" h="100%">
      <Text>Displaying {data.tag.name}</Text>
    </Center>
  ) : (
    <Center w="100%" h="100%">
      <Text c="error">Tag not found</Text>
    </Center>
  );
}
