import { LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { prisma } from "~/lib/prisma.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.itemId, "Expected params.itemId");

  try {
    return await prisma.item.findFirstOrThrow({
      where: { id: parseInt(params.itemId) },
    });
  } catch (e) {
    console.log("Failed to find /items/$itemId", e);
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });
  }
}
