import { LoaderFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);

    const id = url.searchParams.get('id')

    const filter = {
        ...id && {id: parseInt(id)} 
    }

    return json(await prisma.item.findMany({
        where: filter
    }));
}