import { Prisma } from "@prisma/client";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export async function loader({request}: LoaderFunctionArgs) {
    const url = new URL(request.url);

    const qrCode = url.searchParams.get('qrCode');
    const name = url.searchParams.get('name');
    const type = url.searchParams.get('type');
    const query = url.searchParams.get('query');

    const filter: Prisma.ItemWhereInput = query ? {
        name: {
            contains: query
        }
    } : {
        ...qrCode && {qrCode: qrCode},
        ...name && {name: name},
        ...type && {type: type}
    }

    return json(await prisma.item.findMany({
        where: filter
    }));
}