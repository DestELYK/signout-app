import { Flex, Skeleton } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.loanId, "Expected params.loanId");

  const loanId = parseInt(params.loanId);

  if (loanId === undefined) {
    throw new Response(null, {
      status: 404,
    });
  }

  return null;
};

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();

  return (
    <Flex direction="column" w="100%" h="100%" gap="md">
      {data ? <></> : <Skeleton h={200} />}
    </Flex>
  );
}
