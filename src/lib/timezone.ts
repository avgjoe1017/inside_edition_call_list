/**
 * Timezone and Air Time Utilities
 * Uses date-fns for timezone handling and time calculations
 */

import { format, differenceInHours, differenceInMinutes } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

/**
 * Timezone abbreviations mapping
 */
const TIMEZONE_MAP: Record<string, string> = {
  EST: "America/New_York",
  EDT: "America/New_York", // Eastern Daylight Time
  CST: "America/Chicago",
  CDT: "America/Chicago", // Central Daylight Time
  MST: "America/Denver",
  MDT: "America/Denver", // Mountain Daylight Time
  PST: "America/Los_Angeles",
  PDT: "America/Los_Angeles", // Pacific Daylight Time
};

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
    
    // Parse the air time (e.g., "10:00 PM")
    const timeStr = airTime.trim();
    const [timePart, period] = timeStr.split(" ");
    const [hours, minutes = "0"] = timePart.split(":");
    
    let hour24 = parseInt(hours, 10);
    if (period?.toUpperCase() === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period?.toUpperCase() === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    
    // Create date string in the market's timezone
    const dateTimeStr = `${todayStr}T${hour24.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
    const localDate = new Date(dateTimeStr);
    const zonedDate = fromZonedTime(localDate, tz);
    
    return zonedDate < now;
  } catch (error) {
    console.error("Error checking if aired:", error);
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
    
    // Parse the air time
    const timeStr = airTime.trim();
    const [timePart, period] = timeStr.split(" ");
    const [hours, minutes = "0"] = timePart.split(":");
    
    let hour24 = parseInt(hours, 10);
    if (period?.toUpperCase() === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (period?.toUpperCase() === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    
    // Create date in the market's timezone
    const dateTimeStr = `${todayStr}T${hour24.toString().padStart(2, "0")}:${minutes.padStart(2, "0")}:00`;
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
  } catch (error) {
    console.error("Error calculating time until air:", error);
    return "";
  }
}

