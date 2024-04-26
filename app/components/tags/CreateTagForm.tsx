import {
  Button,
  ColorInput,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { Tag } from "@prisma/client";
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { action } from "~/routes/tags";
import { PostTagFormData } from "~/utils/types.server";
import {
  blankValueValidator,
  tagCategoryValidator,
  tagColorValidator,
  tagNameValidator,
} from "~/utils/validators.client";

export type CreateTagFormProps = {
  onSubmit?: (values: PostTagFormData) => void;
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
  const navigate = useNavigate();
  const form = useForm<PostTagFormData>({
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

  const submitNewTag = useFetcherWithErrorHandler<typeof action>(
    (data) => {
      if (data.tag) {
        notifications.show({
          message: (
            <>
              Created new person: <b>{data.tag.name}</b>.{" "}
              <Text span inherit c="blue">
                Click to view
              </Text>
              .
            </>
          ),
          onClick: () => {
            notifications.clean();
            navigate(`/tags/${data.tag.id}`);
          },
        });
        onSubmitted?.(data.tag);
      }
    },
    (error) => {
      form.setErrors({
        name: error,
        color: error,
      });
    }
  );

  const loading = submitNewTag.state !== "idle";

  useEffect(() => {
    name && form.setFieldValue("name", name);
  }, [name]);

  useEffect(() => {
    category && form.setFieldValue("category", category);
  }, [category]);

  function handleSubmit() {
    if (!form.validate().hasErrors) {
      modals.openConfirmModal({
        id: "person-create-confirm",
        title: "Confirm Creation",
        centered: true,
        children: (
          <Text>
            Are you sure you want to create a new tag named {form.values.name}?
          </Text>
        ),
        labels: {
          confirm: "Yes",
          cancel: "No",
        },
        onConfirm: () => {
          modals.close("person-create-confirm");
          submitNewTag.submit(form.values, {
            action: "/tags",
            method: "POST",
            navigate: false,
            encType: "application/json",
          });

          onSubmit?.(form.values);
        },
        onCancel: () => {
          modals.close("person-create-confirm");
        },
      });
    }
  }

  return (
    <>
      <LoadingOverlay visible={loading} zIndex={1000} />
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
          <Button disabled={loading} onClick={() => handleSubmit()}>
            Create
          </Button>
        </Group>
      </Stack>
    </>
  );
}
