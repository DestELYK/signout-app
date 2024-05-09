import {
  ActionIcon,
  Button,
  Card,
  Group,
  LoadingOverlay,
  MantineSpacing,
  Modal,
  Stack,
  StyleProp,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import { loader } from "~/routes/loans";
import { PersonWithTags } from "~/utils/types.server";
import { formatFullName } from "~/utils/utils";
import LoanSimpleView, { LoanSimpleViewProps } from "../loans/LoanSimpleView";
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
  const fetcher = useTypedFetcher<typeof loader>();
  const [person, setPerson] = useState<PersonPickerType | undefined>(
    value || undefined
  );
  const [outstandingPerson, setOutstandingPerson] = useState<
    PersonWithTags | undefined
  >();
  const [outstandingLoans, setOutstandingLoans] =
    useState<LoanSimpleViewProps[]>();

  const [opened, { open, close }] = useDisclosure();

  useEffect(() => {
    if (
      promptOutstanding &&
      fetcher.state === "idle" &&
      fetcher.data &&
      outstandingPerson
    ) {
      setOutstandingLoans(
        fetcher.data.loans.map((li) => ({
          id: li.id,
          dateLoaned: li.createdDate,
          itemCount: li.items.length,
        }))
      );

      console.log(fetcher.data.loans.length);
    }

    return () => {
      setOutstandingLoans(undefined);
    };
  }, [promptOutstanding, fetcher.data, fetcher.state]);

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
      setOutstandingPerson(person);
      open();
    } else {
      setOutstandingPerson(undefined);
      close();
    }
  }

  return (
    <>
      {outstandingPerson && (
        <Modal title="Outstanding Loans" opened={opened} onClose={close}>
          <LoadingOverlay visible={fetcher.state === "loading"} zIndex={1000} />

          <Stack>
            <Text c="red">
              {formatFullName(outstandingPerson)} already has{" "}
              {outstandingPerson._count.loans} loans out!
            </Text>
            {outstandingLoans && outstandingLoans.length > 0 ? (
              <Card>
                {outstandingLoans.map((loan) => (
                  <Card.Section key={loan.id} withBorder py="xs">
                    <LoanSimpleView {...loan} />
                  </Card.Section>
                ))}
              </Card>
            ) : (
              <Button
                variant="outline"
                onClick={(event) => {
                  fetcher.load(
                    `/loans?display=outstanding&personId=${outstandingPerson.id}`
                  );
                }}
              >
                View Outstanding Loans
              </Button>
            )}
            <Text>
              Are you sure you want to create a new loan for{" "}
              {outstandingPerson.firstName}?
            </Text>
            <Group justify="end">
              <Button color="red" onClick={close}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  updatePerson(outstandingPerson);
                  close();
                }}
              >
                Confirm
              </Button>
            </Group>
          </Stack>
        </Modal>
      )}

      {person ? (
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
      )}
    </>
  );
}
