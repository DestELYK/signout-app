/**
 * PersonPicker Component
 *
 * A person picker component for selecting people in forms
 * and workflows within the signout system. Provides person search,
 * selection, and management with outstanding loan warnings.
 *
 *
 * @module PersonPicker
 *
 * @author Kyle Dunn
 */

import {
  ActionIcon,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { loader as itemsLoader } from "~/routes/items.list";
import { loader as peopleLoader } from "~/routes/people.list";
import { ItemData, PersonData } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";
import FetcherField from "../base/FetcherField";
import { QRInputFieldProps } from "../base/QRInputField";
import ComboView from "../ComboView";
import PersonForm from "../forms/PersonForm";
import HoverBadge from "../HoverBadge";

/**
 * Props for the PersonPicker component
 */
export interface PersonPickerProps
  extends Pick<QRInputFieldProps<PersonData>, "error" | "withQRCode"> {
  /** Currently selected person */
  value?: PersonData;
  /** Whether to show outstanding item warnings */
  promptOutstanding?: boolean;
  /** Callback fired when person selection changes */
  onChange?: (person?: PersonData) => void;
}

/**
 * A comprehensive person picker component with outstanding loan warnings
 * Handles person search, selection, and management with rich feedback
 *
 * @param props - The component props
 * @returns The rendered person picker component
 */
export default function PersonPicker({
  value,
  promptOutstanding = true,
  withQRCode,
  error,
  onChange,
}: PersonPickerProps) {
  // Fetchers for loading data from the server
  const outstandingItemsFetcher = useTypedFetcher<typeof itemsLoader>();
  const personFetcher = useTypedFetcher<typeof peopleLoader>();

  const [search, setSearch] = useState<string>("");

  const [outstandingPerson, setOutstandingPerson] = useState<PersonData | undefined>();
  const [outstandingItems, setOutstandingItems] = useState<ItemData[]>();

  const [opened, { open, close }] = useDisclosure();

  useEffect(() => {
    if (outstandingItemsFetcher.data) {
      setOutstandingItems(outstandingItemsFetcher.data.items ?? []);
    }
  }, [outstandingItemsFetcher.data, outstandingItemsFetcher.state]);

  function confirmOutstanding(person: PersonData) {
    const hasOutstandingItems =
      (person.outstandingItemsCount && person.outstandingItemsCount > 0) ||
      (person.lostItemsCount && person.lostItemsCount > 0);

    if (hasOutstandingItems && promptOutstanding) {
      setOutstandingPerson(person);
      open();
    } else {
      setOutstandingPerson(undefined);
      close();

      onChange?.(person);
    }
  }

  return (
    <>
      {outstandingPerson && (
        <Modal
          title="Warning"
          opened={opened}
          centered
          onClose={() => {
            close();
            setOutstandingItems([]);
            setOutstandingPerson(undefined);
          }}
        >
          <LoadingOverlay visible={outstandingItemsFetcher.state !== "idle"} zIndex={1000} />

          <Stack>
            <Text>
              Are you sure you want to create a new loan for <b>{outstandingPerson.firstName}?</b>
            </Text>
            <Text>
              They have{" "}
              <Text span c="red">
                {outstandingPerson.outstandingItemsCount}
              </Text>{" "}
              outstanding items and{" "}
              <Text span c="red">
                {outstandingPerson.lostItemsCount}
              </Text>{" "}
              lost items
            </Text>
            {/* {outstandingItems && outstandingItems.length > 0 && (
                            <Paper withBorder p="sm">
                                {outstandingItems.map((item) => (
                                    <Group justify="space-between">
                                        <Stack gap={0}>
                                            <Text key={item.id}>{item.name}</Text>
                                            <HoverBadge
                                                name={item.type?.name ?? "Unknown"}
                                                description={item.type?.description}
                                            />
                                        </Stack>
                                        <Text c={item.status?.color}>{item.status?.name}</Text>
                                    </Group>
                                ))}
                            </Paper>
                        )} */}
            <Group justify="end">
              <Button color="gray" variant="outline" onClick={close}>
                Cancel
              </Button>
              {/* <Button
                                color="blue"
                                variant="outline"
                                onClick={() => {
                                    outstandingItemsFetcher.load(
                                        `/items/list?status=out&status=lost&personId=${outstandingPerson.id}`
                                    );
                                }}
                            >
                                View Items
                            </Button> */}
              <Button
                color="red"
                onClick={() => {
                  onChange?.(outstandingPerson);

                  setOutstandingItems([]);
                  setOutstandingPerson(undefined);
                  close();
                }}
              >
                Confirm
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}
      {value ? (
        <Group justify="space-between">
          <Stack gap={0}>
            <Text size="lg" fw="bold">
              {formatFullName(value)}
            </Text>
            <HoverBadge
              name={value.role?.name ?? "Unknown"}
              description={value.role?.description}
            />
          </Stack>
          <Tooltip label="Modify Person">
            <ActionIcon
              style={{ justifySelf: "end" }}
              size="input-sm"
              variant="outline"
              color="red"
              onClick={() => {
                onChange?.(undefined);
              }}
            >
              <IconEdit />
            </ActionIcon>
          </Tooltip>
        </Group>
      ) : (
        <FetcherField
          label="Person"
          description="Search for person by name"
          placeholder="Search for person..."
          fetchPath="/people/list"
          createTitle="Create New Person"
          fetcher={personFetcher}
          required
          error={error}
          onFetched={(fetchData) => fetchData?.data ?? []}
          withQRCode={withQRCode}
          onChange={setSearch}
          value={search}
          onClear={() => setSearch("")}
          onBlur={() => {
            setSearch("");
            return true;
          }}
          onFocus={() => {
            setSearch("");
            return false;
          }}
          onSelect={(selected, value) => {
            if (value) {
              confirmOutstanding(value);

              return true;
            }
          }}
          handleCreateForm={(close) => {
            return (
              <PersonForm
                initialValues={{
                  firstName: search.split(" ")[0],
                  lastName: search.split(" ")[1],
                  nickname: "",
                }}
                onResult={(result) => {
                  if (result.data) {
                    onChange?.(result.data);
                    close();
                  }
                }}
              />
            );
          }}
        >
          {(value, query) => (
            <ComboView
              title={formatFullName(value)}
              caption={
                (value.outstandingItemsCount && value.outstandingItemsCount > 0) ||
                (value.lostItemsCount && value.lostItemsCount > 0)
                  ? "Has outstanding items"
                  : undefined
              }
              highlight={query ?? ""}
            />
          )}
        </FetcherField>
      )}
    </>
  );
}
