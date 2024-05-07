import { Divider, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useTypedFetcher } from "remix-typedjson";
import { loader as peopleLoader } from "~/routes/people";
import { PersonWithTags } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";
import {
  personNameValidator,
  qrCodeValidator,
} from "~/utils/validators.client";
import SearchCombobox, { SearchFormValues } from "../base/SearchCombobox";
import CreatePersonForm from "./CreatePersonForm";
import PersonComboView from "./PersonComboView";

export interface PersonSearchComboboxProps {
  canCreate?: boolean;
  disabled?: boolean;
  submitOnSelect?: boolean;
  showCombobox?: boolean;
  autoFocus?: boolean;
  filterItems?: (items: PersonWithTags[]) => PersonWithTags[];
  disableItem?: (item: PersonWithTags) => boolean;
  onChange?: (search?: SearchFormValues) => void;
  onSubmit?: (result: PersonWithTags) => boolean;
}

export default function PersonSearchCombobox({
  canCreate = true,
  disabled = false,
  showCombobox = true,
  autoFocus,
  filterItems = (items) => items,
  disableItem,
  onChange,
  onSubmit,
}: PersonSearchComboboxProps) {
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
      qrCode: (value) => value && qrCodeValidator(value),
      name: (value) => value && personNameValidator(value),
    },
  });

  const searchPeopleFetcher = useTypedFetcher<typeof peopleLoader>();

  const [opened, { open, close }] = useDisclosure(false);

  const loading = searchPeopleFetcher.state === "loading";

  const people =
    searchPeopleFetcher &&
    searchPeopleFetcher.data &&
    searchPeopleFetcher.data.people
      ? filterItems
        ? filterItems(searchPeopleFetcher.data.people)
        : searchPeopleFetcher.data.people
      : [];

  function search(search: SearchFormValues) {
    if (search && (search.name || search.qrCode)) {
      const searchParams = search.qrCode
        ? `qrCode=${search.qrCode}`
        : `query=${search.name}`;

      console.log("Searching for people with query: %s", searchParams);

      searchPeopleFetcher.load(`/people?${searchParams}`);
    } else {
      searchPeopleFetcher.data.people = [];
    }
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title={"Create New Person"}>
        <CreatePersonForm
          onSubmitted={(person) => {
            onSubmit?.(person);
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
            name: "Enter person's name",
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
            if (onSubmit?.(value)) {
              form.setValues({
                name: formatFullName(value),
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
        items={people}
        disableItem={disableItem}
        value={form.values}
        errors={form.errors}
        autoFocus={autoFocus}
        disabled={disabled}
        showCombobox={showCombobox}
      >
        {(value) => (
          <>
            <PersonComboView
              highlight={form.values.name?.split(" ") || ""}
              fullName={{ ...value }}
              outStandingLoans={value._count.loans}
              tags={value.tags}
            />
            <Divider mt="sm" />
          </>
        )}
      </SearchCombobox>
    </>
  );
}
