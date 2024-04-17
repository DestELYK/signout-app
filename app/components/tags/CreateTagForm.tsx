import {
  Button,
  ColorInput,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  TextInput
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Tag } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useEffect } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { action } from "~/routes/tags";
import {
  blankValueValidator,
  tagCategoryValidator,
  tagColorValidator,
  tagNameValidator,
} from "~/utils/validators.client";

const CONFIRM_ID = "create-tag-form_confirm";

export type TagFormValues = { name: string; color: string; category: string };

export type CreateTagFormProps = {
  onSubmit?: (values: TagFormValues) => void;
  onSubmitted?: (tag: Tag) => void;
  name?: string;
  category?: string;
};

export default function CreateTagForm({
  onSubmit,
  onSubmitted,
  name,
  category,
}: CreateTagFormProps) {
  const form = useForm<TagFormValues>({
    initialValues: {
      name: "",
      color: "#ffffff",
      category: "",
    },
    validate: {
      name: (value) => blankValueValidator(value) || tagNameValidator(value),
      color: (value) => blankValueValidator(value) || tagColorValidator(value),
      category: (value) => tagCategoryValidator(value),
    },
  });

  const submitNewTag = useTypedFetcher<typeof action>();

  const loading = submitNewTag.state !== "idle";

  useEffect(() => {
    name && form.setFieldValue("name", name);
  }, [name]);

  useEffect(() => {
    category && form.setFieldValue("category", category);
  }, [category]);

  useEffect(() => {
    if (submitNewTag.data) {
      notifications.show({
        message: `Created new tag: ${submitNewTag.data.name}`,
      });
      onSubmitted?.(submitNewTag.data);
    }
  }, [submitNewTag.data]);

  return (
    <>
      <LoadingOverlay visible={loading} zIndex={1000} />
      <Form
        action="/tags"
        method="POST"
        onSubmit={form.onSubmit((values) => {
          modals.openConfirmModal({
            id: "person-create-confirm",
            title: "Confirm Creation",
            centered: true,
            children: (
              <Text>
                Are you sure you want to create a new tag named {values.name}?
              </Text>
            ),
            labels: {
              confirm: "Yes",
              cancel: "No",
            },
            onConfirm: () => {
              modals.close("person-create-confirm");
              submitNewTag.submit(values, {
                action: "/tags",
                method: "POST",
                navigate: false,
                encType: "application/json",
              });
              onSubmit?.(values);
            },
            onCancel: () => {
              modals.close("person-create-confirm");
            },
          });
        })}
      >
        <Stack gap="sm">
          <TextInput
            disabled={loading}
            label="Name"
            data-autofocus
            required
            {...form.getInputProps("name")}
          />
          <ColorInput label="Color" required {...form.getInputProps("color")} />
          <TextInput
            label="Category"
            disabled={loading || category != undefined}
            required
            {...form.getInputProps("category")}
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
