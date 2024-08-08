import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson } from "remix-typedjson";
import { prisma } from "~/lib/prisma.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const search = new URLSearchParams(request.url);

    const query = search.get("query") || search.get("q");

    const roles = await prisma.personRole.findMany({
        where: query
            ? {
                  name: {
                      contains: query,
                  },
              }
            : undefined,
    });

    return typedjson({
        roles,
    });
};

export default function Page() {
    return (
        <div>
            <h1>Create, update and delete roles here</h1>
        </div>
    );
}
