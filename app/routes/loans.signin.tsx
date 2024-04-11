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
import { useToggle } from "@mantine/hooks";
import { MetaFunction, useNavigate, useRouteError, useSearchParams, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useTypedFetcher } from "remix-typedjson";
import ErrorPage from "~/components/ErrorPage";
import SearchItemForm from "~/components/items/SearchItemForm";
import { LoanItemView } from "~/components/loans/LoanItemView";
import SearchPersonForm from "~/components/people/SearchPersonForm";
import { capitalizeFirstLetter } from "~/utils/utils";
import { loader as loansLoader } from "./loans";
import { LoanPatchValues, loader as loanLoader } from "./loans.$loanId";

// TODO - Add returned by person field
// TODO - Limit number of loans shown (hide until user searches)
// TODO - Modify how loan items are displayed
// TODO - Allow loans to be listed as a grid
// TODO - Stack items
// TODO - show no items selected error

export const meta: MetaFunction = () => {
  return [{ title: "Loan Sign-In" }];
};

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <Card padding="sm" radius="sm" withBorder w="100%" h="100%">
      <ErrorPage error={error} />
    </Card>
  );
}

export default function Page() {
  const signinForm = useForm<
    Omit<LoanPatchValues, "personId" | "notes" | "tagIds">
  >({
    initialValues: {
      itemIds: [],
    },
  });

  const navigate = useNavigate();

  const loansFetcher = useTypedFetcher<typeof loansLoader>();
  const loan = useTypedFetcher<typeof loanLoader>();

  const submit = useSubmit();

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchType, toggleSearchType] = useToggle(["person", "item"] as const);

  const [searchId, setSearchId] = useState("");

  const [active, setActive] = useState(0);

  const loanId = searchParams.get("loanId");

  useEffect(() => {
    if (loanId) {
      loan.load(`/loans/${loanId}`);
      setSearchId("");
    } else if (searchId) {
      console.log("Searching by id: %s", searchId);
      switch (searchType) {
        case "person":
          loansFetcher.load(`/loans?personId=${searchId}`);
          break;
        case "item":
          loansFetcher.load(`/loans?itemId=${searchId}`);
          break;
      }
    } else {
      loansFetcher.data = { count: 0, loans: [] };
    }

    setActive(loanId ? 1 : 0);
  }, [loanId, searchId]);

  useEffect(() => {
    if (loan.data && (!loan.data.items || loan.data.items.filter((i) => !i.dateReturned).length == 0)) {
      setSearchParams((prev) => {
        prev.delete("loanId");
        return prev;
      }, {
        replace: true
      })
    }
  }, [loan.data])

  const loanOptions =
    !loanId && loansFetcher.data ? (
      loansFetcher.data.loans.length > 0 ? (
        loansFetcher.data.loans
          .filter((l) => l._count.items > 0)
          .map((l) => (
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
          ))
      ) : (
        <Text>No loans found</Text>
      )
    ) : (
      <Text>Search for loans</Text>
    );

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
        {/* First Page - Selecting a loan */}
        <Stepper.Step
          h="100%"
          label="Select Loan"
          description="Select an outstanding loan"
        >
          <Box pos="relative">
            <LoadingOverlay visible={false} zIndex={1000} />
            <Fieldset
              legend={`${capitalizeFirstLetter(searchType)} Search`}
              w="100%"
              p="sm"
              h="fit-content"
            >
              <Box pos="relative">
                <div hidden={searchType != "person"}>
                  {/* Searching for Person */}
                  <SearchPersonForm
                    submitOnSelect
                    canCreate={false}
                    filterItems={(items) =>
                      items.filter((i) => i._count.loans > 0)
                    }
                    onSubmit={(value) => {
                      console.log("Submit %s", value);
                      setSearchId(value?.id.toString() || "");

                      return true;
                    }}
                  />
                </div>
                <div hidden={searchType != "item"}>
                  {/* Searching for Item */}
                  <SearchItemForm
                    submitOnSelect
                    canCreate={false}
                    filterItems={(items) =>
                      items.filter((i) => i._count.loans > 0)
                    }
                    onSubmit={(value) => {
                      setSearchId(value?.id.toString() || "");

                      return true;
                    }}
                  />
                </div>
              </Box>
              <Flex direction="row" w="100%" justify="end" mt="sm">
                <Button
                  variant="subtle"
                  onClick={() => {
                    toggleSearchType();
                  }}
                >
                  {`Search for ${searchType == "person" ? "item" : "person"}`}
                </Button>
              </Flex>
            </Fieldset>
            <Fieldset h="100%" legend="Loans">
              <ScrollArea.Autosize
                mah="calc(100dvh - 34rem)"
                style={{ overflowY: "auto" }}
              >
                {loanOptions}
              </ScrollArea.Autosize>
            </Fieldset>
          </Box>
        </Stepper.Step>
        {/* END */}

        {/* Second Page - Selecting items to sign-in*/}
        <Stepper.Step
          h="100%"
          label="Select Item(s)"
          description="Select Item(s) to Sign-In"
        >
          <Fieldset legend="Items">
            <Box pos="relative">
              <LoadingOverlay visible={loan.state !== "idle"} zIndex={1000} />
              {loan.data && loan.data.items && loan.data.items.length > 0 ? (
                <Checkbox.Group
                  label="Select items for signing in"
                  description="All items selected will be marked as returned"
                  value={signinForm.values.itemIds?.map((itemId) =>
                    itemId.id.toString()
                  )}
                  onChange={(values) =>
                    signinForm.setFieldValue(
                      "itemIds",
                      values.map((v) => {
                        return { id: parseInt(v) };
                      })
                    )
                  }
                >
                  <Group mt="sm">
                    {loan.data.items
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
              )}
            </Box>
          </Fieldset>

          <form
            onSubmit={signinForm.onSubmit((values) => {
              submit(values, {
                action: `/loans/${loanId}`,
                method: "PATCH",
                encType: "application/json",
              });
            })}
          >
            <Group w="100%" justify="end">
              <Button type="submit">Submit</Button>
            </Group>
          </form>
        </Stepper.Step>
        {/* END */}
      </Stepper>
    </Card>
  );
}
