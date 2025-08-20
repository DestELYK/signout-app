/**
 * ItemTypeForm Component
 *
 * A specialized form component for creating and editing item types
 * in the signout system. Handles item type properties including name
 * and description for categorizing inventory items.
 *
 *
 * @module ItemTypeForm
 *
 * @author Kyle Dunn
 */

import { zodResolver } from "@mantine/form";
import { ItemTypeSchema, ItemTypeType } from "~/lib/schemas";
import { ItemTypeData } from "~/utils/types.server";
import FormView, { FormViewProps } from "../base/FormView";

/**
 * Props for the ItemTypeForm component
 */
export interface ItemTypeFormProps
  extends Omit<
    FormViewProps<ItemTypeType, ItemTypeData>,
    "fetcher" | "method" | "action" | "inputData" | "submitLabel"
  > {
  /** Optional item type ID for edit mode */
  id?: number;
  /** Form mode - create or edit */
  type?: "create" | "edit";
}

/**
 * A specialized form component for item type creation and editing
 * Handles item type properties for inventory categorization
 *
 * @param props - The component props
 * @returns The rendered item type form component
 */
export default function ItemTypeForm({
  id,
  type = "create",
  initialValues,
  disabled,
  validateInputOnBlur,
  validateInputOnChange,
  onSubmit,
  onResult,
}: ItemTypeFormProps) {
  // Determine form action URL and HTTP method based on mode
  let action = "/items/types";
  let method: "POST" | "PATCH" = type === "create" ? "POST" : "PATCH";

  // Append ID to action URL for edit mode
  if (id) {
    method = "PATCH";
    action += `/${id}`;
  }

  return (
    <FormView
      initialValues={initialValues}
      action={action}
      method={method}
      validateInputOnBlur={validateInputOnBlur}
      validateInputOnChange={validateInputOnChange}
      disabled={disabled}
      submitLabel="Item Type"
      onResult={onResult}
      onSubmit={(values) => {
        onSubmit?.(values);

        return true;
      }}
      confirmContent={(values) => {
        return `Are you sure you want to ${type} this type?`;
      }}
      validator={zodResolver(ItemTypeSchema)}
      inputData={{
        name: {
          type: "text",
          required: true,
          description: "The name of the item type",
          label: "Name",
          placeholder: "Enter the name of the item type",
        },
        description: {
          type: "text",
          description: "The description of the item type",
          label: "Description",
          placeholder: "Enter the description of the item type",
        },
      }}
    />
  );
}
