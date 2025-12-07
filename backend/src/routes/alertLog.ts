import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type { AppType } from "../types";
import { db } from "../db";
import {
  getAlertLogsResponseSchema,
  getAlertLogResponseSchema,
} from "../../../shared/contracts";

const app = new Hono<AppType>();

/**
 * GET /api/alert-logs
 * Get all alert logs grouped by date
 */
app.get("/", async (c) => {
  try {
    const logs = await db.alertLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group logs by date
    const groupedLogs: Record<string, typeof logs> = {};
    logs.forEach((log) => {
      const date = new Date(log.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Yesterday";
      } else {
        const formatted = date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        // toLocaleDateString always returns a string, but TypeScript doesn't know that
        // Use formatted if it exists, otherwise use ISO date string (which always exists)
        dateKey = formatted || date.toISOString().split("T")[0]!;
      }

      // dateKey is guaranteed to be a string at this point
      if (!groupedLogs[dateKey]) {
        groupedLogs[dateKey] = [];
      }
      groupedLogs[dateKey]!.push(log);
    });

    // Convert to format expected by frontend
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      alertType: log.alertType as "voice" | "text",
      message: log.message,
      audioUrl: log.audioUrl,
      audioDuration: log.audioDuration,
      recipientGroup: log.recipientGroup as "all" | "3pm" | "6pm",
      recipientCount: log.recipientCount,
      sentBy: log.sentBy,
      createdAt: log.createdAt.toISOString(),
    }));

    const formattedGroupedLogs: Record<string, typeof formattedLogs> = {};
    Object.entries(groupedLogs).forEach(([date, logsArray]) => {
      formattedGroupedLogs[date] = logsArray.map((log) => ({
        id: log.id,
        alertType: log.alertType as "voice" | "text",
        message: log.message,
        audioUrl: log.audioUrl,
        audioDuration: log.audioDuration,
        recipientGroup: log.recipientGroup as "all" | "3pm" | "6pm",
        recipientCount: log.recipientCount,
        sentBy: log.sentBy,
        createdAt: log.createdAt.toISOString(),
      }));
    });

    return c.json({
      logs: formattedLogs,
      groupedLogs: formattedGroupedLogs,
    });
  } catch (error) {
    console.error("Error fetching alert logs:", error);
    return c.json({ error: "Failed to fetch alert logs" }, 500);
  }
});

/**
 * GET /api/alert-logs/:id
 * Get a single alert log with all deliveries and stats
 */
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");

    const log = await db.alertLog.findUnique({
      where: { id },
    });

    if (!log) {
      return c.json({ error: "Alert log not found" }, 404);
    }

    const deliveries = await db.alertDelivery.findMany({
      where: { alertId: id },
      orderBy: {
        marketName: "asc",
      },
    });

    // Calculate stats
    const stats = {
      sent: deliveries.filter((d) => d.status === "sent").length,
      delivered: deliveries.filter((d) => d.status === "delivered").length,
      failed: deliveries.filter((d) => d.status === "failed").length,
      bounced: deliveries.filter((d) => d.status === "bounced").length,
    };

    return c.json({
      log: {
        id: log.id,
        alertType: log.alertType as "voice" | "text",
        message: log.message,
        audioUrl: log.audioUrl,
        audioDuration: log.audioDuration,
        recipientGroup: log.recipientGroup as "all" | "3pm" | "6pm",
        recipientCount: log.recipientCount,
        sentBy: log.sentBy,
        createdAt: log.createdAt.toISOString(),
      },
      deliveries: deliveries.map((d) => ({
        id: d.id,
        alertId: d.alertId,
        marketId: d.marketId,
        marketName: d.marketName,
        phoneNumber: d.phoneNumber,
        phoneLabel: d.phoneLabel,
        status: d.status as "sent" | "delivered" | "failed" | "bounced",
        errorReason: d.errorReason,
        sentAt: d.sentAt.toISOString(),
        deliveredAt: d.deliveredAt?.toISOString() ?? null,
        readAt: d.readAt?.toISOString() ?? null,
      })),
      stats,
    });
  } catch (error) {
    console.error("Error fetching alert log:", error);
    return c.json({ error: "Failed to fetch alert log" }, 500);
  }
});

export default app;
