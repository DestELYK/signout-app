import {
  ActionIcon,
  Button,
  MantineSpacing,
  Stack,
  StyleProp,
  Text,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { Link } from "@remix-run/react";
import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { PersonWithTags } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";
import PersonCard from "./PersonCard";
import PersonSearchCombobox from "./PersonSearchCombobox";

type PersonPickerType = Omit<
  PersonWithTags,
  "_count" | "createdDate" | "updatedDate" | "loans"
>;

export interface PersonPickerProps {
  value?: PersonPickerType;
  promptOutstanding?: boolean;
  withBorder?: boolean;
  p?: StyleProp<MantineSpacing>;
  onChanged?: (person?: PersonWithTags) => void;
}

export default function PersonPicker({
  value,
  promptOutstanding = true,
  withBorder = false,
  p = 0,
  onChanged,
}: PersonPickerProps) {
  const [person, setPerson] = useState<PersonPickerType | undefined>(
    value || undefined
  );

  useEffect(() => {
    setPerson(value);
  }, [value]);

  function updatePerson(value?: PersonWithTags) {
    setPerson(value);
    onChanged?.(value);
  }

  function confirmOutstanding(person: PersonWithTags) {
    const outstandingLoans = person._count.loans;

    if (outstandingLoans > 0 && promptOutstanding) {
      modals.openConfirmModal({
        title: "Person has Outstanding Loans!",
        children: (
          <Stack>
            <Text c="red">
              {formatFullName(person)} already has {outstandingLoans} loans out!
            </Text>
            <Button
              variant="subtle"
              component={Link}
              to={`/people/${person.id}/loans`}
              onClick={() => modals.closeAll()}
            >
              View Loans
            </Button>
            <Text>
              Are you sure you want to create a new loan for {person.firstName}?
            </Text>
          </Stack>
        ),
        labels: {
          confirm: "Yes",
          cancel: "No",
        },
        onConfirm: () => {
          updatePerson(person);
        },
        onCancel: () => {
          updatePerson(undefined);
        },
      });
    } else {
      updatePerson(person);
    }
  }

  return person ? (
    <PersonCard
      qrCode={person.qrCode}
      firstName={person.firstName}
      lastName={person.lastName}
      nickname={person.nickname}
      notes={person.notes}
      tags={person.tags}
      rightSection={
        <ActionIcon
          style={{ justifySelf: "end" }}
          size="input-sm"
          variant="outline"
          color="red"
          onClick={() => {
            updatePerson(undefined);
          }}
        >
          <IconEdit />
        </ActionIcon>
      }
      withBorder={withBorder}
      withDetails={false}
      p={p}
    />
  ) : (
    <PersonSearchCombobox
      onSubmit={(value) => {
        value && confirmOutstanding(value);
        return false;
      }}
    />
  );
}
