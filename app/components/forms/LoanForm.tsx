/**
 * LoanForm Component
 *
 * A specialized form component for updating existing loans in the
 * signout system. Handles loan modifications including person assignment,
 * tag associations, and form submission with notifications.
 *
 *
 * @module LoanForm
 *
 * @author Kyle Dunn
 */

import {
  ActionIcon,
  Button,
  Group,
  InputWrapper,
  Paper,
  Stack,
  Title,
  Tooltip,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconArrowBackUp, IconArrowRight } from "@tabler/icons-react";
import { useState } from "react";
import { UseDataFunctionReturn } from "remix-typedjson";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { LoanFormSchema, LoanFormType } from "~/lib/schemas";
import { DataReturn, ItemData, LoanData, PersonData, TagData } from "~/utils/types.server";
import PersonPicker from "../people/PersonPicker";
import TagCombobox from "../tags/TagCombobox";

/**
 * Props for the LoanForm component
 */
export type LoanFormProps = {
  /** The ID of the loan being edited */
  id: number;
  /** Initial values for the form */
  initialValues?: {
    /** The person associated with the loan */
    person: PersonData;
    /** Items included in the loan (currently unused) */
    items: ItemData[];
    /** Tags associated with the loan */
    tags: TagData[];
  };
  /** Callback fired when form is submitted */
  onSubmit?: (values: LoanFormType) => void;
  /** Callback fired when form submission completes */
  onResult?: (data: UseDataFunctionReturn<DataReturn<LoanData>>) => void;
};

/**
 * A specialized form component for loan editing and updates
 * Handles person assignment and tag management for existing loans
 *
 * @param props - The component props
 * @returns The rendered loan form component
 */
export default function LoanForm({ id, initialValues, onSubmit, onResult }: LoanFormProps) {
  // State for form fields
  const [person, setPerson] = useState<PersonData | undefined>(initialValues?.person);
  const [items, setItems] = useState<ItemData[]>(initialValues?.items ?? []);
  const [tags, setTags] = useState<TagData[]>(initialValues?.tags ?? []);

  // Notification identifier for loan updates
  const notificationId = "update-loan";

  // Fetcher for handling loan update requests
  const fetcher = useFetcherWithErrorHandler<DataReturn<LoanData>>(
    (data) => {
      if (data) {
        // Update notification on successful submission
        notifications.update({
          id: notificationId,
          message: `Updated loan successfully`,
          loading: false,
          autoClose: 5000,
          withCloseButton: true,
        });

        // Reset form values to initial state
        form.reset();
        setPerson(undefined);
        setItems([]);
        setTags([]);

        onResult?.(data);
      }
    },
    (error) => {
      // Update notification on error
      notifications.update({
        id: notificationId,
        message: `Failed to update loan`,
        color: "red",
        loading: false,
        autoClose: 5000,
        withCloseButton: true,
      });
    }
  );

  // Form instance with validation
  const form = useForm<Partial<LoanFormType>>({
    initialValues: {
      person: { id: person?.id ?? -1 },
      tags: tags,
    },
    validateInputOnChange: true,
    validate: zodResolver(LoanFormSchema.pick({ person: true, tags: true })),
  });

  return (
    <form style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Stack h="100%">
        <Title order={4}>Person</Title>
        <Paper withBorder p="xs">
          <InputWrapper error={form.errors.person}>
            <PersonPicker
              promptOutstanding
              value={person}
              error={form.errors.personId}
              onChange={(person) => {
                setPerson(person);
                form.setFieldValue("person", { id: person?.id ?? -1 });
              }}
            />
          </InputWrapper>
        </Paper>
        <TagCombobox
          value={tags}
          category=""
          lockCategory={false}
          error={form.errors.tagIds as string}
          onTagsChange={(tags) => {
            setTags(tags);
            form.setFieldValue("tags", tags);
          }}
        />
        <Group mt="auto" justify="end">
          <Tooltip label="Reset form" position="left">
            <ActionIcon
              variant="outline"
              size="input-sm"
              color="red"
              onClick={() => {
                form.reset();
              }}
            >
              <IconArrowBackUp />
            </ActionIcon>
          </Tooltip>
          <Button
            disabled={form.isValid() === false}
            rightSection={<IconArrowRight />}
            onClick={(event) => {
              onSubmit?.(form.values as LoanFormType);

              // Show loading notification
              notifications.show({
                id: notificationId,
                message: "Updating loan...",
                loading: true,
                autoClose: false,
                withCloseButton: true,
              });

              // Submit form data
              fetcher.submit(JSON.stringify(form.values), {
                method: "PATCH",
                action: `/loans/${id}`,
                encType: "application/json",
              });
            }}
          >
            Update Loan
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
