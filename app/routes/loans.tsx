import { Modal } from "@mantine/core";
import { ActionFunctionArgs } from "@remix-run/node";
import { MetaFunction } from "@remix-run/react";
import dayjs from "dayjs";
import { typedjson } from "remix-typedjson";
import DataPage from "~/DataPage";
import CreateLoanForm from "~/components/loans/CreateLoanForm";
import { useCreateModal } from "~/lib/hooks";
import { prisma } from "~/lib/prisma.server";
import { PostLoanFormData, loanWithTags } from "~/utils/types.server";

export const meta: MetaFunction = () => {
  return [{ title: "Loans | SJK Sign-Out" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData: PostLoanFormData = await request.json();

  try {
    switch (request.method) {
      case "POST":
        if (!formData.person || formData.person.id === -1) {
          throw Error("No person selected");
        }

        if (!formData.items || formData.items.length == 0) {
          throw Error("Loan requires at least one item");
        }

        if (
          formData.dateLoaned &&
          dayjs(formData.dateLoaned).isAfter(dayjs())
        ) {
          throw Error("Loan date cannot be in the future!");
        }

        const outstandingItems = await prisma.loanedItem.findMany({
          where: {
            AND: [
              {
                OR: formData.items.map((i) => {
                  return {
                    itemId: i.id,
                  };
                }),
              },
              {
                dateReturned: null,
              },
            ],
          },
        });

        if (outstandingItems.length > 0) {
          throw Error("One of the items is currently outstanding!");
        }

        const result = await prisma.loan.create({
          data: {
            person: {
              connect: {
                id: formData.person.id,
              },
            },
            items: {
              create: formData.items.map((item) => ({
                item: {
                  connect: {
                    id: item.id,
                  },
                },
                ...(formData.dateLoaned && {
                  dateLoaned: new Date(formData.dateLoaned),
                  createdDate: new Date(formData.dateLoaned),
                  updatedDate: new Date(formData.dateLoaned),
                }),
              })),
            },
            tags: {
              connect: formData.tags.map((tag) => ({
                id: tag.id,
              })),
            },
            ...(formData.dateLoaned && {
              createdDate: new Date(formData.dateLoaned),
              updatedDate: new Date(formData.dateLoaned),
            }),
          },
          include: loanWithTags.include,
        });

        console.debug("Created new loan: %s", result);

        return typedjson({ loan: result, error: undefined });
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    console.error(`Failed to ${request.method} a loan`, e);

    let message = "Unknown Error";
    if (e instanceof Error) message = e.message;

    return typedjson({ error: message, loan: undefined });
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
        title={"Create New Loan"}
      >
        <CreateLoanForm
          onSubmitted={(data) => {
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
