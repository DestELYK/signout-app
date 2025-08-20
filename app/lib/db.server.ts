/**
 * Database Error Handling Utilities
 *
 * Provides centralized error handling for database operations,
 * converting Prisma errors and validation errors into user-friendly
 * messages for the application.
 *
 *
 * @author Kyle Dunn
 */

import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

/**
 * Handles and formats database errors into user-friendly messages
 *
 * @param error - The error object to handle
 * @param suffix - Optional additional context for the error message
 * @returns Formatted error message string or undefined
 */
export function handleError(error: any, suffix?: string) {
  if ("message" in error) {
    console.error(error.message, ", ", suffix);
  }

  let errorMessage = "";

  // Handle different types of database and validation errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2025":
        errorMessage = `Failed to find data entry, ${suffix}`;
        break;
      case "P2002":
        errorMessage = `An item already exists with these values, ${suffix}`;
        break;
      default:
        errorMessage = `Unknown database error occurred, ${suffix}.`;
        break;
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    errorMessage = `Invalid data was provided, ${suffix}`;
  } else if (error instanceof ZodError) {
    errorMessage = `Invalid data was provided, ${suffix}`;
  } else if (error instanceof Error) {
    errorMessage = `${error.message}, ${suffix}`;
  }

  if (errorMessage) {
    return errorMessage;
  }
}
