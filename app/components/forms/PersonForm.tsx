import { zodResolver } from "@mantine/form";
import { useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { PersonFormSchema, PersonFormType } from "~/lib/schemas";
import { loader as rolesLoader } from "~/routes/people_.roles";
import { PersonData } from "~/utils/types.server";
import FetcherField from "../base/FetcherField";
import FormView, { FormViewProps } from "../base/FormView";
import ComboView from "../ComboView";
import PersonRoleForm from "./PersonRoleForm";

export type PersonFormProps = {
    id?: number;
    type?: "create" | "edit";
} & Omit<
    FormViewProps<PersonFormType, PersonData>,
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
    const rolesFetcher = useTypedFetcher<typeof rolesLoader>();
    const [personRole, setPersonRole] = useState<string>(initialValues.role?.name ?? "");

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

                    return true;
                }}
                confirmContent={(values) => {
                    return `Are you sure you want to ${type} this person?`;
                }}
                validator={zodResolver(PersonFormSchema)}
                inputData={{
                    firstName: {
                        type: "text",
                        description: "The first name of the person",
                        placeholder: "Enter first name",
                        autoComplete: "given-name",
                        required: true,
                        groupId: 1,
                    },
                    lastName: {
                        type: "text",
                        description: "The last name of the person",
                        placeholder: "Enter last name",
                        autoComplete: "family-name",
                        required: true,
                        groupId: 1,
                    },
                    nickname: {
                        type: "text",
                        description: "The nickname of the person (optional)",
                        placeholder: "Enter nickname",
                        autoComplete: "additional-name",
                        required: false,
                    },
                    schoolId: {
                        label: "School ID",
                        type: "qrcode",
                        description: "The ID of the person (optional)",
                        placeholder: "Enter student ID",
                        required: false,
                    },
                    role: {
                        type: "custom",
                        handleCustomInput: (form) => (
                            <FetcherField
                                label="Role"
                                description="Select the person's role"
                                placeholder="Search for role..."
                                fetchPath="/people/roles"
                                createTitle="Create New Role"
                                fetcher={rolesFetcher}
                                required
                                value={personRole}
                                onBlur={() => {
                                    form.validateField("role");
                                    setPersonRole(form.values.role?.name ?? "");

                                    return true;
                                }}
                                onFocus={() => {
                                    form.clearFieldError("role");

                                    return true;
                                }}
                                onChange={(value) => {
                                    setPersonRole(value);

                                    return true;
                                }}
                                onClear={() => {
                                    setPersonRole("");
                                    form.setFieldValue("role", {
                                        id: -1,
                                        name: "",
                                        description: "",
                                    });
                                }}
                                error={form.errors.role}
                                onFetched={(fetchData) => fetchData?.data ?? []}
                                withQRCode={false}
                                onSelect={(id, value) => {
                                    if (value) {
                                        setPersonRole(value.name);
                                        form.setFieldValue("role", value);

                                        return true;
                                    }
                                }}
                                handleCreateForm={(close) => {
                                    return (
                                        <PersonRoleForm
                                            initialValues={{
                                                name: personRole,
                                                description: "",
                                                color: "#000000",
                                            }}
                                            onResult={(result) => {
                                                if (result.data) {
                                                    form.setFieldValue("role", result.data);
                                                    close();
                                                }
                                            }}
                                        />
                                    );
                                }}
                            >
                                {(value, query) => (
                                    <ComboView
                                        title={value.name}
                                        caption={value.description}
                                        highlight={query ?? ""}
                                    />
                                )}
                            </FetcherField>
                        ),
                    },
                    tags: {
                        type: "tags",
                        description: "The tags associated with the person",
                        placeholder: "Enter tags",
                        required: false,
                    },
                }}
            />
        </>
    );
}
