import { Card, CloseButton, Code, Flex, Title } from "@mantine/core";
import {
  useBlocker,
  useFetcher,
  useNavigate
} from "@remix-run/react";
import LoanForm from "~/components/LoanForm";

export default function Page() {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  // TODO - change submit to fetcher

  const blocker = useBlocker(true);

  // @ts-ignore
  const handleSubmit = (person, items) => {
    const data = { person: person, items: items };
    console.log("Submitting: %s", JSON.stringify(data));
    fetcher.submit(data, {
      action: "/loans",
      method: "POST",
      encType: "application/json",
      navigate: false
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
        onSubmit={handleSubmit}
      />
      {fetcher.data ? <Code block>{JSON.stringify(fetcher.data)}</Code> : null}
    </Card>
  );
}
