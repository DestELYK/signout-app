import { Modal } from "@mantine/core";
import { ActionFunctionArgs, MetaFunction } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import DataPage from "~/DataPage";
import CreateItemForm from "~/components/items/CreateItemForm";
import { handleError } from "~/lib/db.server";
import { useCreateModal } from "~/lib/hooks";
import { prisma } from "~/lib/prisma.server";
import { PostItemFormData, itemWithTags } from "~/utils/types.server";

export const meta: MetaFunction = () => {
  return [{ title: "Items | SJK Sign-Out" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData: PostItemFormData = await request.json();

  try {
    switch (request.method) {
      case "POST":
        if (!formData.name) {
          throw new Error("Name must be provided");
        }

        if (formData.location === undefined) {
          throw new Error("There must be a location set");
        }

        if (formData.tags === undefined || formData.tags.length < 1) {
          throw new Error("There must be at least 1 tag");
        }

        try {
          // verifies that the provided id is a valid location tag
          await prisma.tag.findFirstOrThrow({
            where: { id: formData.location.id, category: "Location" },
          });
        } catch (e) {
          throw new Error("Location tag is invalid");
        }

        if (
          formData.tags.find((t) => t.id === formData.location.id) === undefined
        ) {
          formData.tags.push(formData.location);
        }

        const item = await prisma.item.create({
          data: {
            name: formData.name,
            qrCode: formData.qrCode,
            locationId: formData.location.id,
            tags: {
              connect: formData.tags,
            },
          },
          include: itemWithTags.include,
        });

        return typedjson({ item: item, error: undefined });
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    const error = handleError(e, "no item was created");

    if (error) {
      return typedjson({ error: error, item: undefined });
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
        title={"Create New Item"}
      >
        <CreateItemForm
          onSubmitted={(data) => {
            close();
          }}
        />
      </Modal>
      <DataPage
        path="items"
        title="Items"
        createLabel="Create New Item"
        tabs={["overview", "list"]}
        onCreateClick={open}
      />
    </>
  );
}
