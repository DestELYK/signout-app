import { Badge, Center, Stack, Text } from "@mantine/core";
import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { IconClipboard, IconInfoCircle, IconTimeline } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import DetailsPage from "~/DetailsPage";
import EditableNotes from "~/components/EditableNotes";
import InfoView from "~/components/base/InfoView";
import LastLoanView from "~/components/loans/LastLoanView";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";
import { LastLoanData, personWithTags } from "~/utils/types.server";
import { formatFullName, isNumeric } from "~/utils/utils";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
    return [
        {
            title:
                (data.person ? formatFullName(data.person) : "No Person Found") + " | SJK Sign-Out",
        },
    ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
    invariant(params.personId, "Expected params.personId");

    if (!isNumeric(params.personId)) {
        throw new Response(null, { status: 404 });
    }

    try {
        const person = await prisma.person.findFirstOrThrow({
            where: { id: Number(params.personId) },
            include: personWithTags.include,
        });

        // Gather list of loaned items
        const loans = await prisma.loan.findMany({
            where: {
                personId: Number(params.personId),
            },
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

        const outstandingItems = loanedItems.filter((li) => !li.dateReturned).length;

        const lostItems = loanedItems.filter((li) =>
            li.item.tags.some((t) => t.name === "Lost")
        ).length;

        const lastLoan: LastLoanData | undefined =
            loans.length === 0
                ? undefined
                : {
                      id: loans[0].id,
                      tags: loans[0].tags,
                      dateLoaned: loans[0].createdDate,
                      person: loans[0].person,
                      items: loans[0].items.map((i) => ({
                          id: i.item.id,
                          name: i.item.name,
                          dateReturned: i.dateReturned,
                          returnedBy: i.returnedBy,
                      })),
                  };

        // Calculate average loan time
        let averageReturnTime = 0;
        loanedItems.forEach((li) => {
            if (li.dateReturned) {
                averageReturnTime += li.dateReturned.getTime() - li.dateLoaned.getTime();
            }
        });

        if (loanedItems.length > 0) {
            averageReturnTime /= loanedItems.length;
        }
        return typedjson({
            person: person,
            outstandingItems: outstandingItems,
            lostItems: lostItems,
            totalItems: loanedItems.length,
            averageReturnTime: averageReturnTime,
            lastLoan: lastLoan,
            error: undefined,
        });
    } catch (e) {
        const error = handleError(e, "no item was returned");

        if (error) {
            return typedjson({
                error: error,
                person: undefined,
                outstanding: undefined,
                lostItems: undefined,
                totalItems: undefined,
                averageReturnTime: undefined,
                lastLoan: undefined,
            });
        } else {
            throw new Response(String(e), {
                status: 500,
            });
        }
    }
};

export default function Page() {
    const data = useTypedLoaderData<typeof loader>();

    const personView = data.error ? (
        <Center w="100%" h="100%">
            <Text c="error">{data.error}</Text>
        </Center>
    ) : data.person === undefined ? (
        <Center w="100%" h="100%">
            <Text>No person found</Text>
        </Center>
    ) : (
        <Stack w="100%">
            <LastLoanView w="100%" data={data.lastLoan} showPerson={false} />

            <InfoView title="Notes" cardProps={{ h: undefined }}>
                <EditableNotes
                    //action={`/items/${data.item.id}`}
                    value={data.person.notes}
                    editable
                />
            </InfoView>
        </Stack>
    );

    return data.error != undefined ? (
        <Center h="100%">
            <Text c="error">{data.error}</Text>
        </Center>
    ) : (
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
            topSection={
                <Badge color={data.person.role.color} variant="outline" autoContrast>
                    {data.person.role.name}
                </Badge>
            }
            tags={data.person.tags}
            desktopComponent={personView}
            title={formatFullName(data.person)}
        />
    );
}
