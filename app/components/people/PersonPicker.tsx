import { ActionIcon, Button, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { Link } from "@remix-run/react";
import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { PersonWithTags } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";
import PersonInfoView from "./PersonInfoView";
import SearchPersonForm from "./SearchPersonForm";

type PersonPickerType = Omit<
  PersonWithTags,
  "notes" | "_count" | "createdDate" | "updatedDate"
>;

export interface PersonPickerProps {
  value?: PersonPickerType;
  promptOutstanding?: boolean;
  onChanged?: (person?: PersonWithTags) => void;
}

export default function PersonPicker({ value, onChanged }: PersonPickerProps) {
  const [person, setPerson] = useState(value || undefined);

  useEffect(() => {
    setPerson(value);
  }, [value]);

  function updatePerson(value?: PersonWithTags) {
    setPerson(value);
    onChanged?.(value);
  }

  function confirmOutstanding(person: PersonWithTags) {
    const outstandingLoans = person._count.loans;

    if (outstandingLoans > 0) {
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
    <PersonInfoView
      personId={person.id}
      qrCode={person.qrCode}
      firstName={person.firstName}
      lastName={person.lastName}
      nickname={person.nickname}
      tags={person.tags}
      rightSection={
        <ActionIcon
          style={{ justifySelf: "end" }}
          size="sm"
          color="red"
          onClick={() => {
            updatePerson(undefined);
          }}
        >
          <IconEdit />
        </ActionIcon>
      }
    />
  ) : (
    <SearchPersonForm
      onSubmit={(value) => {
        value && confirmOutstanding(value);
        return false;
      }}
    />
  );
}
