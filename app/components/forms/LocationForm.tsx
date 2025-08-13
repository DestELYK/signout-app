import { zodResolver } from "@mantine/form";
import { ItemTypeSchema, LocationType } from "~/lib/schemas";
import { LocationData } from "~/utils/types.server";
import FormView, { FormViewProps } from "../base/FormView";

export interface LocationFormProps
    extends Omit<
        FormViewProps<LocationType, LocationData>,
        "fetcher" | "method" | "action" | "inputData" | "submitLabel"
    > {
    id?: number;
    type?: "create" | "edit";
}

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
    let action = "/locations";
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
