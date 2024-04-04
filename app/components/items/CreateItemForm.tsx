import {
    Box,
    Button,
    Group,
    LoadingOverlay,
    Stack,
    TextInput
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Tag } from "@prisma/client";
import { Form } from "@remix-run/react";
import {
    nameValidator,
    qrCodeValidator,
    tagValidator,
} from "~/utils/validators.client";
import TagCombobox from "../TagCombobox";

export type ItemFormValues = { name: string; qrCode?: string; tags: Tag[] };

export type CreateItemFormProps = {
  onSubmit?: (values: ItemFormValues) => void;
  onTagSearch?: (value: string) => void;
  loading?: boolean;
  tags: Tag[];
};

export default function CreateItemForm({
  onSubmit,
  onTagSearch,
  loading,
  tags,
}: CreateItemFormProps) {
  const form = useForm<ItemFormValues>({
    initialValues: {
      name: "",
      qrCode: "",
      tags: [],
    },
    validate: {
      name: (value) => nameValidator(value),
      qrCode: (value) => {
        if (value && value.length !== 0) return qrCodeValidator(value);
      },
      tags: (value) => tagValidator(value),
    },
  });

  const test = form.getInputProps("tags");

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={1000} />
      <Form
        action="/items"
        method="POST"
        onSubmit={form.onSubmit((values) => onSubmit?.(values))}
      >
        <Stack gap="sm">
          <TextInput label="Name" required {...form.getInputProps("name")} />
          <TextInput
            label="QR Code"
            description="Optional qr code entry (can be added later)"
            placeholder="Optional"
            {...form.getInputProps("qrCode")}
          />
          <TagCombobox
            onTagSearch={onTagSearch}
            onChange={(values) => {
                form.setFieldValue("tags", values);
            }}
            limit={3}
            fieldInfo={{
                label: "Tags",
                placeholder: "Search for tags...",
                description: "Select at least 1 tag for item"
            }}
            tags={tags}
            inputProps={form.getInputProps("tags")}
          />

          <Group justify="end">
            <Button type="submit">Create</Button>
          </Group>
        </Stack>
      </Form>
    </Box>
  );
}
