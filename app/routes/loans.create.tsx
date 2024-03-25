import { Card, CloseButton, Code, Flex, Title } from "@mantine/core";
import { useActionData, useFetcher, useNavigate } from "@remix-run/react";
import LoanForm, { LoanDataValues, LoanFormValues } from "~/components/LoanForm";
import { loader as itemsLoader } from "./items";
import { action } from "./loans";
import { loader as peopleLoader } from "./people";

export default function Page() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const actionData = useActionData<typeof action>();

  const people = useFetcher<typeof peopleLoader>();
  const items = useFetcher<typeof itemsLoader>();

  const data: LoanDataValues = {
    people: people.data ? people.data: [],
    items: items.data ? items.data : [],
    loading: items.state === "loading" || people.state === "loading"
  }

  // @ts-ignore
  const handleSubmit = (values: LoanFormValues) => {
    fetcher.submit(values, {
      action: "/loans",
      method: "POST",
      encType: "application/json",
      navigate: false,
    });
  };

  return (
    <Card withBorder h="100%" w="100%">
      <Card.Section withBorder inheritPadding px="xs" mb="sm">
        <Flex direction="row" justify="center" align="center">
          <Title w="100%" order={4} ta="center" fw="bold">
            Sign-Out Items
          </Title>
          <CloseButton
            size="xl"
            style={{ justifySelf: "flex-end" }}
            onClick={() => navigate("/loans")}
          />
        </Flex>
      </Card.Section>
      <LoanForm
      onPersonSearch={(value) => {
        if (value) {
          const searchParams = value.qrCode
            ? `qrCode=${value.qrCode}`
            : `query=${value.name}`;
      
            people.load(`/people?${searchParams}`);
        } else {
          people.load('')
        }
      }}
        onItemSearch={(value) => {
          if (value) {
            const searchParams = value.qrCode
              ? `qrCode=${value.qrCode}`
              : `query=${value.name}`;
        
            items.load(`/items?${searchParams}`);
          } else {
            items.load('')
          }
        }}
        onSubmit={handleSubmit}
        data={data}
      />
      {fetcher.data ? <Code block>{JSON.stringify(fetcher.data)}</Code> : null}
    </Card>
  );
}
