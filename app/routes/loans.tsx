import { Modal } from "@mantine/core";
import { ActionFunctionArgs } from "@remix-run/node";
import { MetaFunction } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import CreateLoanForm from "~/components/forms/CreateLoanForm";
import DataPage from "~/DataPage";
import { useCreateModal } from "~/lib/hooks";
import { createLoan } from "~/lib/loans.server";

export const meta: MetaFunction = () => {
    return [{ title: "Loans | SJK Sign-Out" }];
};

export async function action({ request }: ActionFunctionArgs) {
    switch (request.method) {
        case "POST":
            return typedjson(await createLoan(await request.json()));
        default:
            throw new Response("Method Not Allowed", { status: 405 });
    }
}

export default function Page() {
    const [opened, { open, close }] = useCreateModal();

    return (
        <>
            <Modal opened={opened} onClose={close} centered={true} title={"Create New Loan"}>
                <CreateLoanForm
                    onResult={(data) => {
                        close();
                    }}
                />
            </Modal>
            <DataPage
                path="loans"
                title="Loans"
                createLabel="Create New Loan"
                tabs={["overview", "list"]}
                onCreateClick={open}
            />
        </>
    );
}
