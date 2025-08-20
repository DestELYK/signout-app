/**
 * LocationForm Component
 *
 * A specialized form component for creating and editing locations
 * in the signout system. Handles location properties for organizing
 * and categorizing the physical storage of inventory items.
 *
 *
 * @module LocationForm
 *
 * @author Kyle Dunn
 */

import { zodResolver } from "@mantine/form";
import { ItemTypeSchema, LocationType } from "~/lib/schemas";
import { LocationData } from "~/utils/types.server";
import FormView, { FormViewProps } from "../base/FormView";

/**
 * Props for the LocationForm component
 */
export interface LocationFormProps
  extends Omit<
    FormViewProps<LocationType, LocationData>,
    "fetcher" | "method" | "action" | "inputData" | "submitLabel"
  > {
  /** Optional location ID for edit mode */
  id?: number;
  /** Form mode - create or edit */
  type?: "create" | "edit";
}

/**
 * A specialized form component for location creation and editing
 * Handles location properties for item organization and storage
 *
 * @param props - The component props
 * @returns The rendered location form component
 */
export default function LocationForm({
  id,
  type = "create",
  initialValues,
  disabled,
  validateInputOnBlur,
  validateInputOnChange,
  onSubmit,
  onResult,
}: LocationFormProps) {
  // Determine form action URL and HTTP method based on mode
  let action = "/locations";
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
      submitLabel="Item Location"
      onResult={onResult}
      onSubmit={(values) => {
        onSubmit?.(values);

        return true;
      }}
      confirmContent={(values) => {
        return `Are you sure you want to ${type} this location?`;
      }}
      validator={zodResolver(ItemTypeSchema)}
      inputData={{
        name: {
          type: "text",
          required: true,
          description: "The name of the location",
          label: "Name",
        },
      }}
    />
  );
}
