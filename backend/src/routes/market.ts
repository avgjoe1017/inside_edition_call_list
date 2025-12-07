import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { db as prisma } from "../db";
import type { AppType } from "../types";
import { logEdit } from "../lib/editLogger";
import { updateMarketRequestSchema } from "../../../shared/contracts";

// Context includes user and session from Better Auth middleware
const app = new Hono<AppType>();

// GET /api/markets - Get all markets with phones
app.get("/", async (c) => {
  try {
    const markets = await prisma.market.findMany({
      include: {
        phones: true,
      },
      orderBy: {
        marketNumber: "asc",
      },
    });

    return c.json({ markets });
  } catch (error) {
    console.error("Error fetching markets:", error);
    return c.json({ error: "Failed to fetch markets" }, 500);
  }
});

// GET /api/markets/:id - Get single market with phones
app.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        phones: true,
      },
    });

    if (!market) {
      return c.json({ error: "Market not found" }, 404);
    }

    return c.json(market);
  } catch (error) {
    console.error("Error fetching market:", error);
    return c.json({ error: "Failed to fetch market" }, 500);
  }
});

// PATCH /api/markets/:marketId/phones/:phoneId/primary - Set phone as primary
app.patch("/:marketId/phones/:phoneId/primary", async (c) => {
  try {
    const marketId = c.req.param("marketId");
    const phoneId = c.req.param("phoneId");

    // Verify market exists
    const market = await prisma.market.findUnique({
      where: { id: marketId },
      include: { phones: true },
    });

    if (!market) {
      return c.json({ error: "Market not found" }, 404);
    }

    // Verify phone belongs to this market
    const phone = market.phones.find((p) => p.id === phoneId);
    if (!phone) {
      return c.json({ error: "Phone not found" }, 404);
    }

    // Get old primary phone for logging
    const oldPrimary = market.phones.find((p) => p.isPrimary);

    // Update all phones for this market - set isPrimary false for all
    await prisma.phoneNumber.updateMany({
      where: { marketId },
      data: { isPrimary: false },
    });

    // Set the selected phone as primary
    await prisma.phoneNumber.update({
      where: { id: phoneId },
      data: { isPrimary: true },
    });

    // Log the change
    const user = c.get("user");
    await logEdit({
      marketId,
      field: "primaryPhone",
      oldValue: oldPrimary ? `${oldPrimary.label}: ${oldPrimary.number}` : null,
      newValue: `${phone.label}: ${phone.number}`,
      editedBy: user?.email || null,
    });

    // Fetch and return updated market
    const updatedMarket = await prisma.market.findUnique({
      where: { id: marketId },
      include: { phones: true },
    });

    return c.json(updatedMarket);
  } catch (error) {
    console.error("Error updating primary phone:", error);
    return c.json({ error: "Failed to update primary phone" }, 500);
  }
});

// PUT /api/markets/:id - Update market details
app.put("/:id", zValidator("json", updateMarketRequestSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const { name, stationCallLetters, airTime, timezone, list, phones } = c.req.valid("json");

    console.log("📝 UPDATE MARKET REQUEST:", {
      id,
      name,
      stationCallLetters: stationCallLetters,
      stationCallLettersType: typeof stationCallLetters,
      airTime,
      timezone,
      list,
      phonesCount: phones?.length
    });

    // Get current market state for logging
    const currentMarket = await prisma.market.findUnique({
      where: { id },
      include: { phones: true },
    });

    if (!currentMarket) {
      return c.json({ error: "Market not found" }, 404);
    }

    const user = c.get("user");

    // Log market field changes
    if (name !== currentMarket.name) {
      await logEdit({
        marketId: id,
        field: "name",
        oldValue: currentMarket.name,
        newValue: name,
        editedBy: user?.email || null,
      });
    }

    if (stationCallLetters !== currentMarket.stationCallLetters) {
      await logEdit({
        marketId: id,
        field: "stationCallLetters",
        oldValue: currentMarket.stationCallLetters || null,
        newValue: stationCallLetters || null,
        editedBy: user?.email || null,
      });
    }

    if (airTime !== currentMarket.airTime) {
      await logEdit({
        marketId: id,
        field: "airTime",
        oldValue: currentMarket.airTime,
        newValue: airTime,
        editedBy: user?.email || null,
      });
    }

    if (timezone !== currentMarket.timezone) {
      await logEdit({
        marketId: id,
        field: "timezone",
        oldValue: currentMarket.timezone || null,
        newValue: timezone || null,
        editedBy: user?.email || null,
      });
    }

    if (list !== currentMarket.list) {
      await logEdit({
        marketId: id,
        field: "list",
        oldValue: currentMarket.list || null,
        newValue: list || null,
        editedBy: user?.email || null,
      });
    }

    // Update market
    const updatedMarket = await prisma.market.update({
      where: { id },
      data: {
        name,
        stationCallLetters,
        airTime,
        timezone,
        list,
      },
    });

    // Handle phone updates if provided
    if (phones && Array.isArray(phones)) {
      // Delete removed phones (phones that exist in DB but not in the update)
      const existingPhones = await prisma.phoneNumber.findMany({
        where: { marketId: id },
      });

      const phoneIdsInUpdate = phones.filter(p => p.id).map(p => p.id);
      const phonesToDelete = existingPhones.filter(p => !phoneIdsInUpdate.includes(p.id));

      for (const phone of phonesToDelete) {
        await prisma.phoneNumber.delete({ where: { id: phone.id } });
        await logEdit({
          marketId: id,
          field: "phoneNumber",
          oldValue: `${phone.label}: ${phone.number}`,
          newValue: null,
          editedBy: user?.email || null,
        });
      }

      // Update or create phones
      for (const phone of phones) {
        if (phone.id) {
          // Check if phone was modified
          const oldPhone = existingPhones.find(p => p.id === phone.id);
          if (oldPhone && (oldPhone.label !== phone.label || oldPhone.number !== phone.number)) {
            await logEdit({
              marketId: id,
              field: "phoneNumber",
              oldValue: `${oldPhone.label}: ${oldPhone.number}`,
              newValue: `${phone.label}: ${phone.number}`,
              editedBy: user?.email || null,
            });
          }

          // Update existing phone
          await prisma.phoneNumber.update({
            where: { id: phone.id },
            data: {
              label: phone.label,
              number: phone.number,
              isPrimary: phone.isPrimary,
            },
          });
        } else {
          // Create new phone
          await prisma.phoneNumber.create({
            data: {
              label: phone.label,
              number: phone.number,
              isPrimary: phone.isPrimary,
              marketId: id,
            },
          });
          await logEdit({
            marketId: id,
            field: "phoneNumber",
            oldValue: null,
            newValue: `${phone.label}: ${phone.number}`,
            editedBy: user?.email || null,
          });
        }
      }
    }

    // Fetch and return updated market with phones
    const finalMarket = await prisma.market.findUnique({
      where: { id },
      include: { phones: true },
    });

    return c.json(finalMarket);
  } catch (error) {
    console.error("Error updating market:", error);
    return c.json({ error: "Failed to update market" }, 500);
  }
});

// DELETE /api/markets/:marketId/phones/:phoneId - Delete a phone number
app.delete("/:marketId/phones/:phoneId", async (c) => {
  try {
    const marketId = c.req.param("marketId");
    const phoneId = c.req.param("phoneId");

    // Check if this is the last phone
    const phoneCount = await prisma.phoneNumber.count({
      where: { marketId },
    });

    if (phoneCount <= 1) {
      return c.json({ error: "Cannot delete the last phone number" }, 400);
    }

    // Get phone before deleting for logging
    const phone = await prisma.phoneNumber.findUnique({
      where: { id: phoneId },
    });

    await prisma.phoneNumber.delete({
      where: { id: phoneId },
    });

    // Log the deletion
    if (phone) {
      const user = c.get("user");
      await logEdit({
        marketId,
        field: "phoneNumber",
        oldValue: `${phone.label}: ${phone.number}`,
        newValue: null,
        editedBy: user?.email || null,
      });
    }

    // Fetch and return updated market
    const updatedMarket = await prisma.market.findUnique({
      where: { id: marketId },
      include: { phones: true },
    });

    return c.json(updatedMarket);
  } catch (error) {
    console.error("Error deleting phone:", error);
    return c.json({ error: "Failed to delete phone" }, 500);
  }
});

export { app as marketRouter };
