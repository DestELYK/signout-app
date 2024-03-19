import { Card, CloseButton, Flex, Text, Title } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.loanId, "Expected params.loanId");

  return json({
    loan: await prisma.loan.findFirstOrThrow({
      where: { id: parseInt(params.loanId) },
      include: {
        person: true,
        items: {
          include: {
            item: true,
          },
        },
      },
    }),
  });
};

export default function Page() {
  const { loan } = useLoaderData<typeof loader>();
  const navigate = useNavigate()

  return (
    <Card padding="sm" radius="sm" withBorder h="100%">
      <Card.Section withBorder inheritPadding px="xs" mb="sm">
        <Flex direction="row" justify="center" align="center">
          <Title w="100%" order={4} ta="center" fw="bold">
            {`${loan.person.firstName} ${loan.person.lastName} (${loan.person.nickname})`}
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
