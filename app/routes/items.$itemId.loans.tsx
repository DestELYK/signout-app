import {
  Accordion,
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
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";

// ? - Deciding whether to remove this page or /items/$itemId/timeline.tsx as they both display essentially the same information

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.itemId, "Expected params.itemId");

  const itemId = parseInt(params.itemId);

  if (itemId === undefined) {
    throw new Response(null, {
      status: 404,
    });
  }

  return typedjson({
    items: await prisma.loanedItem.findMany({
      where: { itemId: itemId },
      select: {
        loan: {
          select: {
            person: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                nickname: true,
                tags: true,
              },
            },
            tags: true,
          },
        },
        loanId: true,
        dateLoaned: true,
        dateReturned: true,
      },
      orderBy: [
        {
          dateReturned: {
            sort: "desc",
            nulls: "first",
          },
        },
        { dateLoaned: "desc" },
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

  const itemId = params.itemId;
  const loanId = params.loanId;

  return (
    <>
      {data &&
      (!navigation.location ||
        !navigation.location.pathname.endsWith("items")) ? (
        data.items.length > 0 ? (
          <>
            <Accordion
              onChange={(value) => {
                if (!value) {
                  navigate(`/items/${itemId}/loans`, { replace: true });
                } else {
                  navigate(`/items/${itemId}/loans/${value}`, {
                    replace: true,
                  });
                }
              }}
              value={loanId || null}
            >
              {data.items.map((item) => (
                <Accordion.Item
                  key={item.loanId}
                  value={item.loanId.toString()}
                >
                  <Accordion.Control
                    icon={<OutstandingBadge out={item.dateReturned === null} />}
                  >
                    <Text>
                      Loan #{item.loanId} - {formatFullName(item.loan.person)}
                    </Text>
                    <Text size="xs" fs="italic" c="dimmed">
                      {formatDate(item.dateLoaned)} (
                      {dateDiff({ date: item.dateLoaned })})
                    </Text>
                  </Accordion.Control>
                  <Accordion.Panel>
                    {loanId && loanId === item.loanId.toString() && <Outlet />}
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
