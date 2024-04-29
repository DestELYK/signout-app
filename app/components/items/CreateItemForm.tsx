import {
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
import { notifications } from "@mantine/notifications";
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { action } from "~/routes/items";
import { ItemWithTags, PostItemFormData } from "~/utils/types.server";
import {
  blankValueValidator,
  itemDescriptionValidator,
  itemNameValidator,
  qrCodeValidator,
} from "~/utils/validators.client";
import QrButton from "../qrCode/QrButton";
import TagCombobox from "../tags/TagCombobox";

const DESCRIPTION_LIMIT = 40;
const TAG_MIN = 1;
const TAG_MAX = 5;

export type CreateItemFormProps = {
  onSubmitted?: (item: ItemWithTags) => void;
  name?: string;
  qrCode?: string;
};

export default function CreateItemForm({
  onSubmitted,
  name,
  qrCode,
}: CreateItemFormProps) {
  const navigate = useNavigate();

  const form = useForm<PostItemFormData>({
    initialValues: {
      name: "",
      qrCode: "",
      description: "",
      location: { id: -1 },
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
      location: (value) => {
        if (!value || value.id == -1) return "A location needs to be selected";
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

  const submitNewItem = useFetcherWithErrorHandler<typeof action>(
    (data) => {
      if (data.item) {
        notifications.show({
          message: (
            <>
              Created new item: <b>{data.item.name}</b>.{" "}
              <Text span inherit c="blue">
                Click to view
              </Text>
              .
            </>
          ),
          onClick: () => {
            notifications.clean();
            navigate(`/items/${data.item.id}`);
          },
          autoClose: 10000,
        });

        onSubmitted?.(data.item);
      }
    },
    (error) => {
      form.setFieldError("name", error);
    }
  );

  const loading = submitNewItem.state === "submitting";

  useEffect(() => {
    name && form.setFieldValue("name", name);
  }, [name]);

  useEffect(() => {
    qrCode && form.setFieldValue("qrCode", qrCode);
  }, [qrCode]);

  function handleSubmit() {
    if (!form.validate().hasErrors) {
      modals.openConfirmModal({
        title: "Confirm Creation",
        centered: true,
        children: `Are you sure you want to create a new item called ${form.values.name}?`,
        labels: {
          confirm: "Yes",
          cancel: "No",
        },
        onConfirm: () => {
          modals.closeAll();

          submitNewItem.submit(form.values, {
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
          required
          disabled={loading}
          onTagsChange={(values, error) => {
            if (error) form.setFieldError("location", error);
            else form.setFieldValue("location", values[0] || { id: -1 });
          }}
          category="Location"
          limit={1}
          fieldInfo={{
            label: "Location",
            placeholder: "Search for location...",
            description: "Select a location in which the item is located",
          }}
          error={form.getInputProps("location").error}
        />
        <TagCombobox
          required
          disabled={loading}
          onTagsChange={(values) => {
            form.setFieldValue("tags", values);
          }}
          category="Item Type"
          limit={3}
          fieldInfo={{
            label: "Type",
            placeholder: "Search for item types...",
            description: "Select at least 1 type for the item",
          }}
          error={form.getInputProps("tags").error}
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
