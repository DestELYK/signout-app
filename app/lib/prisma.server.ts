/**
 * Prisma database client configuration for server-side operations
 *
 * This module manages the Prisma client instance with environment-aware connection handling:
 * - Production: Single client instance for optimal performance
 * - Development: Global client with hot reload persistence and automatic connection
 *
 * @requires @prisma/client
 * @exports prisma - Configured Prisma client instance
 *
 * @module PrismaServer
 *
 * @author Kyle Dunn
 */

import { PrismaClient } from "@prisma/client";

/** Prisma client instance for database operations */
let prisma: PrismaClient;

/**
 * Global type declaration for development environment persistence
 * Prevents client recreation during hot reloads in development
 */
declare global {
  var prisma: PrismaClient;
}

// Environment-aware client configuration
if (process.env.NODE_ENV === "production") {
  // Production: Create single client instance
  prisma = new PrismaClient();
} else {
  // Development: Use global client for hot reload persistence
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
  // Ensure connection is established in development
  prisma.$connect();
}

/** Configured Prisma client instance for database operations */
export { prisma };
