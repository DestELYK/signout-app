import { Modal } from "@mantine/core";
import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { typedjson } from "remix-typedjson";
import DataPage from "~/DataPage";
import PersonForm from "~/components/forms/PersonForm";
import { handleError } from "~/lib/db.server";
import { useCreateModal } from "~/lib/hooks";
import { prisma } from "~/lib/prisma.server";
import { PersonFormSchema } from "~/lib/schemas";
import { personWithTags } from "~/utils/types.server";

export const meta: MetaFunction = () => {
    return [{ title: "People | SJK Sign-Out" }];
};

export async function action({ request }: ActionFunctionArgs) {
    try {
        switch (request.method) {
            case "POST":
                const person = PersonFormSchema.parse(await request.json());

                return typedjson({
                    person: await prisma.person.create({
                        data: {
                            firstName: person.firstName,
                            lastName: person.lastName,
                            nickname: person.nickname,
                            studentId: person.studentId,
                            role: {
                                connect: {
                                    id: person.role,
                                },
                            },
                            tags: person.tags
                                ? {
                                      connect: person.tags.map((tag) => ({
                                          id: tag,
                                      })),
                                  }
                                : undefined,
                        },
                        include: personWithTags.include,
                    }),
                    error: undefined,
                });
            default:
                throw new Response(null, {
                    status: 405,
                });
        }
    } catch (e) {
        const error = handleError(e, "no item was created");

        if (error) {
            return typedjson({ error: error, person: undefined });
        } else {
            throw new Response(String(e), {
                status: 500,
            });
        }
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
                        studentId: "",
                    }}
                    onResult={(data) => {
                        if (data.person) {
                            close();

                            navigate(`/people/${data.person.id}`);
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
