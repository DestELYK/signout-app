import {
  ActionIcon,
  Affix,
  Badge,
  Button,
  Card,
  CardSection,
  CloseButton,
  Fieldset,
  Flex,
  Group,
  Pill,
  Stack,
  Text,
  Textarea,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useToggle } from "@mantine/hooks";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useNavigate } from "@remix-run/react";
import {
  IconArrowBackUp,
  IconDeviceFloppy,
  IconEdit,
} from "@tabler/icons-react";
import { useEffect } from "react";
import {
  redirect,
  typedjson,
  useTypedActionData,
  useTypedFetcher,
  useTypedLoaderData,
} from "remix-typedjson";
import invariant from "tiny-invariant";
import { prisma } from "~/lib/prisma.server";
import { LoanFindOne, loanFindOne } from "~/utils/types.server";
import { formatDate, fullName } from "~/utils/utils";

// TODO - Show returned by if another person returned the item
// TODO - Allow editing the person (changing who has the loan, in the case of incorrect person selected)
// TODO - Allow editing individual items (in case of swapping items)
// TODO - Allow adding tags to the loan
// TODO - Create a base component for displaying single item (for use for items and people)

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.loanId, "Expected params.loanId");

  try {
    return typedjson(
      await prisma.loan.findFirstOrThrow({
        where: { id: parseInt(params.loanId) },
        include: loanFindOne.include,
      })
    );
  } catch (e) {
    console.log("Failed to find /loans/$loanId", e);
    throw new Response(null, {
      status: 404
    })
  }
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData: {
    itemIds?: number[];
    notes?: string;
  } = await request.json();

  invariant(params.loanId, "No loanId provided");

  const loanId = params.loanId;

  try {
    switch (request.method) {
      case "PATCH":
        if (formData.itemIds && formData.itemIds.length == 0) {
          throw Error("Loan requires at least one item");
        }

        const itemIds = formData.itemIds;

        const notes = formData.notes;

        const updatedDate = itemIds || notes ? new Date() : undefined;

        const updateCount = await prisma.loan.update({
          where: { id: parseInt(loanId) },
          data: {
            ...(notes != undefined && { notes: notes }),
            ...(updatedDate && { updatedDate: updatedDate }),
            ...(itemIds && {
              items: {
                updateMany: itemIds.map((itemId) => {
                  return {
                    where: { itemId: itemId },
                    data: {
                      dateReturned: new Date(),
                    },
                  };
                }),
              },
            }),
          },
        });

        if (!updateCount) {
          throw new Response(null, {
            status: 404,
          });
        }

        console.log("Loan #%i updated", loanId);

        return redirect(`/loans/${loanId}`);
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    console.error(`Failed to ${request.method} a loan`, e);
    return typedjson({ error: "Failed to create loan" });
  }
};

export default function Page() {
  const loan = useTypedLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useTypedFetcher();

  const actionData = useTypedActionData<typeof action>();

  const [editing, toggle] = useToggle([false, true]);

  const form = useForm<LoanFindOne>();

  const outstanding =
    loan.items && loan.items.find((item) => !item.dateReturned) !== undefined;

  useEffect(() => {
    form.setFieldValue("items", loan.items);
    form.setFieldValue("notes", loan.notes);
    form.setFieldValue("tags", loan.tags);
  }, [loan]);

  function reset() {
    form.setValues({ items: loan.items, notes: loan.notes });
    toggle(false);
  }

  return (
    <Card padding="sm" radius="sm" withBorder w="100%" h="100%">
      {/* Loan Header */}
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Group>
            <CloseButton onClick={() => navigate('/loans')} />
            <Title order={4}>Loan #{loan.id}</Title>
          </Group>
          <Group>
            <Badge color={outstanding ? "red" : "green"}>
              {outstanding ? "Out" : "In"}
            </Badge>
          </Group>
        </Group>
      </Card.Section>
      {/* Tags */}
      {/* TODO - combobox pill tags */}
      {form.values.tags && form.values.tags.length > 0
        ? form.values.tags.map((t) => <Pill color={t.color}>{t.name}</Pill>)
        : null}
      {/* <PillsInput label="Tags">
        <Pill.Group>
          <PillsInput.Field placeholder="Enter tags" />
        </Pill.Group>
      </PillsInput> */}
      {/* Person Info */}
      <Card.Section inheritPadding py="xs">
        <Fieldset legend="Person">
          <Group justify="space-between">
            <UnstyledButton
              component={Link}
              to={`/people/${loan.personId}`}
              style={{ cursor: "pointer" }}
            >
              <Text w="100%" ta="center" fw="bold">
                {fullName(loan.person)}
              </Text>
            </UnstyledButton>
            <Group>
              <Badge color={loan.person.role.color}>
                {loan.person.role.name}
              </Badge>
              {/* Edit Person */}
              <ActionIcon
                variant="subtle"
                onClick={() => navigate(`/people/${loan.personId}`)}
              >
                <IconEdit />
              </ActionIcon>
            </Group>
          </Group>
        </Fieldset>
      </Card.Section>
      <Flex
        direction="column"
        w="100%"
        style={{ flexGrow: "1" }}
        gap="sm"
        py="sm"
      >
        {/* Items */}
        <Fieldset legend="Items">
          {form.values.items && form.values.items.length > 0 ? (
            form.values.items.map((i) => (
              <Stack key={i.itemId} gap={0} mb="sm">
                <Group justify="space-between">
                  <UnstyledButton
                    component={Link}
                    to={`/items/${i.itemId}`}
                    style={{ cursor: "pointer" }}
                  >
                    <Text w="100%" ta="center" fw="bold">
                      {i.item.name}
                    </Text>
                  </UnstyledButton>
                  <Group>
                    <Badge color={i.dateReturned ? "green" : "red"}>
                      {i.dateReturned ? "In" : "Out"}
                    </Badge>
                    {/* Edit Item */}
                    <ActionIcon
                      variant="subtle"
                      onClick={() => navigate(`/items/${i.itemId}`)}
                    >
                      <IconEdit />
                    </ActionIcon>
                  </Group>
                </Group>
                {i.dateReturned ? (
                  <Text size="xs">Returned: {formatDate(i.dateReturned)}</Text>
                ) : i.dateLoaned ? (
                  <Text size="xs">Last Seen: {formatDate(i.dateLoaned)}</Text>
                ) : (
                  <Text size="xs">Unknown</Text>
                )}
              </Stack>
            ))
          ) : (
            <Text>No items</Text>
          )}
          <Button
            mt="sm"
            fullWidth
            onClick={() => navigate(`/loans/signin?loanId=${loan.id}`)}
            disabled={!outstanding}
          >
            Sign-In Items
          </Button>
        </Fieldset>
        {/* Notes */}
        <Textarea
          style={{ overflowY: "auto", flexGrow: "1" }}
          size="fit-content"
          label="Loan Notes"
          autosize
          minRows={7}
          maxRows={15}
          onBlur={() => {}}
          {...form.getInputProps("notes")}
          onChange={(event) => {
            form.getInputProps("notes").onChange(event);

            if (event.currentTarget.value.length === 0) {
              form.setFieldValue("notes", "");
            }

            toggle(true);
          }}
        />
        {editing ? (
          <Affix position={{ bottom: 20, right: 20 }}>
            <form
              onSubmit={form.onSubmit((values) => {
                fetcher.submit(JSON.stringify(values), {
                  method: "PATCH",
                  encType: "application/json",
                  navigate: false,
                });
                toggle(false);
              })}
              onReset={(event) => {
                reset();
              }}
            >
              <Group>
                <ActionIcon size="40px" color="red" type="reset">
                  <IconArrowBackUp size="40px" />
                </ActionIcon>
                <ActionIcon size="40px" color="blue" type="submit">
                  <IconDeviceFloppy size="40px" />
                </ActionIcon>
              </Group>
            </form>
          </Affix>
        ) : null}
      </Flex>
      {/* Date Created & Updated */}
      <CardSection withBorder inheritPadding py="xs">
        <Text size="xs" ta="center">
          Created:{" "}
          <span style={{ fontWeight: "bold" }}>
            {formatDate(loan.createdDate)}
          </span>
        </Text>
        <Text size="xs" ta="center">
          Last Updated:{" "}
          <span style={{ fontWeight: "bold" }}>
            {formatDate(loan.updatedDate)}
          </span>
        </Text>
      </CardSection>
    </Card>
  );
}
