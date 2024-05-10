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
import { action } from "~/routes/people";
import { PersonWithTags, PostPersonFormData } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";
import {
  blankValueValidator,
  personNameValidator,
  qrCodeValidator,
} from "~/utils/validators.client";
import QrButton from "../qrCode/QrButton";
import TagCombobox from "../tags/TagCombobox";

export type CreatePersonFormProps = {
  onSubmitted?: (person: PersonWithTags) => void;
  name?: string;
  qrCode?: string;
};

export default function CreatePersonForm({
  onSubmitted,
  name,
  qrCode,
}: CreatePersonFormProps) {
  const navigate = useNavigate();
  const form = useForm<PostPersonFormData>({
    initialValues: {
      firstName: name?.split(" ")[0] || "",
      lastName: name?.split(" ")[1] || "",
      nickname: name?.split(" ")[2] || "",
      qrCode: qrCode || "",
      role: undefined,
    },
    validate: {
      firstName: (value) =>
        blankValueValidator(value) || personNameValidator(value),
      lastName: (value) =>
        blankValueValidator(value) || personNameValidator(value),
      nickname: (value) => {
        if (value) return personNameValidator(value);
      },
      qrCode: (value) => {
        if (value) return qrCodeValidator(value);
      },
      role: (value) => {
        if (!value) return "A role needs to be selected";
      },
    },
  });

  const submitNewPerson = useFetcherWithErrorHandler<typeof action>(
    (data) => {
      if (data.person) {
        notifications.show({
          message: (
            <>
              Created new person: <b>{formatFullName(data.person)}</b>.{" "}
              <Text span inherit c="blue">
                Click to view
              </Text>
              .
            </>
          ),
          onClick: () => {
            notifications.clean();
            navigate(`/people/${data.person.id}`);
          },
        });

        onSubmitted?.(data.person);
      }
    },
    (error) => {
      form.setErrors({
        firstName: error,
        lastName: error,
        nickname: error,
      });
    }
  );

  const loading = submitNewPerson.state !== "idle";

  // updates on new person creation
  useEffect(() => {
    if (submitNewPerson.data?.error) {
      notifications.show({
        message: `Error: ${submitNewPerson.data.error}`,
        color: "error",
      });
    } else if (submitNewPerson.data?.person) {
    }
  }, [submitNewPerson.data]);

  function handleSubmit() {
    if (!form.validate().hasErrors) {
      modals.openConfirmModal({
        title: "Confirm Creation",
        centered: true,
        children: `Are you sure you want to create a new person named ${formatFullName(
          form.values
        )}?`,
        labels: {
          confirm: "Yes",
          cancel: "No",
        },
        onConfirm: () => {
          modals.closeAll();

          submitNewPerson.submit(form.values, {
            action: "/people",
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
          label="First Name"
          required
          data-autofocus
          {...form.getInputProps("firstName")}
        />
        <TextInput
          disabled={loading}
          label="Last Name"
          required
          {...form.getInputProps("lastName")}
        />
        <TextInput label="Nickname" {...form.getInputProps("nickname")} />
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
        <TagCombobox
          required
          disabled={loading}
          onTagsChange={(values, error) => {
            if (error) {
              form.setFieldValue("role", undefined);
              form.setFieldError("role", error);
            } else {
              form.setFieldValue("role", values[0]);
            }
          }}
          category="Person Role"
          // fieldInfo={{
          //   label: "Role",
          //   description: "Select the person's role",
          //   placeholder: "Search for role...",
          // }}
          limit={1}
          error={form.getInputProps("role").error}
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
