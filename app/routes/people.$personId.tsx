import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/lib/prisma.server";
import { fullName } from "~/lib/utils";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.personId, "Expected params.personId");

  try {
    return json(
      await prisma.person.findFirstOrThrow({
        where: { id: parseInt(params.personId) },
        include: {
          loans: {
            include: {
              _count: {
                select: {
                  items: {
                    where: {
                      dateReturned: null,
                    },
                  },
                },
              },
              items: true,
            },
          },
        },
      })
    );
  } catch (e) {
    console.log("Failed to find /people/$personId", e);
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
};

export default function Page() {
  const person = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{fullName(person)}</h1>
      <p>{`${person.loans.length} loan(s)`}</p>
    </div>
  );
}
