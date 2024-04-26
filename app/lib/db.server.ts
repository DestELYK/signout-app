import { Prisma } from "@prisma/client";

export function handleError(error: any, suffix?: string) {
  console.error(error);

  let errorMessage = "";
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2025":
        errorMessage = `Failed to find item, ${suffix}`;
        break;
      case "P2002":
        errorMessage = `An item already exists with these values, ${suffix}`;
        break;
      default:
        errorMessage = `Unknown database error occurred, ${suffix}.`;
        break;
    }
  } else if (error instanceof Error) {
    errorMessage = `Unknown error occurred: ${error.message}, ${suffix}`;
  }

  if (errorMessage) {
    return errorMessage;
  } else {
    return null;
  }
}