/**
 * Alert Groups Routes
 * Returns recipient groups with dynamic counts from the database
 */

import { Hono } from "hono";
import type { AppType } from "../types";
import { db } from "../db";

const app = new Hono<AppType>();

/**
 * GET /api/alert-groups
 * Get all recipient groups with live counts from the database
 */
app.get("/", async (c) => {
  try {
    // Get total count of all markets with phone numbers
    const allCount = await db.market.count({
      where: {
        phones: {
          some: {},
        },
      },
    });

    // Get count of 3pm list markets with phone numbers
    const threePmCount = await db.market.count({
      where: {
        list: "3pm",
        phones: {
          some: {},
        },
      },
    });

    // Get count of 6pm list markets with phone numbers
    const sixPmCount = await db.market.count({
      where: {
        list: "6pm",
        phones: {
          some: {},
        },
      },
    });

    const groups = [
      {
        id: "all",
        name: "All Stations",
        description: "Send to all stations",
        recipientCount: allCount,
        list: "all" as const,
      },
      {
        id: "3pm",
        name: "3:30 Feed",
        description: "3:30pm broadcast list",
        recipientCount: threePmCount,
        list: "3pm" as const,
      },
      {
        id: "6pm",
        name: "6:00 Feed",
        description: "6:00pm broadcast list",
        recipientCount: sixPmCount,
        list: "6pm" as const,
      },
    ];

    return c.json({ groups });
  } catch (error) {
    console.error("Error fetching alert groups:", error);
    return c.json({ error: "Failed to fetch alert groups" }, 500);
  }
});

export { app as alertGroupsRouter };
