/**
 * Market Domain Logic
 * Core business rules for markets, air times, and broadcast schedules
 */

import { format, differenceInHours, differenceInMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

/**
 * Timezone abbreviations mapping
 */
export const TIMEZONE_MAP: Record<string, string> = {
  EST: "America/New_York",
  EDT: "America/New_York",
  CST: "America/Chicago",
  CDT: "America/Chicago",
  MST: "America/Denver",
  MDT: "America/Denver",
  PST: "America/Los_Angeles",
  PDT: "America/Los_Angeles",
};

/**
 * Market list types
 */
export type MarketList = "3pm" | "6pm" | null;

/**
 * Parse air time string to 24-hour format
 * @param airTime - Time string (e.g., "10:00 PM")
 * @returns 24-hour format { hour, minute } or null if invalid
 */
export function parseAirTime(airTime: string): { hour: number; minute: number } | null {
  try {
    const timeStr = airTime.trim();
    const [timePart, period] = timeStr.split(" ");
    const [hours, minutes = "0"] = timePart.split(":");
    
    let hour24 = parseInt(hours, 10);
    if (period?.toUpperCase() === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period?.toUpperCase() === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    
    return { hour: hour24, minute: parseInt(minutes, 10) };
  } catch {
    return null;
  }
}

/**
 * Check if a market has already aired today
 * @param airTime - Time string (e.g., "10:00 PM")
 * @param timezone - Timezone abbreviation (e.g., "EST", "PST")
 * @returns true if the air time has passed today
 */
export function hasAiredToday(airTime: string, timezone: string): boolean {
  try {
    const tz = TIMEZONE_MAP[timezone] || "America/New_York";
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    
    const parsed = parseAirTime(airTime);
    if (!parsed) return false;
    
    // Create date string in the market's timezone
    const dateTimeStr = `${todayStr}T${parsed.hour.toString().padStart(2, "0")}:${parsed.minute.toString().padStart(2, "0")}:00`;
    const localDate = new Date(dateTimeStr);
    const zonedDate = fromZonedTime(localDate, tz);
    
    return zonedDate < now;
  } catch {
    return false;
  }
}

/**
 * Get time until air time (or time since if already aired)
 * @param airTime - Time string (e.g., "10:00 PM")
 * @param timezone - Timezone abbreviation (e.g., "EST", "PST")
 * @returns Human-readable string (e.g., "Airs in 2 hours" or "Aired 1 hour ago")
 */
export function getTimeUntilAir(airTime: string, timezone: string): string {
  try {
    const tz = TIMEZONE_MAP[timezone] || "America/New_York";
    const now = new Date();
    const todayStr = format(now, "yyyy-MM-dd");
    
    const parsed = parseAirTime(airTime);
    if (!parsed) return "";
    
    // Create date in the market's timezone
    const dateTimeStr = `${todayStr}T${parsed.hour.toString().padStart(2, "0")}:${parsed.minute.toString().padStart(2, "0")}:00`;
    const localDate = new Date(dateTimeStr);
    const zonedDate = fromZonedTime(localDate, tz);
    
    const diffMinutes = differenceInMinutes(zonedDate, now);
    const diffHours = differenceInHours(zonedDate, now);
    
    if (diffMinutes < 0) {
      // Already aired
      const absMinutes = Math.abs(diffMinutes);
      const absHours = Math.abs(diffHours);
      if (absHours === 0) {
        return `Aired ${absMinutes} minute${absMinutes !== 1 ? "s" : ""} ago`;
      }
      return `Aired ${absHours} hour${absHours !== 1 ? "s" : ""} ago`;
    } else {
      // Upcoming
      if (diffHours === 0) {
        return `Airs in ${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""}`;
      }
      return `Airs in ${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
    }
  } catch {
    return "";
  }
}

/**
 * Format air time with timezone
 * @param airTime - Time string (e.g., "10:00 PM")
 * @param timezone - Timezone abbreviation (e.g., "EST", "PST")
 * @returns Formatted string (e.g., "10:00 PM EST")
 */
export function formatAirTime(airTime: string, timezone: string): string {
  return `${airTime} ${timezone}`;
}

/**
 * Determine if a market belongs to a specific broadcast list
 * @param marketList - The market's list ("3pm" | "6pm" | null)
 * @param targetList - The target list to check against
 * @returns true if the market belongs to the target list
 */
export function isInBroadcastList(
  marketList: MarketList,
  targetList: "all" | "3pm" | "6pm"
): boolean {
  if (targetList === "all") return true;
  return marketList === targetList;
}

/**
 * Get broadcast time window for a market list
 * @param list - Market list ("3pm" | "6pm")
 * @returns Display label for the broadcast time
 */
export function getBroadcastTimeLabel(list: MarketList): string {
  switch (list) {
    case "3pm":
      return "3:30 PM Feed";
    case "6pm":
      return "6:00 PM Feed";
    default:
      return "Unscheduled";
  }
}
