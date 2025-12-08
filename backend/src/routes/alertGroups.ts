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

    // Get count of 5pm list markets with phone numbers
    const fivePmCount = await db.market.count({
      where: {
        list: "5pm",
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
        name: "3PM Feed",
        description: "3pm broadcast list",
        recipientCount: threePmCount,
        list: "3pm" as const,
      },
      {
        id: "5pm",
        name: "5PM Feed",
        description: "5pm broadcast list",
        recipientCount: fivePmCount,
        list: "5pm" as const,
      },
      {
        id: "6pm",
        name: "6PM Feed",
        description: "6pm broadcast list",
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
