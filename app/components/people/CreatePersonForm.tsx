import {
    Box,
    Button,
    Group,
    LoadingOverlay,
    Stack,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Tag } from "@prisma/client";
import { Form } from "@remix-run/react";
import { nameValidator, qrCodeValidator } from "~/utils/validators.client";
import TagCombobox from "../TagCombobox";

export type PersonFormValues = {
  firstName: string;
  lastName: string;
  nickname?: string;
  qrCode?: string;
  role?: Tag;
};

export type CreatePersonFormProps = {
  onSubmit?: (values: PersonFormValues) => void;
  onTagSearch?: (value: string) => void;
  loading?: boolean;
  tags: Tag[];
};

export default function CreatePersonForm({
  onSubmit,
  onTagSearch,
  loading,
  tags,
}: CreatePersonFormProps) {
  const form = useForm<PersonFormValues>({
    initialValues: {
      firstName: "",
      lastName: "",
      nickname: "",
      qrCode: "",
      role: undefined,
    },
    validate: {
      firstName: (value) => nameValidator(value),
      lastName: (value) => nameValidator(value),
      nickname: (value) => {
        if (value && value.length !== 0) return nameValidator(value);
      },
      qrCode: (value) => {
        if (value && value.length !== 0) return qrCodeValidator(value);
      },
      role: (value) => {
        if (!value) return "A role needs to be selected";
      },
    },
  });

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={1000} />
      <Form
        action="/items"
        method="POST"
        onSubmit={form.onSubmit((values) => {
          console.log("Submitting...");
          onSubmit?.(values);
        })}
      >
        <Stack gap="sm">
          <TextInput
            label="First Name"
            required
            {...form.getInputProps("firstName")}
          />
          <TextInput
            label="Last Name"
            required
            {...form.getInputProps("lastName")}
          />
          <TextInput label="Nickname" {...form.getInputProps("nickname")} />
          <TextInput
            label="QR Code"
            description="Optional qr code entry (can be added later)"
            placeholder="Optional"
            {...form.getInputProps("qrCode")}
          />
          <TagCombobox
            onTagSearch={onTagSearch}
            onChange={(values) => {
              if (values.length == 1) {
                form.setFieldValue("role", values[0]);
              } else {
                form.setFieldValue("role", undefined);
              }
            }}
            tags={tags}
            fieldInfo={{
              label: "Role",
              description: "Select the person's role",
              placeholder: "Search for role...",
            }}
            limit={1}
            inputProps={form.getInputProps("role")}
          />

          <Group justify="end">
            <Button type="submit">Create</Button>
          </Group>
        </Stack>
      </Form>
    </Box>
  );
}
