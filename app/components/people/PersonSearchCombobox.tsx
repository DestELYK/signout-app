import { Divider, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { loader as peopleLoader } from "~/routes/people.list";
import { PersonWithTags } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";
import PersonForm from "../forms/PersonForm";
import QRInputField from "../QRInputField";
import PersonComboView from "./PersonComboView";

export interface PersonSearchComboboxProps {
    canCreate?: boolean;
    disabled?: boolean;
    submitOnSelect?: boolean;
    showCombobox?: boolean;
    autoFocus?: boolean;
    filterItems?: (items: PersonWithTags[]) => PersonWithTags[];
    disableItem?: (item: PersonWithTags) => boolean;
    onChange?: (value?: string) => void;
    onSubmit?: (result: PersonWithTags) => boolean;
}

export default function PersonSearchCombobox({
    canCreate = true,
    disabled = false,
    showCombobox = true,
    autoFocus = false,
    filterItems = (items) => items,
    disableItem,
    onChange,
    onSubmit,
}: PersonSearchComboboxProps) {
    const [search, setSearch] = useState<string>("");

    const searchPeopleFetcher = useTypedFetcher<typeof peopleLoader | undefined>();

    const [opened, { open, close }] = useDisclosure(false);

    const loading = searchPeopleFetcher.state === "loading";

    useEffect(() => {
        if (search.length > 0) {
            console.log("Searching for people with", search);
            searchPeopleFetcher.load(`/people/list?q=${search}&limit=-1`);
        } else {
            console.log("Clearing list of people", search);
            searchPeopleFetcher.load("");
        }
    }, [search]);

    return (
        <>
            <Modal opened={opened} onClose={close} title={"Create New Person"}>
                <PersonForm
                    type="create"
                    onResult={(data) => {
                        if (data.person) {
                            onSubmit?.(data.person);
                            close();
                        }
                    }}
                    initialValues={{
                        firstName: search.split(" ")[0] ?? "",
                        lastName: search.split(" ")[1] ?? "",
                    }}
                />
            </Modal>
            <QRInputField
                loading={loading}
                placeholder="Search for a person..."
                onChanged={(value) => {
                    setSearch(value);
                    onChange?.(value);
                    return true;
                }}
                onSelect={(value) => {
                    if (value) {
                        if (onSubmit?.(value)) {
                            setSearch(formatFullName(value));

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
                items={searchPeopleFetcher.data?.people}
                disableItem={disableItem}
                autoFocus={autoFocus}
                disabled={disabled}
                {...(canCreate && {
                    onCreateButton: () => {
                        open();
                        return true;
                    },
                })}
            >
                {(value) => (
                    <>
                        <PersonComboView
                            highlight={search.split(" ") || ""}
                            fullName={{ ...value }}
                            outStandingLoans={value._count.loans}
                            tags={value.tags}
                        />
                        <Divider mt="sm" />
                    </>
                )}
            </QRInputField>
        </>
    );
}
