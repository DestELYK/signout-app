import {
  Accordion,
  Badge,
  Button,
  Center,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Link,
  Outlet,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import OutstandingBadge from "~/components/OutstandingBadge";
import { prisma } from "~/lib/prisma.server";
import { dateDiff, formatDate } from "~/utils/utils";

// ? - Deciding whether to remove this page or /items/$personId/timeline.tsx as they both display essentially the same information

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.personId, "Expected params.personId");

  const personId = parseInt(params.personId);

  if (personId === undefined) {
    throw new Response(null, {
      status: 404,
    });
  }

  return typedjson({
    loans: await prisma.loan.findMany({
      where: { personId: personId },
      select: {
        id: true,
        items: {
          select: {
            item: {
              select: {
                id: true,
                name: true,
                tags: true,
              },
            },
            dateLoaned: true,
            dateReturned: true,
            returnedById: true,
          },
        },
        createdDate: true,
        _count: {
          select: {
            items: {
              where: {
                dateReturned: null,
              },
            },
          },
        },
      },
      orderBy: [
        {
          createdDate: "desc",
        },
      ],
    }),
    error: undefined,
  });
};

export default function Page() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const params = useParams();
  const data = useTypedLoaderData<typeof loader>();

  const personId = params.personId;
  const loanId = params.loanId;

  return (
    <>
      {data &&
      (!navigation.location ||
        !navigation.location.pathname.endsWith("items")) ? (
        data.loans.length > 0 ? (
          <>
            <Accordion
              onChange={(value) => {
                if (!value) {
                  navigate(".", { replace: true, relative: "route" });
                } else {
                  navigate(`./${value}`, {
                    replace: true,
                    relative: "route",
                  });
                }
              }}
              value={loanId || null}
            >
              {data.loans.map((loan) => (
                <Accordion.Item key={loan.id} value={loan.id.toString()}>
                  <Accordion.Control
                    icon={
                      loan.items.find((i) =>
                        i.item.tags.find((t) => t.name === "Lost")
                      ) ? (
                        <Badge color="red">Lost Items</Badge>
                      ) : (
                        <OutstandingBadge out={loan._count.items > 0} />
                      )
                    }
                  >
                    <Text>
                      Loan #{loan.id} - {loan.items.length} item
                      {loan.items.length > 1 ? "s" : ""}
                    </Text>
                    <Text size="xs" fs="italic" c="dimmed">
                      {formatDate(loan.createdDate)}
                      <br />({dateDiff({ date: loan.createdDate })})
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    {loanId && loanId === loan.id.toString() && <Outlet />}
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </>
        ) : (
          <Center h="100%">
            <Stack>
              <Text ta="center">No loans have been created</Text>
              <Button component={Link} to="/loans?create=">
                Create a new loan here
              </Button>
            </Stack>
          </Center>
        )
      ) : (
        <Skeleton h={200} />
      )}
    </>
  );
}
