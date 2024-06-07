import { Divider, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useTypedFetcher } from "remix-typedjson";
import { loader as itemsLoader } from "~/routes/items.list";
import { ItemWithTags } from "~/utils/types.server";
import { itemNameValidator, qrCodeValidator } from "~/utils/validators.client";
import SearchCombobox, { SearchFormValues } from "../base/SearchCombobox";
import CreateItemForm from "./CreateItemForm";
import ItemComboView from "./ItemComboView";

export interface ItemSearchComboboxProps {
  canCreate?: boolean;
  disabled?: boolean;
  submitOnSelect?: boolean;
  showCombobox?: boolean;
  autoFocus?: boolean;
  filterItems?: (items: ItemWithTags[]) => ItemWithTags[];
  disableItem?: (item: ItemWithTags) => boolean;
  onChange?: (search?: SearchFormValues) => void;
  onSubmit?: (item: ItemWithTags) => boolean;
}

export default function ItemSearchCombobox({
  canCreate = true,
  disabled = false,
  showCombobox = true,
  autoFocus,
  filterItems = (items) => items,
  disableItem,
  onChange,
  onSubmit,
}: ItemSearchComboboxProps) {
  const form = useForm<SearchFormValues>({
    clearInputErrorOnChange: true,
    validateInputOnBlur: true,
    validateInputOnChange: true,
    onValuesChange(values) {
      onChange?.(values);
    },
    initialValues: {
      qrCode: "",
      name: "",
    },
    validate: {
      qrCode: (value) => value && qrCodeValidator(value),
      name: (value) => value && itemNameValidator(value),
    },
  });

  const searchItemsFetcher = useTypedFetcher<typeof itemsLoader>();

  const [opened, { open, close }] = useDisclosure(false);

  const loading = searchItemsFetcher.state === "loading";

  const items =
    searchItemsFetcher &&
    searchItemsFetcher.data &&
    searchItemsFetcher.data.items &&
    filterItems
      ? filterItems(searchItemsFetcher.data.items).sort((a, b) => {
          const diff = a._count.loans - b._count.loans;

          return diff * 1000 + a.name.localeCompare(b.name);
        })
      : [];

  function search(search: SearchFormValues) {
    if (search && (search.name || search.qrCode)) {
      const searchParams = search.qrCode
        ? `qrCode=${search.qrCode}`
        : `q=${search.name}`;

      console.log("Searching for items with query: %s", searchParams);

      searchItemsFetcher.load(`/items/list?${searchParams}`);
    } else if (searchItemsFetcher.data) {
      searchItemsFetcher.data.items = [];
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title={"Create New Item"} centered>
        <CreateItemForm
          onSubmitted={(item) => {
            onSubmit?.(item);
            close();
          }}
          name={form.values.name}
          qrCode={form.values.qrCode}
        />
      </Modal>
      <SearchCombobox
        loading={loading}
        formData={{
          placeholder: {
            name: "Enter item name",
            qrCode: "Enter QR Code",
          },
        }}
        onQRCodeChanged={(value) => {
          console.log("QRCode updated with %s", value);

          form.setFieldValue("qrCode", value);

          if (form.isValid("qrCode")) {
            value.length >= 2
              ? search({ qrCode: value })
              : search({ qrCode: "" });
            return value.length !== 0;
          } else {
            return false;
          }
        }}
        onNameChanged={(value) => {
          console.log("Name updated with %s", value);

          form.setFieldValue("name", value);

          if (form.isValid("name")) {
            value.length >= 2 ? search({ name: value }) : search({ name: "" });
            return value.length !== 0;
          } else {
            return false;
          }
        }}
        onSubmit={(value) => {
          console.log("Item Search Submit Handle: %s", JSON.stringify(value));

          if (value) {
            if (onSubmit?.(value)) {
              form.setValues({
                name: value.name,
                qrCode: value.qrCode || "",
              });

              return true;
            }

            return false;
          } else {
            console.warn("Value is undefined");
          }
        }}
        {...(canCreate && {
          onCreateButton: () => {
            open();
            return true;
          },
        })}
        items={items}
        disableItem={disableItem}
        value={form.values}
        errors={form.errors}
        autoFocus={autoFocus}
        disabled={disabled}
        showCombobox={showCombobox}
      >
        {(value) => (
          <>
            <ItemComboView
              highlight={form.values.name?.split(" ") || ""}
              name={value.name}
              outstanding={value._count.loans > 0}
              tags={value.tags}
            />
            <Divider mt="sm" />
          </>
        )}
      </SearchCombobox>
    </>
  );
}
