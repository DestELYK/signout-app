/**
 * FormView Component
 *
 * A form component that provides consistent form layouts
 * and field handling throughout the application. Supports various input
 * types, validation, and form submission patterns.
 *
 *
 * @module FormView
 *
 * @author Kyle Dunn
 */

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
    Textarea,
    TextInput,
    Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { upperFirst, useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useNavigation } from "@remix-run/react";
import { IconArrowBackUp, IconArrowRight, IconPlus } from "@tabler/icons-react";
import { FormErrors, UseFormReturnType } from "node_modules/@mantine/form/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { UseDataFunctionReturn } from "remix-typedjson";
import { useFetcherWithErrorHandler } from "~/lib/hooks";
import { DataReturn } from "~/utils/types.server";
import TagCombobox from "../tags/TagCombobox";
import QRInputField from "./QRInputField";

type InputData<T> = {
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
    | "qrcode"
    | "custom";
  label?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  sliderMarks?: { value: number; label: string }[];
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
  min?: number;
  max?: number;
  step?: number;
  category?: string;
  lockCategory?: boolean;
  groupId?: number;
  handleCustomInput?: (form: UseFormReturnType<T>) => React.ReactNode;
};

type FormInputData<T> = {
  [key in keyof T]?: InputData<T>;
};

type FormData<T> = Omit<T, "id" | "createdDate" | "updatedDate">;

export interface FormViewProps<T, R> {
  initialValues: Partial<FormData<T>>;
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
  onResult?: (data: UseDataFunctionReturn<DataReturn<R>>) => void;
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
  confirmContent = () => "Are you sure you want to submit this form?",
  previewContent,
  onSubmit,
  onResult,
}: FormViewProps<T, R>) {
  const navigation = useNavigation();
  const [opened, { open, close }] = useDisclosure();
  const formRef = useRef<HTMLFormElement>(null);
  const [notificationId, setNotificationId] = useState<string>();

  const form = useForm<FormData<T>>({
    mode: "controlled",
    clearInputErrorOnChange: true,
    validateInputOnBlur,
    validateInputOnChange,
    initialValues: initialValues as FormData<T>,
    validate: validator,
  });

  const fetcher = useFetcherWithErrorHandler<DataReturn<R>>(
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
      notifications.update({
        id: notificationId,
        message: `Failed to ${method === "POST" ? "create" : "update"} ${
          submitLabel ? submitLabel.toLocaleLowerCase() : ""
        }`,
        color: "red",
        loading: false,
        autoClose: 5000,
        withCloseButton: true,
      });
    }
  );

  useEffect(() => {
    if (errors) {
      form.setErrors(errors);
    }
  }, [form, errors]);

  const loading = navigation.state !== "idle";

  const groupedInputs: {
    [row: string]: { key: string; value: InputData<FormData<T>> }[];
  } = {};

  Object.entries(inputData).forEach(([key, value], index) => {
    if (value) {
      if (value.groupId) {
        if (!groupedInputs[value.groupId]) {
          groupedInputs[value.groupId] = [];
        }

        groupedInputs[value.groupId].push({ key, value });
      } else {
        if (!groupedInputs["none"]) {
          groupedInputs["none"] = [];
        }

        groupedInputs["none"].push({ key, value });
      }
    }
  });

  function createInputField(key: string, value: InputData<FormData<T>>, index: number) {
    const props = {
      ...(index === 0 && { "data-autofocus": true }),
      name: key,
      label:
        value.label ??
        key
          .split(/(?=[A-Z])/)
          .map((s) => upperFirst(s))
          .join(" "),
      description: value.description,
      autoComplete: value.autoComplete,
      placeholder: value.placeholder,
      required: value.required,
      disabled: disabled || value.disabled || loading,
      ...form.getInputProps(key),
    };

    switch (value.type) {
      case "qrcode":
        return (
          <QRInputField
            key={key}
            loading={loading}
            value={props.value}
            onClear={() => props.onChange("")}
            onScan={(result) => props.onChange(result?.data ?? "")}
            {...props}
          />
        );
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
        return (
          <TagCombobox
            category={value.category ?? ""}
            key={key}
            disabled={props.disabled}
            error={props.error}
            limit={value.max}
            required={props.required}
            value={props.value}
            lockCategory={value.lockCategory}
            onTagsChange={props.onChange}
          />
        );
      case "checkbox":
        return <Checkbox key={key} {...props} type="checkbox" checked={form.values[key]} />;
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
        return (
          <Box key={key}>
            {value.handleCustomInput !== undefined && value.handleCustomInput(form)}
          </Box>
        );
      default:
        return <TextInput key={key} {...props} />;
    }
  }

  const buttons = (
    <Group justify="end">
      <Tooltip label="Reset form" position="left">
        <ActionIcon
          variant="outline"
          size="input-sm"
          color="red"
          onClick={() => {
            form.reset();
          }}
        >
          <IconArrowBackUp />
        </ActionIcon>
      </Tooltip>
      <Button
        rightSection={method === "POST" ? <IconPlus /> : <IconArrowRight />}
        onClick={(event) => {
          if (!onSubmit || (onSubmit && onSubmit(form.values))) {
            if (confirmContent !== undefined) {
              open();
            } else {
              submit();
            }
          }
        }}
      >
        {method === "POST" ? "Create" : "Update"}
        {submitLabel ? ` ${submitLabel}` : ""}
      </Button>
    </Group>
  );

  const formContent = (
    <>
      {Object.entries(groupedInputs).map(([row, value], index) => {
        if (row !== "none") {
          return (
            <Group key={row} align="start" grow>
              {value.map(({ key, value }, index) => {
                if (value) {
                  return createInputField(key, value, index);
                }
              })}
            </Group>
          );
        } else {
          return value.map(({ key, value }, index) => {
            if (value) {
              return createInputField(key, value, index);
            }
          });
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

  function submit() {
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
              submit();
            }}
          >
            Confirm
          </Button>
        </Group>
      </Modal>
      <form
        ref={formRef}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {formContent}
      </form>
    </Box>
  );
}
