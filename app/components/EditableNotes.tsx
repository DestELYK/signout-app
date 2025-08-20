/**
 * EditableNotes Component
 *
 * An editable text area component for managing notes with inline editing
 * capabilities and automatic saving functionality.
 *
 *
 * @module EditableNotes
 *
 * @author Kyle Dunn
 */

import { ActionIcon, Box, Group, Text, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useEffect } from "react";
import { useTypedFetcher } from "remix-typedjson";

/**
 * Props for the EditableNotes component
 */
export interface EditableNotesProps {
  /** Form action URL for saving notes */
  action?: string;
  /** Current notes value */
  value?: string | null;
  /** Whether the notes are editable */
  editable?: boolean;
}

/**
 * An editable text area component for inline notes editing
 * Provides auto-save functionality and form validation
 *
 * @param props - The component props
 * @returns The rendered editable notes component
 */
export default function EditableNotes({ action, value, editable }: EditableNotesProps) {
  const fetcher = useTypedFetcher();

  const form = useForm<{ notes?: string | null }>({
    validateInputOnChange: true,
    clearInputErrorOnChange: true,
    initialValues: { notes: value },
  });

  if (action === undefined) {
    editable = false;
  }

  useEffect(() => {
    form.setInitialValues({ notes: value });
    form.reset();
  }, [value]);

  function updateNotes(notes?: string | null) {
    form.setFieldValue("notes", notes);

    if (!form.validate().hasErrors) {
      fetcher.submit(form.values, {
        action: action,
        method: "PATCH",
        encType: "application/json",
      });
    }
  }

  return (
    <>
      <Box w="100%" pos="relative">
        <Textarea
          w="100%"
          minRows={5}
          maxRows={10}
          autosize
          readOnly={!editable}
          {...(!form.values.notes && { placeholder: "No notes" })}
          {...form.getInputProps("notes")}
          onBlur={(event) => updateNotes(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.shiftKey) {
              event.preventDefault();
              updateNotes(event.currentTarget.value);
            }
          }}
        />

        {fetcher.state !== "idle" ? (
          <Text
            pos="absolute"
            bottom={8}
            right={20}
            size="xs"
            c="dimmed"
            ta="end"
            style={{ zIndex: 50 }}
          >
            Saving...
          </Text>
        ) : (
          form.isDirty() && (
            <Group pos="absolute" bottom={8 + (form.errors.notes ? 16 : 0)} right={20}>
              <ActionIcon
                variant="outline"
                size="input-xs"
                style={{ zIndex: 50 }}
                onClick={() => updateNotes(form.values.notes)}
              >
                <IconDeviceFloppy />
              </ActionIcon>
            </Group>
          )
        )}
      </Box>
    </>
  );
}
