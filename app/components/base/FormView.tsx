import {
    ActionIcon,
    Box,
    Button,
    Checkbox,
    ColorInput,
    Divider,
    Group,
    InputWrapper,
    LoadingOverlay,
    Modal,
    Select,
    Slider,
    Switch,
    Text,
    Textarea,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { Form, useForm } from "@mantine/form";
import { upperFirst, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useNavigate, useNavigation } from "@remix-run/react";
import { IconArrowBackUp, IconArrowRight, IconPlus } from "@tabler/icons-react";
import { FormErrors, UseFormReturnType } from "node_modules/@mantine/form/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { UseDataFunctionReturn } from "remix-typedjson";
import { useFetcherWithErrorHandler } from "~/lib/hooks";

type FormInputData<T> = {
    [key in keyof T]: {
        type:
            | "text"
            | "number"
            | "textarea"
            | "select"
            | "checkbox"
            | "tags"
            | "color"
            | "toggle"
            | "range"
            | "custom";
        description?: string;
        placeholder?: string;
        required?: boolean;
        disabled?: boolean;
        options?: { value: string; label: string }[];
        sliderMarks?: { value: number; label: string }[];
        min?: number;
        max?: number;
        step?: number;
        handleCustomInput?: (form: UseFormReturnType<T>) => React.ReactNode;
    };
};

type FormData<T> = Omit<T, "id">;

export interface FormViewProps<T, R> {
    initialValues: FormData<T>;
    errors?: Record<string, string>;
    action: string;
    method: "POST" | "PATCH";
    submitLabel?: string;
    inputData: FormInputData<FormData<T>>;
    disabled?: boolean;
    validateInputOnBlur?: boolean;
    validateInputOnChange?: boolean;
    validator?: (values: FormData<T>) => FormErrors;
    confirmContent?: (values: FormData<T>) => React.ReactNode;
    previewContent?: (values: FormData<T>) => React.ReactNode;
    onSubmit?: (values: FormData<T>) => boolean;
    onResult?: (data: UseDataFunctionReturn<R>) => void;
}

export default function FormView<T extends Record<string, any>, R>({
    initialValues,
    errors,
    action,
    method,
    submitLabel,
    inputData,
    disabled,
    validateInputOnBlur = true,
    validateInputOnChange = true,
    validator,
    confirmContent = (values) => "Are you sure you want to submit this form?",
    previewContent,
    onSubmit,
    onResult,
}: FormViewProps<T, R>) {
    const navigation = useNavigation();
    const [opened, { open, close }] = useDisclosure();
    const formRef = useRef<HTMLFormElement>(null);
    const [notificationId, setNotificationId] = useState<string>();
    const navigate = useNavigate();

    const form = useForm<FormData<T>>({
        mode: "controlled",
        clearInputErrorOnChange: true,
        validateInputOnBlur,
        validateInputOnChange,
        initialValues: initialValues as T,
        validate: validator,
    });

    const fetcher = useFetcherWithErrorHandler<R>(
        (data) => {
            if (data) {
                notifications.update({
                    id: notificationId,
                    message: `${method === "POST" ? "Created" : "Updated"} ${
                        submitLabel ? submitLabel.toLocaleLowerCase() : ""
                    } successfully`,
                    loading: false,
                    autoClose: 5000,
                    withCloseButton: true,
                });

                onResult?.(data);
            }
        },
        (error) => {
            form.setErrors({
                name: error,
                color: error,
                category: error,
            });
        }
    );

    useEffect(() => {
        if (errors) {
            form.setErrors(errors);
        }
    }, [errors]);

    const loading = navigation.state !== "idle";

    const buttons = (
        <Group justify="end">
            <Tooltip label="Reset form" position="left">
                <ActionIcon variant="outline" size="input-sm" color="red" type="reset">
                    <IconArrowBackUp />
                </ActionIcon>
            </Tooltip>
            <Button
                rightSection={method === "POST" ? <IconPlus /> : <IconArrowRight />}
                type="submit"
            >
                {method === "POST" ? "Create" : "Update"}
                {submitLabel ? ` ${submitLabel}` : ""}
            </Button>
        </Group>
    );

    const formContent = (
        <>
            {Object.entries(inputData).map(([key, value], index) => {
                const props = {
                    ...(index === 0 && { "data-autofocus": true }),
                    name: key,
                    label: upperFirst(key),
                    description: value.description,
                    placeholder: value.placeholder,
                    required: value.required,
                    disabled: disabled || value.disabled || loading,
                    ...form.getInputProps(key),
                };

                switch (value.type) {
                    case "number":
                        return (
                            <TextInput
                                key={key}
                                {...props}
                                type="number"
                                min={value.min}
                                max={value.max}
                                step={value.step}
                            />
                        );
                    case "textarea":
                        return <Textarea key={key} {...props} />;
                    case "select":
                        return <Select key={key} {...props} data={value.options || []} />;
                    case "tags":
                        return <Text key={key}>TODO</Text>;
                    case "checkbox":
                        return (
                            <Checkbox
                                key={key}
                                {...props}
                                type="checkbox"
                                checked={form.values[key]}
                            />
                        );
                    case "color":
                        return <ColorInput key={key} {...props} disabled={disabled} />;
                    case "toggle":
                        return <Switch key={key} {...props} checked={form.values[key]} />;
                    case "range":
                        return (
                            <InputWrapper
                                key={key}
                                label={props.label}
                                description={props.description}
                                error={props.error}
                                required={props.required}
                            >
                                <Slider
                                    value={props.value}
                                    onChange={props.onChange}
                                    onBlur={props.onBlur}
                                    onFocus={props.onFocus}
                                    name={props.name}
                                    marks={value.sliderMarks}
                                    step={value.step}
                                    min={value.min}
                                    max={value.max}
                                    p="sm"
                                    mb="sm"
                                />
                            </InputWrapper>
                        );
                    case "custom":
                        return value.handleCustomInput ? value.handleCustomInput(form) : null;
                    default:
                        return <TextInput key={key} {...props} />;
                }
            })}
            {previewContent && (
                <>
                    <Divider mt="auto" w="100%" />
                    {previewContent(form.values)}
                </>
            )}
            <Divider mt={!previewContent ? "auto" : undefined} w="100%" />
            {(method === "POST" || (method === "PATCH" && form.isDirty())) && buttons}
        </>
    );

    return (
        <Box w="100%" h="100%">
            <LoadingOverlay visible={loading} zIndex={1000} />
            <Modal title={`Confirm ${submitLabel}`} centered opened={opened} onClose={close}>
                {confirmContent(form.values)}
                <Group mt="auto" justify="end">
                    <Button onClick={close} variant="outline">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            if (!onSubmit || (onSubmit && onSubmit(form.values))) {
                                setNotificationId(
                                    notifications.show({
                                        message: `${method === "POST" ? "Creating" : "Updating"} ${
                                            submitLabel ? submitLabel.toLocaleLowerCase() : ""
                                        }`,
                                        loading: true,
                                        autoClose: false,
                                        withCloseButton: false,
                                    })
                                );

                                fetcher.submit(form.values, {
                                    action,
                                    method,
                                    encType: "application/json",
                                });
                                close();
                            }
                        }}
                    >
                        Confirm
                    </Button>
                </Group>
            </Modal>
            <Form
                form={form}
                ref={formRef}
                onSubmit={() => open()}
                onReset={form.onReset}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                {formContent}
            </Form>
        </Box>
    );
}
