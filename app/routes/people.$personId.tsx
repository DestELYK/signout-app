import {
    ActionIcon,
    Card,
    Flex,
    Grid,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useToggle } from "@mantine/hooks";
import { LoaderFunctionArgs } from "@remix-run/node";
import { IconCheck, IconEdit } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { prisma } from "~/lib/prisma.server";
import { PersonFindOne, personFindOne } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";


export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.personId, "Expected params.personId");

  try {
    return typedjson(
      await prisma.person.findFirstOrThrow({
        where: { id: parseInt(params.personId) },
        include: personFindOne.include,
      })
    );
  } catch (e) {
    console.log("Failed to find /people/$personId", e);
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
};

export default function Page() {
  const person = useTypedLoaderData<typeof loader>();

  const [editing, toggle] = useToggle([false, true]);

  const form = useForm<PersonFindOne>({ initialValues: person });

  return (
    <Card padding="sm" radius="sm" withBorder w="100%" h="100%">
      <Card.Section withBorder inheritPadding px="xs" mb="sm">
        <Flex direction="row" justify="center" align="center">
          {editing ? (
            <Grid w="100%">
              <Grid.Col span={6}>
                <TextInput
                  label="First Name"
                  required
                  {...form.getInputProps("firstName")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Last Name"
                  placeholder=""
                  required
                  {...form.getInputProps("lastName")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  label="Nickname"
                  placeholder="Optional"
                  {...form.getInputProps("nickname")}
                />
              </Grid.Col>
            </Grid>
          ) : (
            <Title order={3} w="100%" ta="center" fw="bold">
              {formatFullName(person)}
            </Title>
          )}
          {/* <CloseButton
        size="xl"
        style={{ justifySelf: "flex-end" }}
        onClick={() => navigate("/loans")}
      /> */}
          <ActionIcon variant="subtle" color="gray" onClick={() => toggle()}>
            {editing ? <IconCheck /> : <IconEdit />}
          </ActionIcon>
        </Flex>
      </Card.Section>
      <Text>Information</Text>
    </Card>
  );
}
