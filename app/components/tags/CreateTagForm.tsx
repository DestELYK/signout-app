import {
  Button,
  ColorInput,
  Group,
  LoadingOverlay,
  Slider,
  Space,
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
import TagPreview from "./TagPreview";

export type CreateTagFormProps = {
  onSubmit?: (values: PostTagFormData) => void;
  onSubmitted?: (tag: Tag) => void;
  id?: number;
  name?: string;
  color?: string;
  category?: string;
  priority?: number;
  hidden?: boolean;
  lockCategory?: boolean;
  formType?: "create" | "edit";
};

export default function CreateTagForm({
  onSubmit,
  onSubmitted,
  id,
  name,
  color,
  priority,
  hidden,
  category,
  lockCategory,
  formType = "create",
}: CreateTagFormProps) {
  const navigate = useNavigate();
  const form = useForm<PostTagFormData>({
    initialValues: {
      name: name ?? "",
      color: color ?? "#ffffff",
      category: category ?? "",
      priority: priority ?? 0,
      hidden: hidden ?? false,
    },
    validate: {
      name: (value) => blankValueValidator(value) || tagNameValidator(value),
      color: (value) => blankValueValidator(value) || tagColorValidator(value),
      category: (value) =>
        blankValueValidator(value) || tagCategoryValidator(value),
      priority: (value) => {
        if (value !== undefined && (value > 1000 || value < -1000))
          return "Priority is outside range (-1000 & 1000)";
      },
    },
  });

  const submitTag = useFetcherWithErrorHandler<typeof action>(
    (data) => {
      if (data.tag) {
        notifications.show({
          message: (
            <>
              {formType === "create" ? "Created new" : "Updated"} tag:{" "}
              <b>{data.tag.name}</b>.
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
        category: error,
      });
    }
  );

  const loading = submitTag.state !== "idle";

  useEffect(() => {
    name !== undefined && form.setFieldValue("name", name);
  }, [name]);

  useEffect(() => {
    category !== undefined && form.setFieldValue("category", category);
  }, [category]);

  useEffect(() => {
    color !== undefined && form.setFieldValue("color", color);
  }, [color]);

  useEffect(() => {
    priority !== undefined && form.setFieldValue("priority", priority);
  }, [priority]);

  useEffect(() => {
    hidden !== undefined && form.setFieldValue("hidden", hidden);
  }, [hidden]);

  function handleSubmit() {
    if (!form.validate().hasErrors) {
      modals.openConfirmModal({
        title: "Confirm Creation",
        centered: true,
        children: (
          <Text>
            {formType === "create"
              ? `Are you sure you want to create a new tag named ${form.values.name}?`
              : `Are you sure you want to update the tag named ${form.values.name}?`}
          </Text>
        ),
        labels: {
          confirm: "Yes",
          cancel: "No",
        },
        onConfirm: () => {
          modals.closeAll();
          submitTag.submit(form.values, {
            action: formType === "create" ? "/tags" : `/tags/${id}`,
            method: "POST",
            navigate: false,
            encType: "application/json",
          });

          onSubmit?.(form.values);
        },
        onCancel: () => {
          modals.closeAll();
        },
      });
    }
  }

  return (
    <>
      <LoadingOverlay visible={loading} zIndex={1000} />
      <Stack w="100%" h="100%" gap="sm">
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
          disabled={loading || lockCategory}
          required
          {...form.getInputProps("category")}
        />
        <Switch
          label="Hidden"
          description="Hides tag from being displayed, but will still be used for filtering"
          {...form.getInputProps("hidden")}
          checked={form.values.hidden}
        />
        <Space mt="auto" />
        <TagPreview
          tag={{
            id: id ?? -1,
            name: form.values.name,
            color: form.values.color,
            priority: form.values.priority ?? 0,
            hidden: form.values.hidden ?? false,
            category: form.values.category,
          }}
          previewProps={{ h: undefined }}
        />
        {formType === "edit" ? (
          form.isDirty() && (
            <Group w="100%" grow>
              <Button disabled={loading} onClick={() => handleSubmit()}>
                Update
              </Button>
              <Button
                disabled={loading}
                onClick={() => form.reset()}
                color="red"
                variant="outline"
              >
                Reset
              </Button>
            </Group>
          )
        ) : (
          <Button disabled={loading} onClick={() => handleSubmit()}>
            Create
          </Button>
        )}
      </Stack>
    </>
  );
}
