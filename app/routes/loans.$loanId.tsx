import { Card } from "@mantine/core";
import { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { useRouteError } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import ErrorPage from "~/components/ErrorPage";
import LoanInfoView from "~/components/loans/LoanInfoView";
import { prisma } from "~/lib/prisma.server";
import { loanFindOne } from "~/utils/types.server";

export const meta: MetaFunction = ({params}) => {
  return [{ title: `Viewing Loan #${params.loanId}` }];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.loanId, "Expected params.loanId");

  const loanId = parseInt(params.loanId);

  if (!loanId) {
    throw new Response(null, {
      status: 404,
    });
  }

  try {
    return typedjson(
      await prisma.loan.findFirstOrThrow({
        where: { id: loanId },
        include: loanFindOne.include,
      })
    );
  } catch (e) {
    console.error("Failed to find /loans/$loanId", e);
    throw new Response(`Loan #${params.loanId} cannot be found`, {
      status: 404,
    });
  }
};

export interface LoanPatchValues {
  personId?: number;
  itemIds?: { id: number; newId?: number; returnedById?: number }[];
  tagIds?: { id: number, name?: string }[];
  notes?: string;
}

export const action = async ({ params, request }: ActionFunctionArgs) => {
  const formData: LoanPatchValues = await request.json();

  invariant(params.loanId, "No loanId provided");

  const loanId = params.loanId;

  switch (request.method) {
    case "PATCH":
      let personId = formData.personId;

      if (formData.itemIds && formData.itemIds.length == 0) {
        throw Error("Loan requires at least one item");
      }

      const itemIds = formData.itemIds;

      const notes = formData.notes;

      const tagIds = formData.tagIds;

      const updatedDate = personId || itemIds || notes ? new Date() : undefined;

      if (!personId) {
        personId = (
          await prisma.loan.findFirstOrThrow({
            where: { id: parseInt(loanId) },
          })
        ).personId;
      }

      const updatedLoan = await prisma.loan.update({
        where: { id: parseInt(loanId) },
        data: {
          ...(personId && { personId: personId }),
          ...(notes != undefined && { notes: notes }),
          ...(updatedDate != undefined && { updatedDate: updatedDate }),
          ...(itemIds != undefined && {
            items: {
              updateMany: itemIds.map((i) => {
                return {
                  where: {
                    AND: [
                      {
                        itemId: i.id,
                      },
                      {
                        ...i.returnedById && {
                          NOT: {
                            dateReturned: null
                          }
                        }
                      }
                    ],
                  },
                  data: {
                    ...(i.newId && { itemId: i.newId }),
                    ...((!i.newId && !i.returnedById) && { dateReturned: new Date() }),
                    ...(i.returnedById
                      ? { returnedById: i.returnedById }
                      : !i.newId &&
                        personId && {
                          returnedById: personId,
                        }),
                  },
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

      if (!updatedLoan) {
        throw new Response(`Loan #${loanId} cannot be found`, {
          status: 404,
        });
      }

      console.log("Loan #%i updated", loanId);

      return typedjson(updatedLoan);
    default:
      throw new Response(null, {
        status: 405,
      });
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
  const loan = useTypedLoaderData<typeof loader>();

  return <LoanInfoView loan={loan} />;
}
