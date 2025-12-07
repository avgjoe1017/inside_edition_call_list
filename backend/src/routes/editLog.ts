import { Hono } from "hono";
import { db as prisma } from "../db";
import type { AppType } from "../types";

const app = new Hono<AppType>();

// GET /api/edit-logs - Get all edit logs ordered by most recent
app.get("/", async (c) => {
  try {
    const logs = await prisma.editLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group by date for frontend display
    const groupedLogs: Record<string, typeof logs> = {};

    logs.forEach((log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      if (date) {
        if (!groupedLogs[date]) {
          groupedLogs[date] = [];
        }
        groupedLogs[date].push(log);
      }
    });

    return c.json({ logs, groupedLogs });
  } catch (error) {
    console.error("Error fetching edit logs:", error);
    return c.json({ error: "Failed to fetch edit logs" }, 500);
  }
});

// GET /api/edit-logs/market/:marketId - Get edit logs for specific market
app.get("/market/:marketId", async (c) => {
  try {
    const marketId = c.req.param("marketId");

    const logs = await prisma.editLog.findMany({
      where: { marketId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({ logs });
  } catch (error) {
    console.error("Error fetching market edit logs:", error);
    return c.json({ error: "Failed to fetch market edit logs" }, 500);
  }
});

export { app as editLogRouter };
