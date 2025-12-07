// ============================================
// Prisma Database Client
// ============================================
// This is a singleton instance of the Prisma client
// Used throughout the application for database operations
//
// Usage:
//   import { db } from "./db";
//   const users = await db.user.findMany();
//
// The Prisma schema is located at prisma/schema.prisma
// After modifying the schema, run: bunx prisma generate
import { PrismaClient } from "../generated/prisma";

// Log database connection info (without exposing credentials)
const dbUrl = process.env.DATABASE_URL || "";
const isPostgres = dbUrl.startsWith("postgres");
console.log(`[DB] Database type: ${isPostgres ? "PostgreSQL" : "SQLite"}`);
console.log(`[DB] Connection configured: ${dbUrl ? "Yes" : "No"}`);

const prismaClient = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Connection test on startup
(async () => {
  try {
    await prismaClient.$connect();
    console.log("[DB] ✅ Database connected successfully");
  } catch (error) {
    console.error("[DB] ❌ Database connection failed:", error);
  }
})();

export const db = prismaClient;
