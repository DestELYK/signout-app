import { Divider, Modal } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useEffect } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { loader as peopleLoader } from "~/routes/people";
import { loader as personLoader } from "~/routes/people.$personId";
import { PersonFindMany, PersonFindOne } from "~/utils/types.server";
import { fullName } from "~/utils/utils";
import { alphaValidator, qrCodeValidator } from "~/utils/validators.client";
import SearchCombobox, { SearchFormValues } from "../SearchCombobox";
import CreatePersonForm from "./CreatePersonForm";
import PersonComboView from "./PersonComboView";

export interface SearchPersonFormProps {
  canCreate?: boolean;
  disabled?: boolean;
  submitOnSelect?: boolean;
  showCombobox?: boolean;
  autoFocus?: boolean;
  filterItems?: (items: PersonFindMany[]) => PersonFindMany[];
  disableItem?: (item: PersonFindMany) => boolean;
  onChange?: (search?: SearchFormValues) => void;
  onSubmit?: (result: PersonFindMany) => boolean;
  onResult?: (result?: PersonFindOne) => void;
}

export default function SearchPersonForm({
  canCreate = true,
  disabled = false,
  showCombobox = true,
  autoFocus,
  filterItems = (items) => items,
  disableItem,
  onChange,
  onResult,
  onSubmit,
}: SearchPersonFormProps) {
  const form = useForm<SearchFormValues>({
    clearInputErrorOnChange: true,
    validateInputOnChange: true,
    onValuesChange(values, previous) {
      onChange?.(values);
    },
    initialValues: {
      qrCode: "",
      name: "",
    },
    validate: {
      qrCode: (value, values) => {
        return qrCodeValidator(value);
      },
      name: (value, values) => {
        return alphaValidator(value);
      },
    },
  });

  const searchPeopleFetcher = useTypedFetcher<typeof peopleLoader>();
  const personFetcher = useTypedFetcher<typeof personLoader>();

  const [opened, { open, close }] = useDisclosure(false);

  const people =
    searchPeopleFetcher &&
    searchPeopleFetcher.data &&
    searchPeopleFetcher.data instanceof Array
      ? filterItems(searchPeopleFetcher.data)
      : [];

  useEffect(() => {
    if (personFetcher.data) {
      form.setValues({
        name: fullName(personFetcher.data),
        qrCode: personFetcher.data.qrCode || undefined,
      });

      search(form.values);
    }

    onResult?.(personFetcher.data);
  }, [personFetcher.data]);

  function search(search: SearchFormValues) {
    if (search && (search.name || search.qrCode)) {
      const searchParams = search.qrCode
        ? `qrCode=${search.qrCode}`
        : `query=${search.name}`;

      console.log("Searching for people with query: %s", searchParams);

      searchPeopleFetcher.load(`/people?${searchParams}`);
    } else {
      searchPeopleFetcher.data = [];
    }
  }

  function submit(value: { id: number }) {
    console.log("Submitting person %s", JSON.stringify(value));
    personFetcher.load(`/people/${value.id}`);
  }

  return (
    <>
      <Modal opened={opened} onClose={close} title={"Create New Person"}>
        <CreatePersonForm
          onSubmitted={(person) => {
            submit(person);
            close();
          }}
          name={form.values.name}
          qrCode={form.values.qrCode}
        />
      </Modal>
      <SearchCombobox
        formData={{
          placeholder: {
            name: "Enter person's name",
            qrCode: "Enter QR Code",
          },
          submitIcon: <IconSearch />,
        }}
        onQRCodeChanged={(value) => {
          console.log("QRCode updated with %s", value);
          form.setFieldValue("qrCode", value);
          form.isValid("qrCode") && value.length >= 2
            ? search({ qrCode: value })
            : search({qrCode: ''});

          return value.length !== 0;
        }}
        onNameChanged={(value) => {
          console.log("Name updated with %s", value);
          form.setFieldValue("name", value);
          form.isValid("name") && value.length >= 2
            ? search({ name: value })
            : search({name: ''});

          return value.length !== 0;
        }}
        onSubmit={(value) => {
          if (value) {
            form.setValues({
              name: fullName(value),
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
              highlight={form.values.name || ""}
              person={value}
            />
            <Divider mt="sm" />
          </>
        )}
      </SearchCombobox>
    </>
  );
}
