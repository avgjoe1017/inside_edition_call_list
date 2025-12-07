/**
 * CSV Import Script
 * Imports market data from CSV file into the database
 * 
 * Usage:
 *   bun run scripts/import-csv.ts <path-to-csv-file>
 *   bun run scripts/import-csv.ts ../data/ie\ data\ as\ of\ 12-6.csv
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "../src/db";
import { parseCSV, type ParsedMarket } from "../src/lib/csvParser";
import { logEdit } from "../src/lib/editLogger";

async function main() {
  // Get CSV file path from command line args
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("❌ Error: CSV file path is required");
    console.log("Usage: bun run scripts/import-csv.ts <path-to-csv-file>");
    process.exit(1);
  }

  // Read CSV file
  let csvData: string;
  try {
    csvData = readFileSync(csvPath, "utf-8");
    console.log(`✅ Read CSV file: ${csvPath}`);
  } catch (error: any) {
    console.error(`❌ Error reading CSV file: ${error.message}`);
    process.exit(1);
  }

  // Parse CSV
  let parsedMarkets: ParsedMarket[];
  try {
    parsedMarkets = parseCSV(csvData);
    console.log(`✅ Parsed ${parsedMarkets.length} markets from CSV`);
  } catch (error: any) {
    console.error(`❌ Error parsing CSV: ${error.message}`);
    process.exit(1);
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
            editedBy: "CSV Import Script",
          });
        }

        if (oldData.stationCallLetters !== market.stationCallLetters) {
          await logEdit({
            marketId: existing.id,
            field: "stationCallLetters",
            oldValue: oldData.stationCallLetters || null,
            newValue: market.stationCallLetters || null,
            editedBy: "CSV Import Script",
          });
        }

        if (oldData.airTime !== market.airTime) {
          await logEdit({
            marketId: existing.id,
            field: "airTime",
            oldValue: oldData.airTime,
            newValue: market.airTime,
            editedBy: "CSV Import Script",
          });
        }

        if (oldData.list !== market.list) {
          await logEdit({
            marketId: existing.id,
            field: "list",
            oldValue: oldData.list,
            newValue: market.list,
            editedBy: "CSV Import Script",
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
              editedBy: "CSV Import Script",
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
        console.log(`✅ Updated market ${market.marketNumber}: ${market.name}`);
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
          editedBy: "CSV Import Script",
        });

        results.created++;
        console.log(`✅ Created market ${market.marketNumber}: ${market.name}`);
      }
    } catch (error: any) {
      console.error(`❌ Error processing market ${market.marketNumber}:`, error);
      results.errors.push({
        marketNumber: market.marketNumber,
        error: error.message || "Unknown error",
      });
      results.skipped++;
    }
  }

  // Print summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Import Summary:");
  console.log(`  ✅ Created: ${results.created}`);
  console.log(`  🔄 Updated: ${results.updated}`);
  console.log(`  ⚠️  Skipped: ${results.skipped}`);
  if (results.errors.length > 0) {
    console.log(`  ❌ Errors: ${results.errors.length}`);
    results.errors.forEach((err) => {
      console.log(`     - Market ${err.marketNumber}: ${err.error}`);
    });
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
