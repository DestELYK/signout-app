/**
 * TagForm Component
 *
 * A form component for creating and editing tags
 * in the signout system. Handles tag properties including name,
 * category, color, priority, and visibility with live preview.
 *
 *
 * @module TagForm
 *
 * @author Kyle Dunn
 */

import { zodResolver } from "@mantine/form";
import { TagFormSchema, TagFormType } from "~/lib/schemas";
import { TagData } from "~/utils/types.server";
import FormView, { FormViewProps } from "../base/FormView";
import TagPreview from "../tags/TagPreview";

/**
 * Props for the TagForm component
 */
export type TagFormProps = {
  /** Optional tag ID for edit mode */
  id?: number;
  /** Whether to lock the category field from editing */
  lockCategory?: boolean;
  /** Form mode - create or edit */
  type?: "create" | "edit";
} & Omit<
  FormViewProps<TagFormType, TagData>,
  "fetcher" | "method" | "action" | "inputData" | "submitLabel"
>;

/**
 * A comprehensive form component for tag creation and editing
 * Handles all tag properties with live preview and priority management
 *
 * @param props - The component props
 * @returns The rendered tag form component
 */
export default function TagForm({
  id,
  initialValues,
  type = "create",
  disabled,
  lockCategory,
  validateInputOnBlur,
  validateInputOnChange,
  onSubmit,
  onResult,
}: TagFormProps) {
  // Determine form action URL and HTTP method based on mode
  let action = "/tags";
  let method: "POST" | "PATCH" = type === "create" ? "POST" : "PATCH";

  // Append ID to action URL for edit mode
  if (id) {
    method = "PATCH";
    action += `/${id}`;
  }

  return (
    <>
      <FormView
        initialValues={initialValues}
        action={action}
        method={method}
        validateInputOnBlur={validateInputOnBlur}
        validateInputOnChange={validateInputOnChange}
        disabled={disabled}
        submitLabel="Tag"
        onResult={onResult}
        onSubmit={onSubmit}
        confirmContent={(values) => {
          return `Are you sure you want to ${type} this tag?`;
        }}
        // Live preview of tag appearance
        previewContent={(values) => (
          <TagPreview
            tag={{
              id: id ?? -1,
              name: values.name,
              color: values.color,
              priority: values.priority ?? 0,
              hidden: values.hidden ?? false,
              category: values.category,
            }}
            previewProps={{ h: undefined }}
          />
        )}
        validator={zodResolver(TagFormSchema)}
        inputData={{
          name: {
            type: "text",
            description: "Name of the tag",
            placeholder: "Tag Name",
            required: true,
          },
          category: {
            type: "text",
            description: "Category of the tag",
            placeholder: "Tag Category",
            required: true,
            disabled: lockCategory,
          },
          color: {
            type: "color",
            description: "Color of the tag",
            placeholder: "#ffffff",
            required: true,
          },
          priority: {
            type: "range",
            min: -100,
            max: 100,
            step: 5,
            required: true,
            sliderMarks: [
              { value: -100, label: "Low" },
              { value: 0, label: "Normal" },
              { value: 100, label: "High" },
            ],
            description: "Priority of the tag",
          },
          hidden: {
            type: "toggle",
            description: "Hide the tag from being displayed",
          },
        }}
      />
    </>
  );
}
