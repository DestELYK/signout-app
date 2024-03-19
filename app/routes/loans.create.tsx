import { Card, Flex, Title, CloseButton, Modal } from "@mantine/core";
import { useBlocker, useNavigate } from "@remix-run/react";
import LoanForm from "~/components/LoanForm";

export default function Page() {
    const navigate = useNavigate()

    const blocker = useBlocker(true);

    return (
      <Card withBorder h="100dvh">
        <Card.Section withBorder inheritPadding px="xs" mb="sm">
          <Flex direction="row" justify="center" align="center">
            <Title w="100%" order={4} ta="center" fw="bold">
              Sign-Out Items
            </Title>
            <CloseButton size="xl" style={{justifySelf: "flex-end"}} onClick={() => navigate('/loans')}/>
          </Flex>
        </Card.Section>
        <LoanForm/>
      </Card>
    )
}