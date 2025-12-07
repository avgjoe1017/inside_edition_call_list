/**
 * Bulk Import Routes
 * Handles CSV import for market data
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { AppType } from "../types";
import { db } from "../db";
import { parseCSV, type ParsedMarket } from "../lib/csvParser";
import { logEdit } from "../lib/editLogger";

const app = new Hono<AppType>();

/**
 * POST /api/import/csv
 * Import markets from CSV data
 */
const importCSVSchema = z.object({
  csvData: z.string().min(1, "CSV data is required"),
  dryRun: z.boolean().optional().default(false), // If true, don't actually import, just validate
});

app.post("/csv", zValidator("json", importCSVSchema), async (c) => {
  try {
    const { csvData, dryRun } = c.req.valid("json");
    const user = c.get("user");

    console.log(`📥 [Import] Starting CSV import (dryRun: ${dryRun})`);

    // Parse CSV
    let parsedMarkets: ParsedMarket[];
    try {
      parsedMarkets = parseCSV(csvData);
      console.log(`✅ [Import] Parsed ${parsedMarkets.length} markets from CSV`);
    } catch (error: any) {
      console.error("❌ [Import] CSV parsing error:", error);
      return c.json({ error: `Failed to parse CSV: ${error.message}` }, 400);
    }

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as Array<{ marketNumber: number; error: string }>,
    };

    // Process each market
    for (const market of parsedMarkets) {
      try {
        // Check if market exists by marketNumber
        const existing = await db.market.findUnique({
          where: { marketNumber: market.marketNumber },
          include: { phones: true },
        });

        if (dryRun) {
          // Just validate, don't import
          if (existing) {
            results.updated++;
          } else {
            results.created++;
          }
          continue;
        }

        if (existing) {
          // Update existing market
          const oldData = {
            name: existing.name,
            stationCallLetters: existing.stationCallLetters,
            airTime: existing.airTime,
            timezone: existing.timezone,
            list: existing.list,
          };

          // Update market fields
          await db.market.update({
            where: { id: existing.id },
            data: {
              name: market.name,
              stationCallLetters: market.stationCallLetters,
              airTime: market.airTime,
              timezone: market.timezone,
              list: market.list,
            },
          });

          // Log changes
          if (oldData.name !== market.name) {
            await logEdit({
              marketId: existing.id,
              field: "name",
              oldValue: oldData.name,
              newValue: market.name,
              editedBy: user?.email || "CSV Import",
            });
          }

          if (oldData.stationCallLetters !== market.stationCallLetters) {
            await logEdit({
              marketId: existing.id,
              field: "stationCallLetters",
              oldValue: oldData.stationCallLetters || null,
              newValue: market.stationCallLetters || null,
              editedBy: user?.email || "CSV Import",
            });
          }

          if (oldData.airTime !== market.airTime) {
            await logEdit({
              marketId: existing.id,
              field: "airTime",
              oldValue: oldData.airTime,
              newValue: market.airTime,
              editedBy: user?.email || "CSV Import",
            });
          }

          if (oldData.list !== market.list) {
            await logEdit({
              marketId: existing.id,
              field: "list",
              oldValue: oldData.list,
              newValue: market.list,
              editedBy: user?.email || "CSV Import",
            });
          }

          // Update phones
          const existingPhoneNumbers = new Set(existing.phones.map((p) => p.number));

          // Add new phones
          for (const phone of market.phones) {
            if (!existingPhoneNumbers.has(phone.number)) {
              await db.phoneNumber.create({
                data: {
                  label: phone.label,
                  number: phone.number,
                  isPrimary: phone.isPrimary,
                  marketId: existing.id,
                },
              });

              await logEdit({
                marketId: existing.id,
                field: "phoneNumber",
                oldValue: null,
                newValue: `${phone.label}: ${phone.number}`,
                editedBy: user?.email || "CSV Import",
              });
            }
          }

          // Update primary phone if needed
          const hasPrimary = existing.phones.some((p) => p.isPrimary);
          if (!hasPrimary && market.phones.length > 0) {
            // Set first phone as primary
            const firstPhone = market.phones[0];
            const phoneToUpdate = existing.phones.find((p) => p.number === firstPhone.number);
            if (phoneToUpdate) {
              await db.phoneNumber.updateMany({
                where: { marketId: existing.id },
                data: { isPrimary: false },
              });
              await db.phoneNumber.update({
                where: { id: phoneToUpdate.id },
                data: { isPrimary: true },
              });
            }
          }

          results.updated++;
        } else {
          // Create new market
          const newMarket = await db.market.create({
            data: {
              marketNumber: market.marketNumber,
              name: market.name,
              stationCallLetters: market.stationCallLetters,
              airTime: market.airTime,
              timezone: market.timezone,
              list: market.list,
              phones: {
                create: market.phones.map((phone, index) => ({
                  label: phone.label,
                  number: phone.number,
                  isPrimary: phone.isPrimary || index === 0, // First phone is primary
                })),
              },
            },
          });

          // Log creation
          await logEdit({
            marketId: newMarket.id,
            field: "market",
            oldValue: null,
            newValue: `Created market ${market.marketNumber}: ${market.name}`,
            editedBy: user?.email || "CSV Import",
          });

          results.created++;
        }
      } catch (error: any) {
        console.error(`❌ [Import] Error processing market ${market.marketNumber}:`, error);
        results.errors.push({
          marketNumber: market.marketNumber,
          error: error.message || "Unknown error",
        });
        results.skipped++;
      }
    }

    console.log(`✅ [Import] Import complete:`, results);

    return c.json({
      success: true,
      dryRun,
      results,
      message: dryRun
        ? `Validation complete: ${results.created} would be created, ${results.updated} would be updated`
        : `Import complete: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped`,
    });
  } catch (error: any) {
    console.error("❌ [Import] Import error:", error);
    return c.json({ error: `Import failed: ${error.message}` }, 500);
  }
});

export { app as importRouter };
