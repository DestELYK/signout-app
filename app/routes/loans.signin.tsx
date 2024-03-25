import {
    Box,
    Button,
    Card,
    CloseButton,
    Combobox,
    Fieldset,
    Flex,
    ScrollArea,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Item, Loan, Person } from "@prisma/client";
import { useActionData, useFetcher, useNavigate } from "@remix-run/react";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";
import SearchForm, { SearchFormValues } from "~/components/SearchForm";
import { fullName } from "~/lib/utils";
import { loader as itemsLoader } from "./items";
import { action, loader as loansLoader } from "./loans";
import { loader as peopleLoader } from "./people";

export default function Page() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const actionData = useActionData<typeof action>();

  const signoutForm = useForm<{
    loan?: Loan;
    item?: Item;
    person?: Person;
  }>({
    initialValues: {
      loan: undefined,
      item: undefined,
      person: undefined,
    },
  });

  const people = useFetcher<typeof peopleLoader>();
  const items = useFetcher<typeof itemsLoader>();
  const loans = useFetcher<typeof loansLoader>();

  const [searchingForPerson, setSearchingForPerson] = useState(true);

  //   const data: LoanDataValues = {
  //     people: people.data ? people.data : [],
  //     items: items.data ? items.data : [],
  //     loading: items.state === "loading" || people.state === "loading",
  //   };

  //   // @ts-ignore
  //   const handleSubmit = (values: LoanFormValues) => {
  //     fetcher.submit(values, {
  //       action: "/loans",
  //       method: "POST",
  //       encType: "application/json",
  //       navigate: false,
  //     });
  //   };

  function searchForPerson(value?: SearchFormValues) {
    if (value) {
      const searchParams = value.qrCode
        ? `qrCode=${value.qrCode}`
        : `query=${value.name}`;

      people.load(`/people?${searchParams}`);
    } else {
      people.load("");
    }
  }

  function searchForItem(value?: SearchFormValues) {
    if (value) {
      const searchParams = value.qrCode
        ? `qrCode=${value.qrCode}`
        : `query=${value.name}`;

      items.load(`/items?${searchParams}`);
    } else {
      items.load("");
    }
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
                submitIcon: <IconSearch/>
              }}
              onQRCodeChanged={(value) => {
                searchForPerson?.(value ? { qrCode: value } : undefined);
              }}
              onNameChanged={(value) => {
                searchForPerson?.(value ? { name: value } : undefined);
              }}
              onItemSelect={(value) => {
                const person: Person = JSON.parse(value);

                return {
                  qrCode: person.qrCode == null ? undefined : person.qrCode,
                  name: fullName(person),
                };
              }}
              onSubmit={(value) => {
                const item: Item = JSON.parse(value);

                // TODO - Search for loans from person
              }}
            >
              {people.data && people.data.length > 0 ? (
                people.data.map((person, index) => (
                  <Combobox.Option value={JSON.stringify(person)} key={index}>
                    {fullName(person)}
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
                submitIcon: <IconSearch/>
              }}
              onQRCodeChanged={(value) => {
                searchForItem?.(value ? { qrCode: value } : undefined);
              }}
              onNameChanged={(value) => {
                searchForItem?.(value ? { name: value } : undefined);
              }}
              onItemSelect={(value) => {
                const item: Item = JSON.parse(value);

                return {
                  qrCode: item.qrCode == null ? undefined : item.qrCode,
                  name: item.name,
                };
              }}
              onSubmit={(value) => {
                const item: Item = JSON.parse(value);

                // TODO - Search for item
              }}
            >
              {items.data && items.data.length > 0 ? (
                items.data.map((item, index) => (
                  <Combobox.Option value={JSON.stringify(item)} key={index}>
                    {item.name}
                  </Combobox.Option>
                ))
              ) : (
                <Combobox.Empty>No items found</Combobox.Empty>
              )}
            </SearchForm>
          </div>
        </Box>
        <Flex
          direction="row"
          w="100%"
          justify="end"
          mt="sm"
        >
          <Button
            variant="subtle"
            onClick={() =>
              setSearchingForPerson((searchingForPerson) => !searchingForPerson)
            }
          >
            {searchingForPerson ? "Search for item" : "Search for person"}
          </Button>
        </Flex>
      </Fieldset>
      <Fieldset legend="Loans" disabled>
        <ScrollArea mah="50dvh" style={{overflowY: "auto"}}>{}</ScrollArea>
      </Fieldset>

      {/* <LoanForm
        onPersonSearch={(value) => {
          if (value) {
            const searchParams = value.qrCode
              ? `qrCode=${value.qrCode}`
              : `query=${value.name}`;

            people.load(`/people?${searchParams}`);
          } else {
            people.load("");
          }
        }}
        onItemSearch={(value) => {
          if (value) {
            const searchParams = value.qrCode
              ? `qrCode=${value.qrCode}`
              : `query=${value.name}`;

            items.load(`/items?${searchParams}`);
          } else {
            items.load("");
          }
        }}
        onSubmit={handleSubmit}
        data={data}
      />
      {fetcher.data ? <Code block>{JSON.stringify(fetcher.data)}</Code> : null} */}
    </Card>
  );
}
