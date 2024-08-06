import { zodResolver } from "@mantine/form";
import { Tag } from "@prisma/client";
import { TagFormSchema } from "~/lib/schemas";
import FormView, { FormViewProps } from "../base/FormView";
import TagPreview from "../tags/TagPreview";

export type TagFormProps = {
    id?: number;
    lockCategory?: boolean;
    type?: "create" | "edit";
} & Omit<
    FormViewProps<Tag, { tag?: Tag; error?: undefined }>,
    "fetcher" | "method" | "action" | "inputData" | "submitLabel"
>;

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
    let action = "/tags";
    let method: "POST" | "PATCH" = type === "create" ? "POST" : "PATCH";

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
