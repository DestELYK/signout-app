import {
  Box,
  Button,
  Flex,
  Group,
  LoadingOverlay,
  Stack,
  TextInput,
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
  qrCodeValidator,
  specialValidator,
  tagValidator,
} from "~/utils/validators.client";
import QrButton from "../QrButton";
import TagCombobox from "../tags/TagCombobox";

const DESCRIPTION_LIMIT = 40;
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
      name: (value) => specialValidator(value),
      qrCode: (value) => {
        if (value && value.length !== 0) return qrCodeValidator(value);
      },
      description: (value) => {
        if (value && value.length >= DESCRIPTION_LIMIT) {
          return `Limit is ${DESCRIPTION_LIMIT} characters`;
        } else if (value?.length !== 0) return specialValidator(value);
      },
      tags: (value) => tagValidator(value),
    },
  });

  const submitNewItem = useTypedFetcher<typeof action>();

  const loading = submitNewItem.state !== "idle";

  useEffect(() => {
    name && form.setFieldValue("name", name);
    qrCode && form.setFieldValue("qrCode", qrCode);
  }, [name, qrCode]);

  // updates on new person creation
  useEffect(() => {
    if (submitNewItem.data) {
      notifications.show({
        message: `Created new item: ${submitNewItem.data.name}`
      })
      onSubmitted?.(submitNewItem.data);
    }
  }, [submitNewItem.data]);

  return (
    <Box pos="relative">
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
            label="Name"
            required
            data-autofocus
            {...form.getInputProps("name")}
          />
          <Flex direction="row">
            <TextInput
              w="100%"
              label="QR Code"
              description="Optional qr code entry (can be added later)"
              placeholder="Optional"
              {...form.getInputProps("qrCode")}
            />
            <QrButton
              onResult={(result) => {
                form.setFieldValue("qrCode", result.data);
              }}
            />
          </Flex>
          <TextInput
            label="Description"
            description="Enter a useful description of the item that can help identify it"
            {...form.getInputProps("description")}
          />
          <TagCombobox
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
            <Button type="submit">Create</Button>
          </Group>
        </Stack>
      </Form>
    </Box>
  );
}
