import { zodResolver } from "@mantine/form";
import { ItemTypeSchema, ItemTypeType } from "~/lib/schemas";
import { ItemTypeData } from "~/utils/types.server";
import FormView, { FormViewProps } from "../base/FormView";

export interface ItemTypeFormProps
    extends Omit<
        FormViewProps<ItemTypeType, ItemTypeData>,
        "fetcher" | "method" | "action" | "inputData" | "submitLabel"
    > {
    id?: number;
    type?: "create" | "edit";
}

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
    let action = "/items/types";
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
