/**
 * Centralized formatting utilities
 * Used across multiple screens for consistent date/time and group formatting
 */

import { useThemeColors } from "@/lib/theme";

/**
 * Format a date string for display in logs/alerts
 * Returns "Today", "Yesterday", or formatted date string
 */
export function formatAlertDate(dateString: string): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();
  const dateToCheck = new Date(dateString).toDateString();

  if (dateToCheck === todayStr) return "Today";
  if (dateToCheck === yesterdayStr) return "Yesterday";

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a time from ISO string for display
 * Returns formatted time (e.g., "2:30 PM")
 */
export function formatAlertTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a time from ISO string for call logs
 * Returns formatted time (e.g., "2:30 PM")
 */
export function formatCallTime(dateString: string): string {
  return formatAlertTime(dateString);
}

/**
 * Get recipient group metadata (label, color, icon info)
 * Returns display information for recipient group chips/badges
 */
export function getRecipientGroupMeta(
  groupId: "all" | "3pm" | "6pm",
  colors?: ReturnType<typeof useThemeColors>
): {
  label: string;
  color: string;
  backgroundColor?: string;
  textColor?: string;
} {
  switch (groupId) {
    case "all":
      return {
        label: "All Stations",
        color: colors?.systemBlue || "#007AFF",
        backgroundColor: colors?.systemBlue || "#007AFF",
        textColor: "#FFFFFF",
      };
    case "3pm":
      return {
        label: "3:30 Feed",
        color: "#F59E0B",
        backgroundColor: "#F59E0B",
        textColor: "#FFFFFF",
      };
    case "6pm":
      return {
        label: "6:00 Feed",
        color: "#8B5CF6",
        backgroundColor: "#8B5CF6",
        textColor: "#FFFFFF",
      };
  }
}
