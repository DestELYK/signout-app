import { Button, Flex, Group, Text } from "@mantine/core";
import { LoaderFunctionArgs } from "@remix-run/node";
import { Link, useParams } from "@remix-run/react";
import { IconArrowRight } from "@tabler/icons-react";
import {
  typedjson,
  useTypedLoaderData,
  useTypedRouteLoaderData,
} from "remix-typedjson";
import invariant from "tiny-invariant";
import QRCodePreview from "~/components/qrCode/QRCodePreview";
import TagGroup from "~/components/tags/TagGroup";
import { handleError } from "~/lib/db.server";
import { prisma } from "~/lib/prisma.server";
import { dateDiff, formatDate, formatFullName } from "~/utils/utils";
import { loader as loanLoader } from "./loans.$loanId";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.loanId, "Expected params.loanId");
  invariant(params.itemId, "Expected params.itemId");

  const loanId = parseInt(params.loanId);
  const itemId = parseInt(params.itemId);

  try {
    return typedjson({
      item: await prisma.loanedItem.findFirstOrThrow({
        where: { loanId: loanId, itemId: itemId },
        select: {
          item: {
            select: {
              qrCode: true,
              name: true,
              description: true,
              tags: true,
            },
          },
          returnedBy: {
            select: {
              id: true,
              qrCode: true,
              firstName: true,
              lastName: true,
              nickname: true,
              tags: true,
            },
          },
          itemId: true,
          dateLoaned: true,
          dateReturned: true,
        },
      }),
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
  const params = useParams();
  const loanData = useTypedRouteLoaderData<typeof loanLoader>(
    "routes/loans.$loanId"
  );
  const data = useTypedLoaderData<typeof loader>();

  const itemId = params.itemId;

  return data.error ? (
    <Text c="error">{data.error}</Text>
  ) : (
    data.item && (
      <>
        <Flex w="100%" direction="row" align="center" gap="sm" wrap="nowrap">
          <QRCodePreview qrCode={data.item.item.qrCode} scale={2} />
          <Flex w="100%" direction="column" gap="xs">
            <Text size="xs">
              Date Loaned:{" "}
              {formatDate(data.item.dateLoaned, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              <br />
              <span style={{ fontWeight: "bold" }}>
                ({dateDiff({ date: data.item.dateLoaned })})
              </span>
            </Text>
            {data.item.dateReturned && (
              <Text size="xs">
                Date Returned: {formatDate(data.item.dateReturned)}
                <br />
                <span style={{ fontWeight: "bold" }}>
                  ({dateDiff({ date: data.item.dateReturned })})
                </span>
              </Text>
            )}
            {data.item.returnedBy && (
              <Text size="xs">
                Returned By:{" "}
                <span
                  style={{
                    fontWeight: "bold",
                    color:
                      loanData?.loan?.person.id !== data.item.returnedBy.id
                        ? "red"
                        : undefined,
                  }}
                >
                  {formatFullName(data.item.returnedBy)}
                </span>
              </Text>
            )}
          </Flex>
        </Flex>
        <Group justify="end" mt="sm">
          <TagGroup
            tags={data.item.item.tags}
            categories={["Item Type"]}
            blacklist
            groupProps={{ justify: "end" }}
          />
          <Button
            variant="outline"
            rightSection={<IconArrowRight />}
            component={Link}
            to={`/items/${itemId}`}
          >
            View
          </Button>
        </Group>
      </>
    )
  );
}
