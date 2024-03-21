import { Prisma } from "@prisma/client";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({request}: LoaderFunctionArgs) => {
    const url = new URL(request.url)

    const firstName = url.searchParams.get('firstName');
    const lastName = url.searchParams.get('lastName');
    const nickName = url.searchParams.get('nickname');
    const qrCode = url.searchParams.get('qrCode');
    const query = url.searchParams.get('query');

    const filter = query ? {
        OR: [
            {
                firstName: {
                    contains: query
                }
            },
            {
                lastName: {
                    contains: query
                }
            },
            {
                nickname: {
                    contains: query
                }
            }
        ]
    } satisfies Prisma.PersonWhereInput : {
        ...firstName && {firstName: firstName}, 
        ...lastName && {firstName: lastName},
    }

    return json(await prisma.person.findMany({
        where: filter
    }))
}