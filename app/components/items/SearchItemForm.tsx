import { Divider, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useEffect } from "react";
import { isMobile } from "react-device-detect";
import { useTypedFetcher } from "remix-typedjson";
import { loader as itemsLoader } from "~/routes/items";
import { loader as itemLoader } from "~/routes/items.$itemId";
import { ItemFindMany, ItemFindOne } from "~/utils/types.server";
import { qrCodeValidator, specialValidator } from "~/utils/validators.client";
import SearchCombobox, { SearchFormValues } from "../SearchCombobox";
import CreateItemForm from "./CreateItemForm";
import ItemComboView from "./ItemComboView";

export interface SearchItemFormProps {
  canCreate?: boolean;
  disabled?: boolean;
  submitOnSelect?: boolean;
  showCombobox?: boolean;
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
  filterItems = (items) => items,
  disableItem,
  onChange,
  onResult,
  onSubmit,
}: SearchItemFormProps) {
  const form = useForm<SearchFormValues>({
    clearInputErrorOnChange: true,
    validateInputOnChange: true,
    validateInputOnBlur: true,
    onValuesChange(values, previous) {
      onChange?.(values);
    },
    initialValues: {
      qrCode: "",
      name: "",
    },
    validate: {
      qrCode: (value, values) => {
        if (values.name?.length === 0 && values.qrCode?.length === 0) {
          return "Both field cannot be empty";
        } else {
          return qrCodeValidator(value);
        }
      },
      name: (value, values) => {
        if (values.name?.length === 0 && values.qrCode?.length === 0) {
          return "Both field cannot be empty";
        } else {
          return specialValidator(value);
        }
      },
    },
  });

  const searchItemsFetcher = useTypedFetcher<typeof itemsLoader>();
  const itemFetcher = useTypedFetcher<typeof itemLoader>();

  const [opened, { open, close }] = useDisclosure(false);

  const items =
    searchItemsFetcher && searchItemsFetcher.data
      ? filterItems(searchItemsFetcher.data)
      : [];

  useEffect(() => {
    if (itemFetcher.data) {
      form.setValues({
        name: itemFetcher.data.name,
        qrCode: itemFetcher.data.qrCode || undefined,
      });

      search(form.values);
    }

    onResult?.(itemFetcher.data);
  }, [itemFetcher.data]);

  function search(search: SearchFormValues) {
    if (search && (search.name || search.qrCode)) {
      const searchParams = search.qrCode
        ? `qrCode=${search.qrCode}`
        : `query=${search.name}`;

      console.log("Searching for items with query: %s", searchParams);

      searchItemsFetcher.load(`/items?${searchParams}`);
    } else {
      searchItemsFetcher.load("");
    }
  }

  function submit(value: { id: number }) {
    console.log("Submitting person %s", JSON.stringify(value));
    itemFetcher.load(`/items/${value.id}`);
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title={"Create New Item"}>
        <CreateItemForm
          onSubmitted={(item) => {
            form.setValues({
              name: item.name,
              qrCode: item.qrCode || undefined,
            });
            close();
          }}
          name={form.values.name}
          qrCode={form.values.qrCode}
        />
      </Modal>
      <SearchCombobox
        formData={{
          placeholder: {
            name: "Enter item name",
            qrCode: "Enter QR Code",
          },
          submitIcon: <IconSearch />,
        }}
        qrDisabled={!isMobile}
        onQRCodeChanged={(value) => {
          form.setFieldValue("qrCode", value);
          !form.validate().hasErrors ? search({ qrCode: value }) : search({});

          return value.length !== 0;
        }}
        onNameChanged={(value) => {
          form.setFieldValue("name", value);
          !form.validate().hasErrors ? search({ name: value }) : search({});

          return value.length !== 0;
        }}
        onSelectedItem={(value) => {
          const result = searchItemsFetcher.data.find(
            (p) => p.id.toString() === value
          );

          if (result) {
            form.setValues({
              name: result.name,
              qrCode: result.qrCode || undefined,
            });
          }
        }}
        onSubmit={(value) => {
          if (value) {
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
