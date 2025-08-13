import { Box, Center, Loader } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import ItemList from "~/components/items/ItemList";
import ItemTable from "~/components/tables/ItemTable";
import { handleError } from "~/lib/db.server";
import { useDesktopOnly } from "~/lib/hooks";
import { deleteItems, getItemLocations, getItems, getItemTypes } from "~/lib/items.server";
import { getTags } from "~/lib/tags.server";
import { INITIAL_PAGE_SIZE, MAX_PAGE_SIZE, STATUS_OPTIONS } from "~/utils/consts";
import { parseNumber } from "~/utils/utils";

import { ActionFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const searchParams = new URL(request.url).searchParams;

    try {
        const pageSize = parseNumber(
            searchParams.get("limit"),
            INITIAL_PAGE_SIZE,
            undefined,
            MAX_PAGE_SIZE
        );

        const offset = parseNumber(searchParams.get("page"), 0);

        console.log("pageSize", pageSize);
        console.log("offset", offset);

        const itemResult = await getItems(
            {
                query: searchParams.get("query") || searchParams.get("q") || undefined,
                name: searchParams.get("name") || undefined,
                statuses: searchParams.getAll("status") ?? undefined,
                types: searchParams.getAll("type"),
                locations: searchParams.getAll("location"),
                sortBy: searchParams.get("sortBy") || undefined,
                sortOrder: searchParams.get("sortOrder") || undefined,
                personId: searchParams.get("personId") || undefined,
                tags: searchParams.getAll("tag") || undefined,
            },
            pageSize,
            parseNumber(searchParams.get("page"), 0) * pageSize
        );

        const itemTypes = await getItemTypes();

        const itemLocations = await getItemLocations();

        const tags = await getTags({});

        console.log("itemResult", itemResult.totalCount);

        console.log("itemCount", itemResult.data?.length);

        return typedjson({
            items: itemResult.data,
            totalCount: itemResult.totalCount,
            error: itemResult.error,
            statuses: STATUS_OPTIONS,
            itemTypes: itemTypes.data,
            itemLocations: itemLocations.data,
            tags: tags,
        });
    } catch (error) {
        return typedjson({
            items: undefined,
            totalCount: undefined,
            statuses: undefined,
            itemTypes: undefined,
            itemLocations: undefined,
            tags: undefined,
            error: handleError(error),
        });
    }
};

export const action = async ({ request }: ActionFunctionArgs) => {
    switch (request.method) {
        case "DELETE":
            return typedjson(await deleteItems(await request.json()));
        default:
            throw new Response("Method Not Allowed", { status: 405 });
    }
};

export default function Page() {
    const desktopOnly = useDesktopOnly();
    const data = useTypedLoaderData<typeof loader>();

    return desktopOnly === undefined ? (
        <Center w="100%" h="100%">
            <Loader />
        </Center>
    ) : (
        <Box pos="relative" w="100%" h="100%" p="sm">
            {desktopOnly ? (
                <ItemTable
                    data={data.items}
                    totalCount={data.totalCount}
                    statuses={data.statuses ?? []}
                    types={data.itemTypes ?? []}
                    locations={data.itemLocations ?? []}
                    tags={data.tags?.tags ?? []}
                />
            ) : (
                <ItemList data={data?.items} totalCount={data?.totalCount} />
            )}
        </Box>
    );
}
