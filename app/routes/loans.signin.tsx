import {
  Box,
  Button,
  Card,
  Checkbox,
  CloseButton,
  Fieldset,
  Flex,
  Group,
  LoadingOverlay,
  ScrollArea,
  Stepper,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import {
  redirect,
  typedjson,
  useTypedFetcher,
  useTypedLoaderData,
} from "remix-typedjson";
import { LoanItemView } from "~/components/LoanItemView";
import SearchForm, { SearchFormValues } from "~/components/SearchForm";
import { prisma } from "~/lib/prisma.server";
import { loanFindMany } from "~/utils/types.server";
import { fullName } from "~/utils/utils";

// TODO - Add returned by person field
// TODO - Limit number of loans shown (hide until user searches)
// TODO - Modify how loan items are displayed
// TODO - Allow loans to be listed as a grid
// TODO - Stack items
// TODO - show no items selected error

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  const loanIdParam = url.searchParams.get("loanId");

  if (loanIdParam && loanIdParam.length !== 0) {
    try {
      const result = await prisma.loan.findFirstOrThrow({
        where: {
          id: parseInt(loanIdParam),
        },
        select: {
          ...loanFindMany.select,
        },
      });

      if (!result) {
        return redirect("/loans/signin");
      }

      return typedjson({ selectedLoan: result, outstandingLoans: undefined });
    } catch (e) {
      console.error("Failed to find loan: ", e);

      return redirect("/loans/signin");
    }
  } else {
    return typedjson({
      outstandingLoans: await prisma.loan.findMany({
        where: {
          items: {
            some: {
              dateReturned: null,
            },
          },
        },
        select: loanFindMany.select,
      }),
      selectedLoan: undefined,
    });
  }
};

export default function Page() {
  const navigate = useNavigate();
  const fetcher = useTypedFetcher();
  const [searchParams, setSearchParams] = useSearchParams();

  const signinForm = useForm<{
    itemIds: number[];
  }>({
    initialValues: {
      itemIds: [],
    },
  });

  const loan = useTypedLoaderData<typeof loader>();

  const [searchingForPerson, setSearchingForPerson] = useState(true);

  const [active, setActive] = useState(0);
  const [personSearch, setPersonSearch] = useState<SearchFormValues>();
  const [itemSearch, setItemSearch] = useState<SearchFormValues>();

  const loanId = searchParams.get("loanId");

  useEffect(() => {
    setActive(loanId ? 1 : 0);
  }, [loanId]);

  const filteredLoans =
    loan && loan.outstandingLoans
      ? loan.outstandingLoans.length > 0 && (personSearch || itemSearch)
        ? loan.outstandingLoans.filter((l) => {
            if (personSearch) {
              if (personSearch.qrCode) {
                return l.person.qrCode === personSearch.qrCode;
              } else if (personSearch.name) {
                return fullName(l.person)
                  .toLowerCase()
                  .includes(personSearch.name.toLowerCase());
              }
            } else if (itemSearch) {
              if (itemSearch.qrCode) {
                return l.items.find((i) => i.item.qrCode == itemSearch.qrCode);
              } else if (itemSearch.name) {
                return l.items.find((i) => i.item.name == itemSearch.name);
              }
            }

            return true;
          })
        : []
      : undefined;

  const loans =
    filteredLoans &&
    (filteredLoans.length > 0 ? (
      <ScrollArea.Autosize
        mah="calc(100dvh - 35rem)"
        type="auto"
        scrollbars="y"
      >
        {filteredLoans.map((l) => (
          <LoanItemView
            key={l.id}
            loan={l}
            onClick={() => {
              setSearchParams((prev) => {
                prev.set("loanId", l.id.toString());
                return prev;
              });
            }}
          />
        ))}
      </ScrollArea.Autosize>
    ) : (
      <Text>No loans found</Text>
    ));

  useEffect(() => {
    const event = (event: BeforeUnloadEvent) => {
      // Cancel the event as stated by the standard.
      event.preventDefault();
      // Chrome requires returnValue to be set.
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", event);

    return () => {
      window.removeEventListener("beforeunload", event);
    };
  });

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
          if (index < active) {
            setActive(index);
            setSearchParams((prev) => {
              prev.delete("loanId");
              return prev;
            });
          }
        }}
      >
        <Stepper.Step
          h="100%"
          label="Select Loan"
          description="Select an outstanding loan"
        >
          <Box pos="relative">
            <LoadingOverlay
              visible={!loan || !loan.outstandingLoans}
              zIndex={1000}
            />
            <Fieldset
              legend={`${searchingForPerson ? "Person" : "Item"} Search`}
              w="100%"
              p="sm"
              h="fit-content"
            >
              <Box pos="relative">
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
                    onQRCodeChanged={(value) => {
                      setPersonSearch(value ? { qrCode: value } : undefined);
                      return value.length !== 0;
                    }}
                    onNameChanged={(value) => {
                      setPersonSearch(value ? { name: value } : undefined);
                      return value.length !== 0;
                    }}
                    submitHidden
                    showCombobox={false}
                  />
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
                    onQRCodeChanged={(value) => {
                      setItemSearch(value ? { qrCode: value } : undefined);
                      return value.length !== 0;
                    }}
                    onNameChanged={(value) => {
                      setItemSearch(value ? { name: value } : undefined);
                      return value.length !== 0;
                    }}
                    submitHidden
                    showCombobox={false}
                  />
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
              {loans}
            </Fieldset>
          </Box>
        </Stepper.Step>
        <Stepper.Step
          h="100%"
          label="Select Item(s)"
          description="Select Item(s) to Sign-In"
        >
          <Fieldset legend="Items">
            <Box pos="relative">
              <LoadingOverlay
                visible={
                  !loan || !loan.selectedLoan || !loan.selectedLoan.items
                }
                zIndex={1000}
              />
              {loan &&
                loan.selectedLoan &&
                loan.selectedLoan.items &&
                (loan.selectedLoan.items.length > 0 ? (
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
                      {loan.selectedLoan.items
                        .filter((i) => !i.dateReturned)
                        .map((item, index) => {
                          return (
                            <Checkbox
                              key={item.item.id}
                              value={item.item.id.toString()}
                              label={item.item.name}
                              checked
                            />
                          );
                        })}
                    </Group>
                  </Checkbox.Group>
                ) : (
                  <Text>No Items</Text>
                ))}
            </Box>
          </Fieldset>

          <form
            onSubmit={signinForm.onSubmit((values) => {
              fetcher.submit(values, {
                action: `/loans/${loanId}`,
                method: "PATCH",
                encType: "application/json",
                navigate: false,
              });
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
