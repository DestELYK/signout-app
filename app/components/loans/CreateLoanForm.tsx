import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Fieldset,
  Flex,
  Group,
  LoadingOverlay,
  ScrollArea,
  Text,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Tag } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import { IconArrowBackUp, IconPlus, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useState } from "react";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { action } from "~/routes/loans";
import {
  ItemWithTags,
  LoanWithTags,
  PersonWithTags,
  PostLoanFormData,
} from "~/utils/types.server";
import { formatDate, formatFullName } from "~/utils/utils";
import LoanedItemInfoView from "../items/LoanedItemInfoView";
import SearchItemForm from "../items/SearchItemForm";
import PersonPicker from "../people/PersonPicker";
import TagCombobox from "../tags/TagCombobox";

// TODO - Add support for classroom signout

export interface CreateLoanFormProps {
  onSubmitted?: (data: LoanWithTags) => void;
}

export default function CreateLoanForm({ onSubmitted }: CreateLoanFormProps) {
  const navigate = useNavigate();
  const [person, setPerson] = useState<PersonWithTags>();
  const [items, setItems] = useState<ItemWithTags[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const form = useForm<PostLoanFormData>({
    clearInputErrorOnChange: true,
    initialValues: {
      person: { id: -1 },
      items: [],
      tags: [],
      dateLoaned: undefined,
    },
    validate: {
      person: (value) => {
        if (value === undefined || value.id === -1)
          return "Need to select person";
      },
      items: (value) => {
        if (value === undefined || value.length === 0)
          return "Need at least one item";
      },
      dateLoaned: (value) => {
        if (value && dayjs(value).isAfter(dayjs()))
          return "Date cannot be in the future";
      },
    },
  });

  const fetcher = useFetcherWithErrorHandler<typeof action>((data) => {
    if (data.loan) {
      notifications.show({
        message: (
          <>
            Created new loan: <b>Loan #{data.loan.id}</b>.{" "}
            <Text span inherit c="blue">
              Click to view
            </Text>
            .
          </>
        ),
        onClick: () => {
          notifications.clean();
          navigate(`/loans/${data.loan.id}`);
        },
      });

      onSubmitted?.(data.loan);
    } else {
      notifications.show({
        message: "No Loan",
      });
    }
  });

  const loading = fetcher.state === "submitting";

  function clear() {
    form.reset();
    setPerson(undefined);
    setItems([]);
    setTags([]);
  }

  function updatePerson(person?: PersonWithTags) {
    if (person) {
      form.setFieldValue("person", person);

      notifications.show({
        message: `${formatFullName(person)} was selected for loan`,
        autoClose: 1000,
      });
    } else {
      form.setFieldValue("person", { id: -1 });
    }

    setPerson(person);
  }

  function insertItem(value?: ItemWithTags) {
    if (value) {
      console.log("Inserting item ", value);
      if (form.values.items.find((i) => i.id === value.id)) {
        notifications.show({
          message: "Item has already been added",
          color: "red",
          autoClose: 5000,
        });
      } else {
        setItems([...items, value]);
        form.insertListItem("items", value);

        notifications.show({
          message: `${value.name} has been added to the loan`,
          autoClose: 1000,
        });
      }
    }
  }

  function removeItem(value: ItemWithTags) {
    const index = form.values.items.findIndex((i) => i.id == value.id);

    if (index != -1) {
      setItems(items.filter((i) => i.id !== value.id));
      form.removeListItem("items", index);

      notifications.show({
        message: `${value.name} has been removed from the loan`,
        autoClose: 1000,
      });
    } else {
      notifications.show({
        message: "Failed to find item to remove",
        color: "red",
        autoClose: 5000,
      });
    }
  }

  function updateTags(tags: Tag[]) {
    setTags(tags);
    form.setFieldValue("tags", tags);
  }

  function handleDataSubmit() {
    if (!form.validate().hasErrors) {
      fetcher.submit(form.values, {
        action: "/loans",
        method: "POST",
        encType: "application/json",
        navigate: false,
      });
    }
  }

  return (
    <>
      <LoadingOverlay visible={loading} zIndex={1000} />
      <Flex w="100%" h="100%" direction="column" gap="sm">
        <Fieldset
          disabled={loading}
          legend="Person"
          p="sm"
          {...(form.errors.person && { style: { borderColor: "red" } })}
        >
          <Box pos="relative" h="100%">
            <LoadingOverlay
              zIndex={1000}
              overlayProps={{ radius: "sm", blur: 2 }}
            />
            <PersonPicker value={person} onChanged={updatePerson} />
          </Box>
        </Fieldset>
        <Text size="xs" c="red" hidden={form.errors.person == undefined}>
          {form.errors.person}
        </Text>
        <Fieldset
          disabled={loading}
          legend="Items"
          {...(form.errors.items && { style: { borderColor: "red" } })}
        >
          <ScrollArea.Autosize mah={150} type="auto" scrollbars="y">
            {items.length > 0 ? (
              items.map((item) => (
                <LoanedItemInfoView
                  key={item.id}
                  id={item.id}
                  qrCode={item.qrCode}
                  name={item.name}
                  description={item.description}
                  tags={item.tags.filter((t) => t.name !== "Added")}
                  rightSection={
                    <ActionIcon
                      size="input-sm"
                      variant="outline"
                      color="red"
                      onClick={() => removeItem(item)}
                    >
                      <IconTrash />
                    </ActionIcon>
                  }
                />
              ))
            ) : (
              <Text ta="center" p="sm">
                No items added
              </Text>
            )}
          </ScrollArea.Autosize>
          <Divider mb="md" />
          <SearchItemForm
            filterItems={(searchItems) =>
              searchItems.map((i) => {
                if (items.find((i2) => i2.id == i.id)) {
                  if (!i.tags.find((t) => t.name === "Added")) {
                    i.tags = [
                      {
                        id: -1,
                        name: "Added",
                        color: "red",
                        category: "_",
                        priority: 5000,
                        hidden: false,
                      },
                      ...i.tags,
                    ];
                  }
                } else {
                  i.tags = i.tags.filter((t) => t.name !== "Added");
                }
                return i;
              })
            }
            disableItem={(i) =>
              i._count.loans > 0 ||
              items.find((i2) => i2.id == i.id) != undefined
            }
            onSubmit={(item) => {
              insertItem(item);

              form.clearFieldError("items");

              return false;
            }}
          />
        </Fieldset>
        <Text size="xs" c="red" hidden={form.errors.items == undefined}>
          {form.errors.items}
        </Text>
        <TagCombobox
          category="Loan Info"
          value={tags}
          onTagsChange={(values, error) => {
            if (error) form.setFieldError("tags", error);
            else updateTags(values);
          }}
          disabled={loading}
          error={form.getInputProps("tags").error}
          fieldInfo={{
            label: "Tags",
            description: "Optional tags for identifying specific loans",
          }}
        />
        <DateTimePicker
          valueFormat="DD MMM, YYYY @ hh:mm A"
          label="Date Returned"
          description="Optional date, will default to current time if left blank"
          placeholder={formatDate(new Date())}
          onClick={() =>
            form.setFieldValue("dateLoaned", new Date().toISOString())
          }
          timeInputProps={{ value: new Date().toLocaleTimeString() }}
          {...form.getInputProps("dateLoaned")}
          value={
            form.values.dateLoaned
              ? new Date(form.values.dateLoaned)
              : undefined
          }
          maxDate={new Date()}
        />
        <Group mt="sm" justify="end">
          <ActionIcon
            disabled={loading}
            size="input-sm"
            color="red"
            onClick={clear}
          >
            <IconArrowBackUp />
          </ActionIcon>
          <Button
            disabled={loading}
            rightSection={<IconPlus />}
            onClick={handleDataSubmit}
          >
            Create Loan
          </Button>
        </Group>
      </Flex>
    </>
  );
}
