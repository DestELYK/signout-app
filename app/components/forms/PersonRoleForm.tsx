/**
 * PersonRoleForm Component
 *
 * A specialized form component for creating and editing person roles
 * in the signout system. Handles role properties including name,
 * description, and color assignment with live preview capability.
 *
 *
 * @module PersonRoleForm
 *
 * @author Kyle Dunn
 */

import { zodResolver } from "@mantine/form";
import { ItemTypeSchema, PersonRoleType } from "~/lib/schemas";
import { PersonRoleData } from "~/utils/types.server";
import FormView, { FormViewProps } from "../base/FormView";
import HoverBadge from "../HoverBadge";

/**
 * Props for the PersonRoleForm component
 */
export interface PersonRoleFormProps
  extends Omit<
    FormViewProps<PersonRoleType, PersonRoleData>,
    "fetcher" | "method" | "action" | "inputData" | "submitLabel"
  > {
  /** Optional role ID for edit mode */
  id?: number;
  /** Form mode - create or edit */
  type?: "create" | "edit";
}

/**
 * A specialized form component for person role creation and editing
 * Handles role properties with color selection and live preview
 *
 * @param props - The component props
 * @returns The rendered person role form component
 */
export default function PersonRoleForm({
  id,
  type = "create",
  initialValues,
  disabled,
  validateInputOnBlur,
  validateInputOnChange,
  onSubmit,
  onResult,
}: PersonRoleFormProps) {
  // Determine form action URL and HTTP method based on mode
  let action = "/people/roles";
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
      submitLabel="Person Role"
      onResult={onResult}
      onSubmit={(values) => {
        onSubmit?.(values);

        return true;
      }}
      confirmContent={(values) => {
        return `Are you sure you want to ${type} this role?`;
      }}
      validator={zodResolver(ItemTypeSchema)}
      inputData={{
        name: {
          type: "text",
          required: true,
          description: "The name of the role",
          label: "Name",
        },
        description: {
          type: "text",
          description: "The description of the role",
          label: "Description",
        },
        color: {
          type: "color",
          required: true,
          description: "The color of the role",
          label: "Color",
        },
      }}
      // Live preview of role appearance
      previewContent={(values) => (
        <HoverBadge name={values.name} description={values.description} color={values.color} />
      )}
    />
  );
}
