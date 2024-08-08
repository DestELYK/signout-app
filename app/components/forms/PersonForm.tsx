import { zodResolver } from "@mantine/form";
import { useEffect } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { PersonFormSchema, PersonFormType } from "~/lib/schemas";
import { loader } from "~/routes/people.roles";
import { PersonWithTags } from "~/utils/types.server";
import FormView, { FormViewProps } from "../base/FormView";

export type PersonFormProps = {
    id?: number;
    type?: "create" | "edit";
} & Omit<
    FormViewProps<
        PersonFormType & { role?: number },
        { person?: PersonWithTags; error?: undefined }
    >,
    "fetcher" | "method" | "action" | "inputData" | "submitLabel"
>;

export default function PersonForm({
    id,
    type = "create",
    initialValues,
    disabled,
    validateInputOnBlur,
    validateInputOnChange,
    onSubmit,
    onResult,
}: PersonFormProps) {
    const fetcher = useTypedFetcher<typeof loader>();

    useEffect(() => {
        fetcher.load("/people/roles");
    }, []);

    let action = "/people";
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
                submitLabel="Person"
                onResult={onResult}
                onSubmit={(values) => {
                    onSubmit?.(values);

                    console.log(values);

                    return true;
                }}
                confirmContent={(values) => {
                    return `Are you sure you want to ${type} this person?`;
                }}
                previewContent={(values) => (
                    <>
                        {
                            // TODO: Add preview content here
                        }
                    </>
                )}
                validator={zodResolver(PersonFormSchema)}
                inputData={{
                    firstName: {
                        type: "text",
                        description: "The first name of the person",
                        placeholder: "Enter first name",
                        required: true,
                        groupId: 1,
                    },
                    lastName: {
                        type: "text",
                        description: "The last name of the person",
                        placeholder: "Enter last name",
                        required: true,
                        groupId: 1,
                    },
                    nickname: {
                        type: "text",
                        description: "The nickname of the person (optional)",
                        placeholder: "Enter nickname",
                        required: false,
                    },
                    studentId: {
                        label: "Student ID",
                        type: "qrcode",
                        description: "The student ID of the person (optional)",
                        placeholder: "Enter student ID",
                        required: false,
                    },
                    role: {
                        type: "select",
                        label: "Role",
                        description: "The role of the person",
                        placeholder: "Select role",
                        required: true,
                        options:
                            fetcher.data?.roles.map((role) => ({
                                value: role.id.toString(),
                                label: role.name,
                            })) ?? [],
                    },
                    tags: {
                        type: "tags",
                        description: "The tags associated with the person",
                        placeholder: "Enter tags",
                        required: false,
                        max: 1,
                    },
                }}
            />
        </>
    );
}
