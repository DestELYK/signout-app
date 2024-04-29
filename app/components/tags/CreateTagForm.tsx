import {
  Button,
  ColorInput,
  Group,
  LoadingOverlay,
  Slider,
  Stack,
  Switch,
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
      priority: 0,
      hidden: false,
    },
    validate: {
      name: (value) => blankValueValidator(value) || tagNameValidator(value),
      color: (value) => blankValueValidator(value) || tagColorValidator(value),
      category: (value) => tagCategoryValidator(value),
      priority: (value) => {
        if (value !== undefined && (value > 1000 || value < -1000))
          return "Priority is outside range (-1000 & 1000)";
      },
    },
  });

  const submitNewTag = useFetcherWithErrorHandler<typeof action>(
    (data) => {
      if (data.tag) {
        notifications.show({
          message: (
            <>
              Created new tag: <b>{data.tag.name}</b>. .
            </>
          ),
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
        id: "tag-create-confirm",
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
          modals.close("tag-create-confirm");
          submitNewTag.submit(form.values, {
            action: "/tags",
            method: "POST",
            navigate: false,
            encType: "application/json",
          });

          onSubmit?.(form.values);
        },
        onCancel: () => {
          modals.close("tag-create-confirm");
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
        <ColorInput
          label="Color"
          description="Tags will be displayed with this color"
          required
          {...form.getInputProps("color")}
        />
        <Stack gap={0}>
          <Text size="sm">Priority</Text>
          <Text size="xs" c="dimmed">
            Greater priority tags will be displayed before lower priority tags
          </Text>
          <Slider
            disabled={loading}
            marks={[
              { value: -100, label: "Low" },
              { value: 0, label: "Normal" },
              { value: 100, label: "High" },
            ]}
            step={5}
            min={-100}
            max={100}
            p="sm"
            mb="sm"
            {...form.getInputProps("priority")}
          />
        </Stack>
        <TextInput
          label="Category"
          disabled={loading || category != undefined}
          required
          {...form.getInputProps("category")}
        />
        <Switch
          label="Hidden"
          description="Hides tag from being displayed, but will still be used for filtering"
          {...form.getInputProps("hidden")}
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
