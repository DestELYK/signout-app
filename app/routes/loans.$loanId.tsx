import { Card, CloseButton, Flex, Text, Title } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/lib/prisma.server";
import { fullName } from "~/lib/utils";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.loanId, "Expected params.loanId");

  try {
    return json(await prisma.loan.findFirstOrThrow({
      where: { id: parseInt(params.loanId) },
      include: {
        person: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    }));
  } catch(e) {
    console.log('Failed to find /loans/$loanId', e);
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    })
  }
};

export default function Page() {
  const loan = useLoaderData<typeof loader>();
  const navigate = useNavigate()

  return (
    <Card padding="sm" radius="sm" withBorder w="100%" h="100%">
      <Card.Section withBorder inheritPadding px="xs" mb="sm">
        <Flex direction="row" justify="center" align="center">
          <Title w="100%" order={4} ta="center" fw="bold">
            {fullName(loan.person)}
          </Title>
          <CloseButton size="xl" style={{justifySelf: "flex-end"}} onClick={() => navigate('/loans')}/>
        </Flex>
      </Card.Section>
      <Text>
        Information
      </Text>
    </Card>
  );
}
