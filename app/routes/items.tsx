import { Modal } from "@mantine/core";
import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import ItemForm from "~/components/forms/ItemForm";
import DataPage from "~/DataPage";
import { handleError } from "~/lib/db.server";
import { useCreateModal } from "~/lib/hooks";
import { createItem } from "~/lib/items.server";
import { ItemFormSchema } from "~/lib/schemas";

export const meta: MetaFunction = () => {
    return [{ title: "Items | SJK Sign-Out" }];
};

export async function action({ request }: ActionFunctionArgs) {
    try {
        switch (request.method) {
            case "POST":
                const result = ItemFormSchema.parse(await request.json());

                return typedjson(await createItem(result));
            default:
                throw new Response(null, {
                    status: 405,
                });
        }
    } catch (e) {
        return typedjson({ error: handleError(e, "creating item") });
    }
}

export default function Page() {
    const [opened, { open, close }] = useCreateModal();

    return (
        <>
            <Modal opened={opened} onClose={close} centered={true} title={"Create New Item"}>
                <ItemForm
                    type="create"
                    onResult={(data) => {
                        if (data.data) {
                            close();
                        }
                    }}
                    initialValues={{
                        name: "",
                        description: "",
                        notes: "",
                    }}
                />
            </Modal>
            <DataPage
                path="items"
                title="Items"
                createLabel="Create New Item"
                tabs={["overview", "list", "types"]}
                onCreateClick={open}
            />
        </>
    );
}
