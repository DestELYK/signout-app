import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma } from "~/lib/prisma.server";
import invariant from 'tiny-invariant' 

export const loader = async ({params}: LoaderFunctionArgs) => {
    invariant(params.loanId, "Expected params.loanId");
    invariant(params.itemId, "Expected params.itemId");

    return json({item: await prisma.itemsInLoans.findFirstOrThrow({
        where: {loanId: parseInt(params.loanId), itemId: parseInt(params.itemId)},
        include: {
            item: true
        }
    })});
}

export default function Page() {
    const { item } = useLoaderData<typeof loader>();

    return (
        <div>

        </div>
    )
}