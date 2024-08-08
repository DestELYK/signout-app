import { Center, Loader, Stack, Text } from "@mantine/core";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { IconClipboard, IconInfoCircle, IconTimeline } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import DetailsPage from "~/DetailsPage";
import EditableNotes from "~/components/EditableNotes";
import InfoView from "~/components/base/InfoView";
import LastLoanView from "~/components/loans/LastLoanView";
import { handleError } from "~/lib/db.server";
import { useDesktopOnly } from "~/lib/hooks";
import { prisma } from "~/lib/prisma.server";
import { LastLoanData, itemWithTags } from "~/utils/types.server";
import { isNumeric } from "~/utils/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [
        {
            title: (data.item ? data.item.name : "No Item Found") + " | SJK Sign-Out",
        },
    ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.itemId, "Expected params.itemId");

    if (!isNumeric(params.itemId)) {
        throw new Response(null, { status: 404 });
    }

    try {
        const itemId = Number(params.itemId);

        // Get item details
        const item = await prisma.item.findFirstOrThrow({
            where: { id: itemId },
            include: { ...itemWithTags.include, _count: { select: { loans: true } } },
        });

        // Gather list of loaned items
        const loans = await prisma.loan.findMany({
            where: { items: { some: { itemId: itemId } } },
            orderBy: [{ createdDate: "desc" }],
            include: {
                tags: true,
                person: {
                    include: {
                        role: true,
                        tags: true,
                    },
                },
                items: {
                    include: {
                        item: {
                            include: {
                                tags: true,
                            },
                        },
                        returnedBy: {
                            include: {
                                tags: true,
                            },
                        },
                    },
                },
            },
        });

        const loanedItems = loans.flatMap((l) => l.items);

        const outstanding = loanedItems.filter((li) => !li.dateReturned) !== undefined;

        const lastLoan: LastLoanData | undefined =
            loans.length === 0
                ? undefined
                : {
                      id: loans[0].id,
                      person: {
                          id: loans[0].person.id,
                          firstName: loans[0].person.firstName,
                          lastName: loans[0].person.lastName,
                          nickname: loans[0].person.nickname,
                          role: loans[0].person.role,
                          tags: loans[0].person.tags,
                      },
                      items: loans[0].items.map((li) => ({
                          id: li.item.id,
                          name: li.item.name,
                          dateReturned: li.dateReturned,
                          returnedBy: li.returnedBy,
                      })),
                      tags: loans[0].tags,
                      dateLoaned: loans[0].createdDate,
                  };

        // Calculate average loan time
        let averageLoanTime = 0;
        loanedItems.forEach((li) => {
            if (li.dateReturned) {
                averageLoanTime += li.dateReturned.getTime() - li.dateLoaned.getTime();
            }
        });

        if (loanedItems.length > 0) {
            averageLoanTime /= loanedItems.length;
        }

        return typedjson({
            item: item,
            outstanding: outstanding,
            lastLoan: lastLoan,
            averageLoanTime: averageLoanTime,
            error: undefined,
        });
    } catch (e) {
        const error = handleError(e, "no item was returned");

        if (error) {
            return typedjson({ error: error, item: undefined });
        } else {
            throw new Response(String(e), {
                status: 500,
            });
        }
    }
};

export default function Page() {
    const data = useTypedLoaderData<typeof loader>();

    const desktopOnly = useDesktopOnly();

    const itemInfo = data.error ? (
        <Center w="100%" h="100%">
            <Text c="error">{data.error}</Text>
        </Center>
    ) : data.item === undefined ? (
        <Loader />
    ) : (
        <Stack w="100%" h="100%">
            <LastLoanView data={data.lastLoan} showItems={false} />

            <InfoView title="Notes" cardProps={{ h: undefined }}>
                <EditableNotes
                    //action={`/items/${data.item.id}`}
                    value={data.item.notes}
                    editable
                />
            </InfoView>
        </Stack>
    );

    return (
        <DetailsPage
            data={{
                overview: {
                    icon: <IconInfoCircle size={24} />,
                    label: "Overview",
                },
                loans: {
                    icon: <IconClipboard size={24} />,
                    label: "Loans",
                },
                timeline: {
                    icon: <IconTimeline size={24} />,
                    label: "Timeline",
                },
            }}
            tags={data.item?.tags ?? []}
            title={data.item?.name}
            desktopComponent={itemInfo}
        />
    );
}
