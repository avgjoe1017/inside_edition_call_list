import { db as prisma } from "../db";

interface LogEditParams {
  marketId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  editedBy?: string | null;
}

/**
 * Helper function to log edits to the database
 */
export async function logEdit({
  marketId,
  field,
  oldValue,
  newValue,
  editedBy = null,
}: LogEditParams): Promise<void> {
  try {
    await prisma.editLog.create({
      data: {
        marketId,
        field,
        oldValue,
        newValue,
        editedBy,
      },
    });
  } catch (error) {
    console.error("Error logging edit:", error);
    // Don't throw - we don't want to block the main operation if logging fails
  }
}

/**
 * Format a market name for display in edit logs
 */
export function formatMarketName(marketName: string): string {
  return marketName;
}

/**
 * Format a field name for display in edit logs
 */
export function formatFieldName(field: string): string {
  const fieldNames: Record<string, string> = {
    name: "Market Name",
    stationCallLetters: "Station Call Letters",
    airTime: "Air Time",
    localTimezone: "Local Timezone",
    phoneNumber: "Phone Number",
    primaryPhone: "Primary Contact",
  };

  return fieldNames[field] || field;
}
