/**
 * Test CSV Parser
 * Quick test script to verify CSV parsing works correctly
 */

import { readFileSync } from "node:fs";
import { parseCSV } from "../src/lib/csvParser";

const csvPath = process.argv[2] || "../../data/ie data as of 12-6.csv";

console.log(`📖 Reading CSV file: ${csvPath}`);

try {
  const csvData = readFileSync(csvPath, "utf-8");
  console.log(`✅ File read successfully (${csvData.length} characters)`);

  console.log("\n🔍 Parsing CSV...");
  const markets = parseCSV(csvData);

  console.log(`\n✅ Parsed ${markets.length} markets\n`);

  // Show first few markets as examples
  console.log("📋 Sample markets:");
  markets.slice(0, 5).forEach((market) => {
    console.log(`\n  Market #${market.marketNumber}: ${market.name}`);
    console.log(`    Station: ${market.stationCallLetters || "N/A"}`);
    console.log(`    Air Time: ${market.airTime} (${market.timezone})`);
    console.log(`    List: ${market.list}`);
    console.log(`    Phones: ${market.phones.length}`);
    market.phones.forEach((phone, i) => {
      console.log(`      ${i + 1}. ${phone.label}: ${phone.number} ${phone.isPrimary ? "(Primary)" : ""}`);
    });
  });

  // Statistics
  console.log("\n📊 Statistics:");
  console.log(`  Total markets: ${markets.length}`);
  console.log(`  3pm list: ${markets.filter((m) => m.list === "3pm").length}`);
  console.log(`  6pm list: ${markets.filter((m) => m.list === "6pm").length}`);
  console.log(`  Markets with station call letters: ${markets.filter((m) => m.stationCallLetters).length}`);
  
  const totalPhones = markets.reduce((sum, m) => sum + m.phones.length, 0);
  const avgPhones = (totalPhones / markets.length).toFixed(1);
  console.log(`  Total phone numbers: ${totalPhones}`);
  console.log(`  Average phones per market: ${avgPhones}`);

  // Check for issues
  const marketsWithoutPhones = markets.filter((m) => m.phones.length === 0);
  if (marketsWithoutPhones.length > 0) {
    console.log(`\n⚠️  Warning: ${marketsWithoutPhones.length} markets have no phone numbers`);
  }

  const marketsWithoutPrimary = markets.filter((m) => !m.phones.some((p) => p.isPrimary));
  if (marketsWithoutPrimary.length > 0) {
    console.log(`\n⚠️  Warning: ${marketsWithoutPrimary.length} markets have no primary phone`);
  }

  console.log("\n✅ CSV parsing test complete!\n");
} catch (error: any) {
  console.error("❌ Error:", error.message);
  console.error(error.stack);
  process.exit(1);
}
