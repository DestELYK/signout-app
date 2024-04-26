import {
  Accordion,
  Badge,
  Center,
  Flex,
  Loader,
  Skeleton,
} from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Outlet,
  useNavigate,
  useNavigation,
  useParams,
} from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.loanId, "Expected params.loanId");

  const loanId = parseInt(params.loanId);

  if (loanId === undefined) {
    throw new Response(null, {
      status: 404,
    });
  }

  return typedjson({
    items: await prisma.loanedItem.findMany({
      where: { loanId: loanId },
      select: {
        item: {
          select: {
            name: true,
            tags: true,
          },
        },
        itemId: true,
        dateLoaned: true,
        dateReturned: true,
      },
      orderBy: {
        dateReturned: {
          sort: "asc",
          nulls: "first",
        },
      },
    }),
    error: undefined,
  });
};

export default function Page() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const params = useParams();
  const data = useTypedLoaderData<typeof loader>();

  const loanId = params.loanId;
  const itemId = params.itemId;

  return (
    <Flex direction="column" w="100%" h="100%" gap="md">
      {data &&
      (!navigation.location ||
        !navigation.location.pathname.endsWith("items")) ? (
        <>
          <Accordion
            onChange={(value) => {
              if (!value) {
                navigate(`/loans/${loanId}/items`, { replace: true });
              } else {
                navigate(`/loans/${loanId}/items/${value}`, { replace: true });
              }
            }}
            value={itemId || null}
          >
            {data.items.map((item) => (
              <Accordion.Item key={item.itemId} value={item.itemId.toString()}>
                <Accordion.Control
                  icon={
                    <Badge color={item.dateReturned ? "green" : "red"}>
                      {item.dateReturned ? "Returned" : "Outstanding"}
                    </Badge>
                  }
                >
                  {item.item.name}
                </Accordion.Control>
                <Accordion.Panel>
                  {itemId && itemId === item.itemId.toString() ? (
                    <Outlet />
                  ) : (
                    navigation.location &&
                    !navigation.location.pathname.endsWith("/items") && (
                      <Center w="100%">
                        <Loader />
                      </Center>
                    )
                  )}
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </>
      ) : (
        <Skeleton h={200} />
      )}
    </Flex>
  );
}
