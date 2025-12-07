/**
 * CSV Parser for Market Data
 * Parses the INSIDE EDITION market data CSV format
 */

import { validateAndFormatPhone } from "./phoneValidator";

export interface CSVMarketRow {
  Feed: string; // "3:00 PM" or "6:00 PM"
  Rank: string; // Market rank/number
  Station: string; // Station call letters (e.g., "WCBS-TV")
  City: string; // Market name/city
  "Air Time": string; // Local air time
  "ET Time": string; // Eastern time
  "Main Name": string; // First phone label
  "Main Phone #": string; // First phone number
  "#2 Name": string; // Second phone label
  "Phone #2": string; // Second phone number
  "#3 Name": string; // Third phone label
  "Phone #3": string; // Third phone number
  "#4 Name": string; // Fourth phone label
  "Phone #4": string; // Fourth phone number
}

export interface ParsedMarket {
  marketNumber: number;
  name: string;
  stationCallLetters: string | null;
  airTime: string;
  timezone: string;
  list: "3pm" | "6pm";
  phones: Array<{
    label: string;
    number: string;
    isPrimary: boolean;
  }>;
}

/**
 * Parse a single CSV row into a market object
 */
export function parseCSVRow(row: CSVMarketRow): ParsedMarket | null {
  // Skip empty rows or header rows
  if (!row.Rank || row.Rank === "Rank" || !row.City) {
    return null;
  }

  const marketNumber = parseInt(row.Rank.trim(), 10);
  if (isNaN(marketNumber)) {
    return null;
  }

  // Extract feed/list (3:00 PM = "3pm", 6:00 PM = "6pm")
  const feed = row.Feed?.trim() || "";
  const list = feed.includes("3:00") || feed.includes("3:00 PM") ? "3pm" : "6pm";

  // Extract station call letters (remove "-TV", "-DT", etc. for cleaner display)
  let stationCallLetters = row.Station?.trim() || null;
  if (stationCallLetters) {
    // Remove common suffixes but keep the base call letters
    stationCallLetters = stationCallLetters.replace(/-TV$|-DT$|-DT\d*$/i, "").trim();
    // Handle cases like "KING / KONG" - take first part
    if (stationCallLetters.includes("/")) {
      stationCallLetters = stationCallLetters.split("/")[0].trim();
    }
    if (stationCallLetters === "") {
      stationCallLetters = null;
    }
  }

  // Parse air time - format like "7:00 PM" or "7:00PM & 11:00PM"
  const airTime = row["Air Time"]?.trim() || row["ET Time"]?.trim() || "10:00 PM";
  
  // Determine timezone from air time and ET time
  // If air time matches ET time, it's EST
  // Otherwise, calculate timezone difference
  const timezone = determineTimezone(row["Air Time"], row["ET Time"]);

  // Parse phone numbers
  const phones: Array<{ label: string; number: string; isPrimary: boolean }> = [];

  // Main phone
  if (row["Main Phone #"]?.trim()) {
    const phoneNumber = cleanPhoneNumber(row["Main Phone #"].trim());
    if (phoneNumber) {
      const validation = validateAndFormatPhone(phoneNumber);
      if (validation.isValid && validation.formatted) {
        phones.push({
          label: row["Main Name"]?.trim() || "Main Station",
          number: validation.formatted,
          isPrimary: true,
        });
      }
    }
  }

  // Phone #2
  if (row["Phone #2"]?.trim()) {
    const phoneNumber = cleanPhoneNumber(row["Phone #2"].trim());
    if (phoneNumber) {
      const validation = validateAndFormatPhone(phoneNumber);
      if (validation.isValid && validation.formatted) {
        phones.push({
          label: row["#2 Name"]?.trim() || "Phone #2",
          number: validation.formatted,
          isPrimary: false,
        });
      }
    }
  }

  // Phone #3
  if (row["Phone #3"]?.trim()) {
    const phoneNumber = cleanPhoneNumber(row["Phone #3"].trim());
    if (phoneNumber) {
      const validation = validateAndFormatPhone(phoneNumber);
      if (validation.isValid && validation.formatted) {
        phones.push({
          label: row["#3 Name"]?.trim() || "Phone #3",
          number: validation.formatted,
          isPrimary: false,
        });
      }
    }
  }

  // Phone #4
  if (row["Phone #4"]?.trim()) {
    const phoneNumber = cleanPhoneNumber(row["Phone #4"].trim());
    if (phoneNumber) {
      const validation = validateAndFormatPhone(phoneNumber);
      if (validation.isValid && validation.formatted) {
        phones.push({
          label: row["#4 Name"]?.trim() || "Phone #4",
          number: validation.formatted,
          isPrimary: false,
        });
      }
    }
  }

  // Must have at least one phone number
  if (phones.length === 0) {
    console.warn(`⚠️  Market ${marketNumber} (${row.City}) has no valid phone numbers, skipping`);
    return null;
  }

  return {
    marketNumber,
    name: row.City.trim(),
    stationCallLetters,
    airTime: normalizeAirTime(airTime),
    timezone,
    list,
    phones,
  };
}

/**
 * Determine timezone from air time and ET time
 */
function determineTimezone(airTime: string, etTime: string): string {
  // If air time matches ET time exactly, it's EST
  if (airTime?.trim() === etTime?.trim()) {
    return "EST";
  }

  // Try to parse times and calculate difference
  // This is a simplified approach - in production you might want more sophisticated timezone detection
  const airTimeLower = airTime?.toLowerCase() || "";
  const etTimeLower = etTime?.toLowerCase() || "";

  // Common patterns:
  // - If air time is 3 hours earlier than ET, it's PST
  // - If air time is 1 hour earlier than ET, it's CST
  // - If air time is 2 hours earlier than ET, it's MST

  // For now, default to EST and let users update if needed
  // The app already has timezone editing capabilities
  return "EST";
}

/**
 * Clean phone number - remove extensions and extra characters
 */
function cleanPhoneNumber(phone: string): string {
  // Remove common extension patterns (x123, ext 123, extension 123)
  phone = phone.replace(/\s*(x|ext|extension)[\s-]*\d+/i, "");
  
  // Remove parentheses with unblock instructions
  phone = phone.replace(/\s*\(unblock\s+\d+\)/i, "");
  
  // Remove any remaining non-digit characters except +, -, spaces, and parentheses
  // But keep the basic format for libphonenumber to parse
  return phone.trim();
}

/**
 * Normalize air time format
 */
function normalizeAirTime(airTime: string): string {
  // Handle multiple times separated by & or /
  if (airTime.includes("&")) {
    // Take the first time
    airTime = airTime.split("&")[0].trim();
  } else if (airTime.includes("/")) {
    // For times like "3:30PM /7:00PM", take the first one
    const parts = airTime.split("/");
    airTime = parts[0].trim();
    // If first part doesn't have AM/PM, check second part
    if (!airTime.match(/(AM|PM)/i) && parts[1]) {
      airTime = parts[1].trim();
    }
  }

  // Normalize spacing around AM/PM
  airTime = airTime.replace(/(\d)(AM|PM)/i, "$1 $2");
  
  // Ensure proper format
  return airTime.trim();
}

/**
 * Parse CSV text into market data
 */
export function parseCSV(csvText: string): ParsedMarket[] {
  const lines = csvText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
  
  if (lines.length < 2) {
    throw new Error("CSV file must have at least a header row and one data row");
  }

  // Parse header row
  const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const headerMap: Record<string, number> = {};
  header.forEach((h, i) => {
    headerMap[h] = i;
  });

  // Parse data rows
  const markets: ParsedMarket[] = [];
  const marketMap = new Map<number, ParsedMarket>(); // Track by market number to handle duplicates

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Handle quoted fields that may contain commas
    const values = parseCSVLine(line);

    const row: CSVMarketRow = {
      Feed: values[headerMap["Feed"]] || "",
      Rank: values[headerMap["Rank"]] || "",
      Station: values[headerMap["Station"]] || "",
      City: values[headerMap["City"]] || "",
      "Air Time": values[headerMap["Air Time"]] || "",
      "ET Time": values[headerMap["ET Time"]] || "",
      "Main Name": values[headerMap["Main Name"]] || "",
      "Main Phone #": values[headerMap["Main Phone #"]] || "",
      "#2 Name": values[headerMap["#2 Name"]] || "",
      "Phone #2": values[headerMap["Phone #2"]] || "",
      "#3 Name": values[headerMap["#3 Name"]] || "",
      "Phone #3": values[headerMap["Phone #3"]] || "",
      "#4 Name": values[headerMap["#4 Name"]] || "",
      "Phone #4": values[headerMap["Phone #4"]] || "",
    };

    const parsed = parseCSVRow(row);
    if (!parsed) continue;

    // If market already exists (same market number), merge phone numbers
    const existing = marketMap.get(parsed.marketNumber);
    if (existing) {
      // Merge phones, avoiding duplicates
      const existingNumbers = new Set(existing.phones.map((p) => p.number));
      for (const phone of parsed.phones) {
        if (!existingNumbers.has(phone.number)) {
          existing.phones.push(phone);
        }
      }
      // Update list if this is a different feed (prefer 6pm if both exist)
      if (parsed.list === "6pm") {
        existing.list = "6pm";
      }
    } else {
      marketMap.set(parsed.marketNumber, parsed);
      markets.push(parsed);
    }
  }

  return markets.sort((a, b) => a.marketNumber - b.marketNumber);
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  values.push(current.trim());

  return values;
}
