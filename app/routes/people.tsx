import { Modal } from "@mantine/core";
import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import DataPage from "~/DataPage";
import CreatePersonForm from "~/components/people/CreatePersonForm";
import { handleError } from "~/lib/db.server";
import { useCreateModal } from "~/lib/hooks";
import { prisma } from "~/lib/prisma.server";
import { PostPersonFormData, personWithTags } from "~/utils/types.server";

export const meta: MetaFunction = () => {
  return [{ title: "People | SJK Sign-Out" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData: PostPersonFormData = await request.json();

  try {
    switch (request.method) {
      case "POST":
        if (!formData.firstName) {
          throw new Error("FirstName must be provided");
        }

        if (!formData.lastName) {
          throw new Error("LastName must be provided");
        }

        if (!formData.role) {
          throw new Error("There must be a role");
        }

        return typedjson({
          person: await prisma.person.create({
            data: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              nickname: formData.nickname,
              qrCode: formData.qrCode,
              tags: {
                connect: formData.role,
              },
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

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        centered={true}
        title={"Create New Person"}
      >
        <CreatePersonForm
          onSubmitted={(data) => {
            close();
          }}
        />
      </Modal>
      <DataPage
        path="people"
        title="People"
        createLabel="Create New Person"
        tabs={["overview", "list"]}
        onCreateClick={open}
      />
    </>
  );
}
