/**
 * ItemForm Component
 *
 * A form component for creating and editing items in the
 * signout system. Handles item details, type selection, location assignment,
 * and tag associations with proper validation.
 *
 *
 * @module ItemForm
 *
 * @author Kyle Dunn
 */

import { zodResolver } from "@mantine/form";
import { useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { ItemFormSchema, ItemFormType } from "~/lib/schemas";
import { loader as typeLoader } from "~/routes/items.types";
import { loader as locationLoader } from "~/routes/locations";
import { STATUS_OPTIONS } from "~/utils/consts";
import { ItemData, LocationData as ItemLocationData, ItemTypeData } from "~/utils/types.server";
import FetcherField from "../base/FetcherField";
import FormView, { FormViewProps } from "../base/FormView";
import ComboView from "../ComboView";
import ItemTypeForm from "./ItemTypeForm";
import LocationForm from "./LocationForm";

/**
 * Props for the ItemForm component
 */
export type ItemFormProps = {
  /** Optional item ID for edit mode */
  id?: number;
  /** Form mode - create or edit */
  type?: "create" | "edit";
} & Omit<
  FormViewProps<ItemFormType, ItemData>,
  "fetcher" | "method" | "action" | "inputData" | "submitLabel"
>;

/**
 * A comprehensive form component for item creation and editing
 * Handles all item properties including type, location, and tags
 *
 * @param props - The component props
 * @returns The rendered item form component
 */
export default function ItemForm({
  id,
  type = "create",
  initialValues,
  disabled,
  validateInputOnBlur,
  validateInputOnChange,
  onSubmit,
  onResult,
}: ItemFormProps) {
  const typeFetcher = useTypedFetcher<typeof typeLoader>();
  const locationFetcher = useTypedFetcher<typeof locationLoader>();
  const [itemType, setItemType] = useState<string>(initialValues.type?.name ?? "");
  const [itemLocation, setItemLocation] = useState<string>(initialValues.location?.name ?? "");

  /** Configure form action and method based on create/edit mode */
  let action = "/items";
  let method: "POST" | "PATCH" = type === "create" ? "POST" : "PATCH";

  if (id) {
    type = "edit";
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
        submitLabel="Item"
        onResult={onResult}
        onSubmit={(values) => {
          console.log("Values: ", values);
          onSubmit?.(values);

          return true;
        }}
        confirmContent={(values) => {
          return `Are you sure you want to ${type} this item?`;
        }}
        validator={zodResolver(ItemFormSchema)}
        inputData={{
          name: {
            type: "text",
            description: "The name of the item",
            required: true,
          },
          type: {
            type: "custom",
            handleCustomInput: (form) => {
              return (
                <FetcherField
                  label="Item Type"
                  description="Select the item type"
                  placeholder="Search for item type"
                  fetchPath="/items/types"
                  createTitle="Create New Item Type"
                  fetcher={typeFetcher}
                  required
                  error={form.errors.type}
                  value={itemType}
                  onBlur={() => {
                    setItemType(form.values.type?.name ?? "");

                    return true;
                  }}
                  onFocus={() => {
                    form.clearFieldError("type");

                    return true;
                  }}
                  onChange={(value) => {
                    setItemType(value);

                    return true;
                  }}
                  onClear={() => {
                    setItemType("");
                    form.setFieldValue("type", {} as ItemTypeData);
                  }}
                  onFetched={(fetchedData) => fetchedData?.data ?? []}
                  withQRCode={false}
                  onSelect={(selected, value) => {
                    if (value) {
                      setItemType(value.name);
                      form.setFieldValue("type", value);

                      return true;
                    }
                  }}
                  handleCreateForm={(close) => {
                    return (
                      <ItemTypeForm
                        initialValues={{
                          name: itemType,
                          description: "",
                        }}
                        onResult={(result) => {
                          if (result.data) {
                            console.log("Result: ", result);
                            setItemType(result.data.name);
                            form.setFieldValue("type", result.data);

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
              );
            },
          },
          location: {
            type: "custom",
            handleCustomInput: (form) => {
              return (
                <FetcherField
                  label="Item Location"
                  description="Select the item's location"
                  placeholder="Search for item location"
                  fetchPath="/locations"
                  createTitle="Create New Item Location"
                  fetcher={locationFetcher}
                  required
                  error={form.errors.location}
                  value={itemLocation}
                  onBlur={() => {
                    setItemLocation(form.values.location?.name ?? "");

                    return true;
                  }}
                  onFocus={() => {
                    form.clearFieldError("location");

                    return true;
                  }}
                  onChange={(value) => {
                    setItemLocation(value);

                    return true;
                  }}
                  onClear={() => {
                    setItemLocation("");
                    form.setFieldValue("location", {} as ItemLocationData);
                  }}
                  onFetched={(fetchedData) => fetchedData?.data ?? []}
                  withQRCode={false}
                  onSelect={(selected, value) => {
                    if (value) {
                      setItemLocation(value.name);
                      form.setFieldValue("location", value);

                      return true;
                    }
                  }}
                  handleCreateForm={(close) => {
                    return (
                      <LocationForm
                        initialValues={{
                          name: itemLocation,
                        }}
                        onResult={(result) => {
                          if (result.data) {
                            console.log("Result: ", result);
                            setItemLocation(result.data.name);
                            form.setFieldValue("location", result.data);

                            close();
                          }
                        }}
                      />
                    );
                  }}
                >
                  {(value, query) => <ComboView title={value.name} highlight={query ?? ""} />}
                </FetcherField>
              );
            },
          },
          status:
            type === "edit" && initialValues.status !== "out"
              ? {
                  type: "select",
                  description: "Select the status of the item",
                  options: STATUS_OPTIONS.filter((s) => s.id !== "out").map((status) => ({
                    value: status.id,
                    label: status.name,
                  })),
                  required: true,
                }
              : undefined,
          description: {
            type: "text",
            description: "A short description of the item (optional)",
          },
          notes:
            type === "create"
              ? {
                  type: "textarea",
                  description: "Additional notes about the item (optional)",
                }
              : undefined,
          tags: {
            type: "tags",
            description: "Add tags to the item (optional)",
            lockCategory: false,
          },
        }}
      />
    </>
  );
}
