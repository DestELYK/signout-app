import { zodResolver } from "@mantine/form";
import { ItemTypeSchema, PersonRoleType } from "~/lib/schemas";
import { PersonRoleData } from "~/utils/types.server";
import FormView, { FormViewProps } from "../base/FormView";
import HoverBadge from "../HoverBadge";

export interface PersonRoleFormProps
    extends Omit<
        FormViewProps<PersonRoleType, PersonRoleData>,
        "fetcher" | "method" | "action" | "inputData" | "submitLabel"
    > {
    id?: number;
    type?: "create" | "edit";
}

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
    let action = "/people/roles";
    let method: "POST" | "PATCH" = type === "create" ? "POST" : "PATCH";

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
            previewContent={(values) => (
                <HoverBadge
                    name={values.name}
                    description={values.description}
                    color={values.color}
                />
            )}
        />
    );
}
