import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/lib/prisma.server";


export const loader = async ({params}: LoaderFunctionArgs) => {
    invariant(params.personId, "Expected params.personId");

    return json({person: await prisma.person.findFirstOrThrow({
        where: { id: parseInt(params.personId)},
        include: {
            loans: {
                include: {
                    _count: {
                        select: {
                            items: true
                        }
                    }
                }
            }
        }
    })})
}

export default function Page() {
    const { person } = useLoaderData<typeof loader>();
    
    return (
        <div>
            <h1>{`${person.firstName} ${person.lastName}`}</h1>
            <p>{`${person.loans.length} loan(s)`}</p>
        </div>
    )
}