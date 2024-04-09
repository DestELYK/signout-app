import {
  Box,
  Button,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { Person, Tag } from "@prisma/client";
import { Form } from "@remix-run/react";
import { useEffect } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { action } from "~/routes/people";
import { fullName } from "~/utils/utils";
import { alphaValidator, qrCodeValidator } from "~/utils/validators.client";
import TagCombobox from "../tags/TagCombobox";

export type PersonFormValues = {
  firstName: string;
  lastName: string;
  nickname?: string;
  qrCode?: string;
  role?: Tag;
};

export type CreatePersonFormProps = {
  onSubmitted?: (person: Person) => void;
  name?: string;
  qrCode?: string;
};

export default function CreatePersonForm({
  onSubmitted,
  name,
  qrCode,
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
      firstName: (value) => alphaValidator(value),
      lastName: (value) => alphaValidator(value),
      nickname: (value) => {
        if (value && value.length !== 0) return alphaValidator(value);
      },
      qrCode: (value) => {
        if (value && value.length !== 0) return qrCodeValidator(value);
      },
      role: (value) => {
        if (!value) return "A role needs to be selected";
      },
    },
  });

  const submitNewPerson = useTypedFetcher<typeof action>();

  const loading = submitNewPerson.state !== "idle";

  useEffect(() => {
    if (name) {
      form.setFieldValue("firstName", name.split(" ")[0]);
      form.setFieldValue("lastName", name.split(" ")[1]);
      form.setFieldValue("nickname", name.split(" ")[2]);
    }

    qrCode && form.setFieldValue("qrCode", qrCode);
  }, [name, qrCode]);

  // updates on new person creation
  useEffect(() => {
    if (submitNewPerson.state === "idle" && submitNewPerson.data) {
      onSubmitted?.(submitNewPerson.data);
    }
  }, [submitNewPerson.state, submitNewPerson.data]);

  return (
    <Box pos="relative">
      <LoadingOverlay visible={loading} zIndex={1000} />
      <Form
        action="/items"
        method="POST"
        onSubmit={form.onSubmit((values) => {
          modals.openConfirmModal({
            id: "person-create-confirm",
            title: "Confirm Creation",
            centered: true,
            children: (
              <Text>
                Are you sure you want to create a new person named{" "}
                {fullName(values)}?
              </Text>
            ),
            labels: {
              confirm: "Yes",
              cancel: "No",
            },
            onConfirm: () => {
              modals.close("person-create-confirm");

              submitNewPerson.submit(values, {
                action: "/people",
                method: "POST",
                navigate: false,
                encType: "application/json",
              });
            },
            onCancel: () => {
              modals.close("person-create-confirm");
            },
          });
        })}
      >
        <Stack gap="sm">
          <TextInput
            label="First Name"
            required
            data-autofocus
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
            onChange={(values) => {
              if (values.length == 1) {
                form.setFieldValue("role", values[0]);
              } else {
                form.setFieldValue("role", undefined);
              }
            }}
            category="Person Role"
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
