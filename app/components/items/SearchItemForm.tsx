import { Divider, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { loader as itemsLoader } from "~/routes/items";
import { loader as itemLoader } from "~/routes/items.$itemId";
import { ItemFindMany, ItemFindOne } from "~/utils/types.server";
import { itemNameValidator, qrCodeValidator } from "~/utils/validators.client";
import SearchCombobox, { SearchFormValues } from "../SearchCombobox";
import CreateItemForm from "./CreateItemForm";
import ItemComboView from "./ItemComboView";

export interface SearchItemFormProps {
  canCreate?: boolean;
  disabled?: boolean;
  submitOnSelect?: boolean;
  showCombobox?: boolean;
  autoFocus?: boolean;
  filterItems?: (items: ItemFindMany[]) => ItemFindMany[];
  disableItem?: (item: ItemFindMany) => boolean;
  onChange?: (search?: SearchFormValues) => void;
  onSubmit?: (result: ItemFindMany) => boolean;
  onResult?: (result?: ItemFindOne) => void;
}

export default function SearchItemForm({
  canCreate = true,
  disabled = false,
  showCombobox = true,
  autoFocus,
  filterItems = (items) => items,
  disableItem,
  onChange,
  onResult,
  onSubmit,
}: SearchItemFormProps) {
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
  const itemFetcher = useTypedFetcher<typeof itemLoader>();

  const [opened, { open, close }] = useDisclosure(false);

  const loading = searchItemsFetcher.state === "loading";

  const items =
    searchItemsFetcher &&
    searchItemsFetcher.data &&
    searchItemsFetcher.data instanceof Array
      ? filterItems(searchItemsFetcher.data).sort((a, b) => {
          const diff = a._count.loans - b._count.loans;

          return (diff * 1000) + a.name.localeCompare(b.name);
        })
      : [];

  useEffect(() => {
    if (itemFetcher.data) {
      form.setValues({
        name: itemFetcher.data.name,
        qrCode: itemFetcher.data.qrCode || undefined,
      });

      search(form.values);

      onResult?.(itemFetcher.data);
    }
  }, [itemFetcher.data]);

  function search(search: SearchFormValues) {
    if (search && (search.name || search.qrCode)) {
      const searchParams = search.qrCode
        ? `qrCode=${search.qrCode}`
        : `query=${search.name}`;

      console.log("Searching for items with query: %s", searchParams);

      searchItemsFetcher.load(`/items?${searchParams}`);
    } else {
      searchItemsFetcher.data = [];
    }
  }

  function submit(value: { id: number }) {
    console.log("Submitting item %s", JSON.stringify(value));
    itemFetcher.load(`/items/${value.id}`);
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title={"Create New Item"}>
        <CreateItemForm
          onSubmitted={(item) => {
            submit(item);
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
          if (value) {
            form.setValues({
              name: value.name,
              qrCode: value.qrCode || undefined,
            });

            if (!onSubmit || onSubmit(value)) submit(value);
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
            <ItemComboView highlight={form.values.name || ""} item={value} />
            <Divider mt="sm" />
          </>
        )}
      </SearchCombobox>
    </>
  );
}
