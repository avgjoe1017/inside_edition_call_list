import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { db } from "../db";
import type { AppType } from "../types";

const app = new Hono<AppType>();

// POST /api/call-logs - Log a call action
const createCallLogSchema = z.object({
  marketId: z.string(),
  marketName: z.string(),
  phoneNumber: z.string(),
  phoneLabel: z.string(),
  action: z.enum(["viewed", "called"]),
  calledBy: z.string().nullable().optional(),
});

app.post("/", zValidator("json", createCallLogSchema), async (c) => {
  try {
    const data = c.req.valid("json");

    const callLog = await db.callLog.create({
      data: {
        marketId: data.marketId,
        marketName: data.marketName,
        phoneNumber: data.phoneNumber,
        phoneLabel: data.phoneLabel,
        action: data.action,
        calledBy: data.calledBy || null,
      },
    });

    return c.json({ success: true, callLog });
  } catch (error) {
    console.error("Error creating call log:", error);
    return c.json({ error: "Failed to log call" }, 500);
  }
});

// GET /api/call-logs - Get call logs with optional filters
app.get("/", async (c) => {
  try {
    const marketId = c.req.query("marketId");
    const action = c.req.query("action");
    const limit = parseInt(c.req.query("limit") || "100");

    const where: any = {};
    if (marketId) where.marketId = marketId;
    if (action) where.action = action;

    const logs = await db.callLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Group by date for easier display
    const groupedLogs: Record<string, typeof logs> = {};
    logs.forEach((log) => {
      const dateKey = log.createdAt.toISOString().split("T")[0];
      if (dateKey) {
        if (!groupedLogs[dateKey]) {
          groupedLogs[dateKey] = [];
        }
        groupedLogs[dateKey].push(log);
      }
    });

    return c.json({ logs, groupedLogs });
  } catch (error) {
    console.error("Error fetching call logs:", error);
    return c.json({ error: "Failed to fetch call logs" }, 500);
  }
});

// GET /api/call-logs/stats - Get call statistics
app.get("/stats", async (c) => {
  try {
    const totalCalls = await db.callLog.count({
      where: { action: "called" },
    });

    const totalViews = await db.callLog.count({
      where: { action: "viewed" },
    });

    const topMarkets = await db.$queryRaw<
      Array<{ marketName: string; count: bigint }>
    >`
      SELECT marketName, COUNT(*) as count
      FROM call_log
      WHERE action = 'called'
      GROUP BY marketName
      ORDER BY count DESC
      LIMIT 10
    `;

    return c.json({
      totalCalls,
      totalViews,
      topMarkets: topMarkets.map((m) => ({
        marketName: m.marketName,
        count: Number(m.count),
      })),
    });
  } catch (error) {
    console.error("Error fetching call stats:", error);
    return c.json({ error: "Failed to fetch call stats" }, 500);
  }
});

export default app;
