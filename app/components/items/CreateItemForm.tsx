import {
  Button,
  Flex,
  Group,
  LoadingOverlay,
  Stack,
  TextInput
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Item, Tag } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useEffect } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { action } from "~/routes/items";
import {
  blankValueValidator,
  itemDescriptionValidator,
  itemNameValidator,
  qrCodeValidator,
} from "~/utils/validators.client";
import QrButton from "../QrButton";
import TagCombobox from "../tags/TagCombobox";

const DESCRIPTION_LIMIT = 40;
const TAG_MIN = 1;
const TAG_MAX = 5;
const CONFIRM_ID = "create-item-form_confirm";

export type ItemFormValues = {
  name: string;
  qrCode?: string;
  description?: string;
  tags: Tag[];
};

export type CreateItemFormProps = {
  onSubmitted?: (item: Item) => void;
  name?: string;
  qrCode?: string;
};

export default function CreateItemForm({
  onSubmitted,
  name,
  qrCode,
}: CreateItemFormProps) {
  const form = useForm<ItemFormValues>({
    initialValues: {
      name: "",
      qrCode: "",
      description: "",
      tags: [],
    },
    validate: {
      name: (value) => blankValueValidator(value) || itemNameValidator(value),
      qrCode: (value) => {
        if (value) return qrCodeValidator(value);
      },
      description: (value) => {
        if (value) return itemDescriptionValidator(value, DESCRIPTION_LIMIT);
      },
      tags: (value) => {
        if (value.length < TAG_MIN) {
          return `Under minimum number of tags (${TAG_MIN})`;
        } else if (value.length > TAG_MAX) {
          return `Over maximum number of tags (${TAG_MAX})`;
        }
      },
    },
  });

  const submitNewItem = useTypedFetcher<typeof action>();

  const loading = submitNewItem.state === "submitting";

  useEffect(() => {
    name && form.setFieldValue("name", name);
    qrCode && form.setFieldValue("qrCode", qrCode);
  }, [name, qrCode]);

  // updates on new person creation
  useEffect(() => {
    if (submitNewItem.data) {
      notifications.show({
        message: `Created new item: ${submitNewItem.data.name}`,
      });
      onSubmitted?.(submitNewItem.data);
    }
  }, [submitNewItem.data]);

  return (
    <>
      <LoadingOverlay visible={loading} zIndex={1000} />
      <Form
        action="/items"
        method="POST"
        onSubmit={form.onSubmit((values) => {
          modals.openConfirmModal({
            modalId: CONFIRM_ID,
            title: "Confirm Creation",
            centered: true,
            children: `Are you sure you want to create a new item called ${values.name}?`,
            labels: {
              confirm: "Yes",
              cancel: "No",
            },
            onConfirm: () => {
              modals.close(CONFIRM_ID);

              submitNewItem.submit(values, {
                action: "/items",
                method: "POST",
                navigate: false,
                encType: "application/json",
              });
            },
            onCancel: () => {
              modals.close(CONFIRM_ID);
            },
          });
        })}
      >
        <Stack gap="sm">
          <TextInput
            disabled={loading}
            label="Name"
            required
            data-autofocus
            {...form.getInputProps("name")}
          />
          <Flex direction="row">
            <TextInput
              disabled={loading}
              w="100%"
              label="QR Code"
              description="Optional qr code entry (can be added later)"
              placeholder="Optional"
              {...form.getInputProps("qrCode")}
            />
            <QrButton
              disabled={loading}
              onResult={(result) => {
                form.setFieldValue("qrCode", result.data);
              }}
            />
          </Flex>
          <TextInput
            disabled={loading}
            label="Description"
            description="Enter a useful description of the item that can help identify it"
            {...form.getInputProps("description")}
          />
          <TagCombobox
            disabled={loading}
            onTagsChange={(values) => {
              form.setFieldValue("tags", values);
            }}
            category="Item Type"
            limit={3}
            fieldInfo={{
              label: "Tags",
              placeholder: "Search for tags...",
              description: "Select at least 1 tag for item",
            }}
            error={form.getInputProps("tags").error}
          />

          <Group justify="end">
            <Button type="submit" disabled={loading}>
              Create
            </Button>
          </Group>
        </Stack>
      </Form>
    </>
  );
}
