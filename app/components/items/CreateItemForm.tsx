import {
  Box,
  Button,
  Flex,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { Item, Tag } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useEffect } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { action } from "~/routes/items";
import {
  qrCodeValidator,
  specialValidator,
  tagValidator
} from "~/utils/validators.client";
import QrButton from "../QrButton";
import TagCombobox from "../tags/TagCombobox";

export type ItemFormValues = { name: string; qrCode?: string; tags: Tag[] };

export type CreateItemFormProps = {
  onSubmitted?: (item: Item) => void;
  name?: string;
  qrCode?: string;
};

export default function CreateItemForm({ onSubmitted, name, qrCode }: CreateItemFormProps) {
  const form = useForm<ItemFormValues>({
    initialValues: {
      name: "",
      qrCode: "",
      tags: [],
    },
    validate: {
      name: (value) => specialValidator(value),
      qrCode: (value) => {
        if (value && value.length !== 0) return qrCodeValidator(value);
      },
      tags: (value) => tagValidator(value),
    },
  });

  const submitNewItem = useTypedFetcher<typeof action>();

  const loading = submitNewItem.state !== "idle";

  useEffect(() => {
    name && form.setFieldValue("name", name);
    qrCode && form.setFieldValue("qrCode", qrCode);
  }, [name, qrCode])

  // updates on new person creation
  useEffect(() => {
    if (submitNewItem.state === "idle" && submitNewItem.data) {
      onSubmitted?.(submitNewItem.data);
    }
  }, [submitNewItem.state, submitNewItem.data]);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={1000} />
      <Form
        action="/items"
        method="POST"
        onSubmit={form.onSubmit((values) => {
          modals.openConfirmModal({
            title: "Confirm Creation",
            centered: true,
            children: (
              <Text>
                Are you sure you want to create a new item named {values.name}?
              </Text>
            ),
            labels: {
              confirm: "Yes",
              cancel: "No",
            },
            onConfirm: () => {
              modals.closeAll();

              submitNewItem.submit(values, {
                action: "/items",
                method: "POST",
                navigate: false,
                encType: "application/json",
              });
            },
            onCancel: () => {
              modals.closeAll();
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
