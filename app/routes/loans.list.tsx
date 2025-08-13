import { Box, Center, Loader } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { LoanList } from "~/components/loans/LoanList";
import LoanTable from "~/components/tables/LoanTable";
import { useDesktopOnly } from "~/lib/hooks";
import { deleteLoans, getLoans } from "~/lib/loans.server";
import { getTags } from "~/lib/tags.server";
import { INITIAL_PAGE_SIZE, MAX_PAGE_SIZE } from "~/utils/consts";
import { parseNumber } from "~/utils/utils";

import { ActionFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const searchParams = new URL(request.url).searchParams;

    const pageSize = parseNumber(
        searchParams.get("limit"),
        INITIAL_PAGE_SIZE,
        undefined,
        MAX_PAGE_SIZE
    );

    const tags = await getTags({});

    return typedjson({
        ...(await getLoans(
            {
                query: searchParams.get("query") || searchParams.get("q") || undefined,
                statuses: searchParams.getAll("status") || undefined,
                personId: searchParams.get("personId") || undefined,
                itemIds: searchParams.getAll("itemId") || undefined,
                schoolId: searchParams.get("schoolId") || undefined,
                items: searchParams.get("items") || undefined,
                person: searchParams.get("person") || undefined,
                tags: searchParams.getAll("tag") || undefined,
            },
            undefined,
            pageSize,
            parseNumber(searchParams.get("page"), 0) * pageSize
        )),
        tags: tags.tags,
    });
};

export const action = async ({ request }: ActionFunctionArgs) => {
    switch (request.method) {
        case "DELETE":
            return typedjson(await deleteLoans(await request.json()));
        default:
            throw new Response("Method Not Allowed", { status: 405 });
    }
};

export default function Page() {
    const desktopOnly = useDesktopOnly();
    const loanData = useTypedLoaderData<typeof loader>();

    return desktopOnly === undefined ? (
        <Center w="100%" h="100%">
            <Loader />
        </Center>
    ) : (
        <Box pos="relative" w="100%" h="100%" p="sm">
            {desktopOnly ? (
                <LoanTable
                    data={loanData?.data}
                    totalCount={loanData?.totalCount}
                    tags={loanData.tags ?? []}
                />
            ) : (
                <LoanList data={loanData?.data} totalCount={loanData?.totalCount} />
            )}
        </Box>
    );
}
