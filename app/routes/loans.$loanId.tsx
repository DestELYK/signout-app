import { Card, Center, Text } from "@mantine/core";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import { IconClipboard, IconInfoCircle, IconListCheck } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import ErrorPage from "~/components/ErrorPage";
import DetailsPage from "~/DetailsPage";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";

export const meta: MetaFunction = ({ params }) => {
  return [{ title: `Viewing Loan #${params.loanId}` }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.loanId, "Expected params.loanId");

  const loanId = parseInt(params.loanId);

  if (loanId === undefined) {
    throw new Response(null, {
      status: 404,
    });
  }

  try {
    return typedjson({
      loan: await prisma.loan.findFirstOrThrow({
        where: { id: loanId },
        select: {
          id: true,
          createdDate: true,
          updatedDate: true,
          notes: true,
          tags: true,
          person: {
            select: {
              id: true,
              qrCode: true,
              firstName: true,
              lastName: true,
              nickname: true,
              tags: true,
              notes: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
      }),
      outstandingItems: await prisma.loanedItem.count({
        where: {
          loanId: loanId,
          dateReturned: null,
        },
      }),
      error: undefined,
    });
  } catch (e) {
    const error = handleError(e, "no loan returned");

    if (error) {
      return typedjson({ error: error, outstandingItems: 0, loan: undefined });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
};

export interface PatchLoanFormData {
  personId?: number;
  itemIds?: { id: number; newId?: number; returnedById?: number }[];
  tagIds?: { id: number; name?: string }[];
  notes?: string;
  dateReturned?: Date;
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData: PatchLoanFormData = await request.json();

  invariant(params.loanId, "No loanId provided");

  const loanId = params.loanId;

  try {
    switch (request.method) {
      case "PATCH":
        let personId = formData.personId;

        if (formData.itemIds && formData.itemIds.length == 0) {
          throw Error("Loan requires at least one item");
        }

        const itemIds = formData.itemIds;

        const notes = formData.notes;

        const tagIds = formData.tagIds;

        const updatedDate =
          personId || itemIds || notes
            ? formData.dateReturned || new Date()
            : undefined;

        if (!personId) {
          personId = (
            await prisma.loan.findFirstOrThrow({
              where: { id: parseInt(loanId) },
            })
          ).personId;
        }

        // TODO - validate against previous loan dates

        const updatedLoan = await prisma.loan.update({
          where: { id: parseInt(loanId) },
          data: {
            ...(personId && { personId: personId }),
            ...(notes != undefined && { notes: notes }),
            ...(updatedDate != undefined && { updatedDate: updatedDate }),
            ...(itemIds != undefined && {
              items: {
                updateMany: itemIds.map((i) => {
                  let data: {
                    returnedById?: number;
                    dateReturned?: Date;
                    itemId?: number;
                  };

                  if (i.newId !== undefined) {
                    data = {
                      itemId: i.newId,
                      dateReturned: formData.dateReturned || undefined,
                    };
                  } else if (i.returnedById !== undefined) {
                    data = {
                      returnedById: i.returnedById,
                      dateReturned: formData.dateReturned || updatedDate,
                    };
                  } else {
                    data = {
                      returnedById: personId,
                      dateReturned: formData.dateReturned || updatedDate,
                    };
                  }

                  return {
                    where: {
                      AND: [
                        { itemId: i.id },
                        ...(i.returnedById ? [{ dateReturned: null }] : []),
                      ],
                    },
                    data: data,
                  };
                }),
              },
            }),
            ...(tagIds != undefined && {
              tags: {
                set: tagIds.map((t) => {
                  return {
                    id: t.id,
                  };
                }),
              },
            }),
          },
        });

        console.log("Loan #%i updated", loanId);

        return typedjson({ loan: updatedLoan, error: undefined });
      default:
        throw new Response(null, {
          status: 405,
        });
    }
  } catch (e) {
    const error = handleError(e, "no loan was updated");

    if (error) {
      return typedjson({ error: error, loan: undefined });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
};

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <Card padding="sm" radius="sm" withBorder w="100%" h="100%">
      <ErrorPage error={error} />
    </Card>
  );
}

export default function Page() {
  const data = useTypedLoaderData<typeof loader>();

  return data.error != undefined ? (
    <Center h="100%">
      <Text c="error">{data.error}</Text>
    </Center>
  ) : (
    data.loan !== undefined && (
      <DetailsPage
        title={`Loan #${data.loan.id}`}
        data={{
          overview: {
            icon: <IconInfoCircle size={24} />,
            label: "Overview",
          },
          items: {
            icon: <IconClipboard size={24} />,
            label: "Items",
          },
          signin: {
            icon: <IconListCheck size={24} />,
            label: "Sign-In",
          },
        }}
      />
    )
  );
}
