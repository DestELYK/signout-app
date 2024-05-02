import {
  Button,
  Center,
  Flex,
  Group,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { IconArrowRight } from "@tabler/icons-react";
import {
  typedjson,
  useTypedLoaderData,
  useTypedRouteLoaderData,
} from "remix-typedjson";
import invariant from "tiny-invariant";
import { QRCodeWithComponent } from "~/components/qrCode/QRCodeWithComponent";
import TagGroup from "~/components/tags/TagGroup";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import { loader as personLoader } from "./people.$personId";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.loanId, "Expected params.loanId");

  const loanId = parseInt(params.loanId);

  try {
    return typedjson({
      loan: await prisma.loan.findFirstOrThrow({
        where: { id: loanId },
        select: {
          items: {
            select: {
              item: {
                select: {
                  id: true,
                  qrCode: true,
                  name: true,
                },
              },
              returnedBy: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  nickname: true,
                },
              },
              dateLoaned: true,
              dateReturned: true,
            },
          },
          tags: true,
        },
      }),
      error: undefined,
    });
  } catch (e) {
    const error = handleError(e, "no item was returned");

    if (error) {
      return typedjson({ error: error, loan: undefined });
    } else {
      throw new Response(String(e), {
        status: 500,
      });
    }
  }
};

export default function Page() {
  const params = useParams();
  const personData = useTypedRouteLoaderData<typeof personLoader>(
    "routes/people.$personId"
  );
  const data = useTypedLoaderData<typeof loader>();

  const personId = params.personId;
  const loanId = params.loanId;

  return data.error ? (
    <Text c="error">{data.error}</Text>
  ) : data.loan && personData?.person ? (
    <>
      <Flex w="100%" direction="row" align="center" gap="sm" wrap="nowrap">
        <>
          <Flex w="100%" direction="column" gap="xs">
            {data.loan.items.map((item) => (
              <QRCodeWithComponent key={item.item.id} qrCode={item.item.qrCode}>
                <Stack gap={0}>
                  <Text>{item.item.name}</Text>
                  <Text size="xs">
                    Date Loaned: {formatDate(item.dateLoaned)}
                    <br />
                    <span style={{ fontWeight: "bold" }}>
                      ({dateDiff({ date: item.dateLoaned })})
                    </span>
                  </Text>
                  {item.dateReturned && (
                    <Text size="xs">
                      Date Returned: {formatDate(item.dateReturned)}
                      <br />
                      <span style={{ fontWeight: "bold" }}>
                        ({dateDiff({ date: item.dateReturned })})
                      </span>
                    </Text>
                  )}
                  {item.returnedBy &&
                    item.returnedBy.id.toString() !== personId && (
                      <Text size="xs">
                        Returned By:{" "}
                        <span
                          style={{
                            fontWeight: "bold",
                            color: "red",
                          }}
                        >
                          {formatFullName(item.returnedBy)}
                        </span>
                      </Text>
                    )}
                </Stack>
              </QRCodeWithComponent>
            ))}
          </Flex>
        </>
      </Flex>
      <Group justify="end" mt="sm">
        <TagGroup tags={data.loan.tags} />
        <Button
          variant="outline"
          rightSection={<IconArrowRight />}
          component={Link}
          to={`/loans/${loanId}`}
        >
          View
        </Button>
      </Group>
    </>
  ) : (
    <Center h="100%">
      <Loader />
    </Center>
  );
}
