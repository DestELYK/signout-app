import { LoaderFunctionArgs, json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { prisma } from "~/lib/prisma.server";

export async function loader({params}: LoaderFunctionArgs) {
    invariant(params.itemId, 'Expected params.itemId')

    return json(await prisma.item.findFirstOrThrow({
        where: { id: parseInt(params.itemId)}
    }));
}