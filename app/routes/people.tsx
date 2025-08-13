import { Modal } from "@mantine/core";
import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import DataPage from "~/DataPage";
import PersonForm from "~/components/forms/PersonForm";
import { useCreateModal } from "~/lib/hooks";
import { createPerson } from "~/lib/people.server";

export const meta: MetaFunction = () => {
    return [{ title: "People | SJK Sign-Out" }];
};

export async function action({ request }: ActionFunctionArgs) {
    switch (request.method) {
        case "POST":
            return typedjson(await createPerson(await request.json()));
        default:
            throw new Response(null, {
                status: 405,
            });
    }
}

export default function Page() {
    const [opened, { open, close }] = useCreateModal();
    const navigate = useNavigate();

    return (
        <>
            <Modal opened={opened} onClose={close} centered={true} title={"Create New Person"}>
                <PersonForm
                    type="create"
                    initialValues={{
                        firstName: "",
                        lastName: "",
                        schoolId: "",
                    }}
                    onResult={(personData) => {
                        if (personData.data) {
                            close();

                            navigate(`/people/${personData.data.id}`);
                        }
                    }}
                />
            </Modal>
            <DataPage
                path="people"
                title="People"
                createLabel="Create New Person"
                tabs={["overview", "list", "roles"]}
                onCreateClick={open}
            />
        </>
    );
}
