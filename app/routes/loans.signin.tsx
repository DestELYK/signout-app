import {
    Box,
    Button,
    Card,
    Checkbox,
    CloseButton,
    Combobox,
    Divider,
    Fieldset,
    Flex,
    Group,
    ScrollArea,
    Stack,
    Stepper,
    Text,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { Item, Person } from "@prisma/client";
import { useActionData, useFetcher, useNavigate } from "@remix-run/react";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import { LoanItemView } from "~/components/LoanItemView";
import SearchForm, { SearchFormValues } from "~/components/SearchForm";
import ItemView from "~/components/items/ItemView";
import PersonView from "~/components/people/PersonView";
import { fullName } from "~/lib/utils";
import { loader as itemsLoader } from "./items";
import { action, loader as loansLoader } from "./loans";
import { loader as peopleLoader } from "./people";

export default function Page() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const actionData = useActionData<typeof action>();

  const signinForm = useForm<{
    loanId: number;
    itemIds: number[];
  }>({
    initialValues: {
      itemIds: [],
      loanId: -1,
    },
  });

  const searchPeople = useFetcher<typeof peopleLoader>();
  const searchItems = useFetcher<typeof itemsLoader>();
  const loans = useFetcher<typeof loansLoader>();
  const items = useFetcher<typeof itemsLoader>();

  const [searchingForPerson, setSearchingForPerson] = useState(true);

  const [active, setActive] = useState(0);

  function searchForPerson(value?: SearchFormValues) {
    if (value) {
      const searchParams = value.qrCode
        ? `qrCode=${value.qrCode}`
        : `query=${value.name}`;

      searchPeople.load(`/people?${searchParams}`);
    } else {
      searchPeople.load("");

      return false;
    }

    return true;
  }

  function searchForItem(value?: SearchFormValues) {
    if (value) {
      const searchParams = value.qrCode
        ? `qrCode=${value.qrCode}`
        : `query=${value.name}`;

      searchItems.load(`/items?${searchParams}`);
    } else {
      searchItems.load("");

      return false;
    }

    return true;
  }

  return (
    <Card withBorder h="100%" w="100%">
      <Card.Section withBorder inheritPadding px="xs" mb="sm">
        <Flex direction="row" justify="center" align="center">
          <Title w="100%" order={4} ta="center" fw="bold">
            Sign-In Items
          </Title>
          <CloseButton
            size="xl"
            style={{ justifySelf: "flex-end" }}
            onClick={() => navigate("/loans")}
          />
        </Flex>
      </Card.Section>
      <Stepper
        h="100%"
        orientation="vertical"
        active={active}
        onStepClick={(index) => {
          if (index < active) setActive(index);
        }}
      >
        <Stepper.Step
          h="100%"
          label="Select Loan"
          description="Select an outstanding loan"
        >
          <Fieldset
            legend={`${searchingForPerson ? "Person" : "Item"} Search`}
            w="100%"
            p="sm"
            h="fit-content"
          >
            <Box w="100%" h="100%">
              <div hidden={!searchingForPerson}>
                {/* Searching for Person */}
                <SearchForm
                  formData={{
                    placeholder: {
                      name: "Enter person's name",
                      qrCode: "Enter QR Code",
                    },
                    submitIcon: <IconSearch />,
                  }}
                  onQRCodeChanged={(value) =>
                    searchForPerson?.(value ? { qrCode: value } : undefined)
                  }
                  onNameChanged={(value) =>
                    searchForPerson?.(value ? { name: value } : undefined)
                  }
                  onItemSelect={(value) => {
                    const person: Person = JSON.parse(value);

                    loans.load(`/loans?personId=${person.id}`);

                    return {
                      qrCode: person.qrCode == null ? undefined : person.qrCode,
                      name: fullName(person),
                    };
                  }}
                  submitHidden
                >
                  {searchPeople.data && searchPeople.data.length > 0 ? (
                    searchPeople.data.filter((person) => person._count.loans > 0).map((person, index) => (
                      <Combobox.Option
                        value={JSON.stringify(person)}
                        key={index}
                      >
                        <>
                          <PersonView
                            highlight=""
                            person={{
                              ...person,
                              createdDate: new Date(person.createdDate),
                              updatedDate: new Date(person.updatedDate),
                            }}
                          />
                          <Divider mt="sm" />
                        </>
                      </Combobox.Option>
                    ))
                  ) : (
                    <Combobox.Empty>No items found</Combobox.Empty>
                  )}
                </SearchForm>
              </div>
              <div hidden={searchingForPerson}>
                {/* Searching for Item */}
                <SearchForm
                  formData={{
                    placeholder: {
                      name: "Enter item name",
                      qrCode: "Enter QR Code",
                    },
                    submitIcon: <IconSearch />,
                  }}
                  onQRCodeChanged={(value) =>
                    searchForItem?.(value ? { qrCode: value } : undefined)
                  }
                  onNameChanged={(value) =>
                    searchForItem?.(value ? { name: value } : undefined)
                  }
                  onItemSelect={(value) => {
                    const item: Item = JSON.parse(value);

                    loans.load(`/loans?itemId=${item.id}`);

                    return {
                      qrCode: item.qrCode == null ? undefined : item.qrCode,
                      name: item.name,
                    };
                  }}
                  submitHidden
                >
                  {searchItems.data && searchItems.data.length > 0 ? (
                    searchItems.data.filter((item) => item._count.loans > 0).map((item, index) => (
                      <Combobox.Option value={JSON.stringify(item)} key={index}>
                        <>
                          <ItemView highlight="" item={item} />
                          <Divider mt="sm" />
                        </>
                      </Combobox.Option>
                    ))
                  ) : (
                    <Combobox.Empty>No items found</Combobox.Empty>
                  )}
                </SearchForm>
              </div>
            </Box>
            <Flex direction="row" w="100%" justify="end" mt="sm">
              <Button
                variant="subtle"
                onClick={() =>
                  setSearchingForPerson(
                    (searchingForPerson) => !searchingForPerson
                  )
                }
              >
                {searchingForPerson ? "Search for item" : "Search for person"}
              </Button>
            </Flex>
          </Fieldset>
          <Fieldset h="100%" legend="Loans">
            {loans.data && loans.data.length > 0 ? (
              <ScrollArea.Autosize
                mah="100%"
                type="auto"
                scrollbars="y"
                offsetScrollbars
              >
                <Stack gap="sm">
                  {loans.data.map((loan) =>
                    loan._count.items > 0 ? (
                      <LoanItemView
                        loan={{
                          ...loan,
                          createdDate: new Date(loan.createdDate),
                          updatedDate: new Date(loan.updatedDate),
                        }}
                        onClick={() => {
                          items.load(`/items?loanId=${loan.id}`);
                          signinForm.setFieldValue("loanId", loan.id);
                          setActive(1);
                        }}
                      />
                    ) : null
                  )}
                </Stack>
              </ScrollArea.Autosize>
            ) : (
              <Text>No loans found</Text>
            )}
          </Fieldset>
        </Stepper.Step>
        <Stepper.Step
          h="100%"
          label="Select Item(s)"
          description="Select Item(s) to Sign-In"
        >
          <Fieldset legend="Items">
            {items.data && items.data.length > 0 ? (
              <Checkbox.Group
                label="Select items for signing in"
                description="All items selected will be marked as returned"
                value={signinForm.values.itemIds.map((itemId) =>
                  itemId.toString()
                )}
                onChange={(values) =>
                  signinForm.setFieldValue(
                    "itemIds",
                    values.map((v) => parseInt(v))
                  )
                }
              >
                <Group mt="sm">
                  {items.data.map((item, index) => {
                    console.log(item);
                    return (
                      <Checkbox
                        value={item.id.toString()}
                        label={item.name}
                        checked
                      />
                    );
                  })}
                </Group>
              </Checkbox.Group>
            ) : (
              <Text>No Items</Text>
            )}
          </Fieldset>

          <form
            onSubmit={signinForm.onSubmit((values) => {
              fetcher.submit(values, {
                action: "/loans",
                method: "PATCH",
                encType: "application/json",
                navigate: false,
              });

              notifications.show({
                message: `Updated loan`
              })
            })}
          >
            <Group w="100%" justify="end">
              <Button type="submit">Submit</Button>
            </Group>
          </form>
        </Stepper.Step>
      </Stepper>
    </Card>
  );
}
