/**
 * Alert Domain Logic
 * Core business rules for sending alerts and determining recipients
 */

import type { MarketList } from "./market";
import { isInBroadcastList } from "./market";

/**
 * Recipient group identifiers
 */
export type RecipientGroupId = "all" | "3pm" | "6pm";

/**
 * Alert type
 */
export type AlertType = "text" | "voice";

/**
 * SMS constraints
 */
export const SMS_SEGMENT_SIZE = 160;
export const MAX_MESSAGE_LENGTH = 320; // 2 segments
export const RECOMMENDED_MESSAGE_LENGTH = 160; // 1 segment for better deliverability

/**
 * Voice alert constraints
 */
export const MAX_VOICE_DURATION_MS = 120000; // 2 minutes
export const RECOMMENDED_VOICE_DURATION_MS = 60000; // 1 minute

/**
 * Calculate SMS segment count
 * @param message - Text message content
 * @returns Number of SMS segments required
 */
export function calculateSmsSegments(message: string): number {
  if (message.length === 0) return 0;
  return Math.ceil(message.length / SMS_SEGMENT_SIZE);
}

/**
 * Check if a message is within SMS limits
 * @param message - Text message content
 * @returns true if message is within limits
 */
export function isValidSmsLength(message: string): boolean {
  return message.length > 0 && message.length <= MAX_MESSAGE_LENGTH;
}

/**
 * Get SMS cost warning
 * @param message - Text message content
 * @param recipientCount - Number of recipients
 * @returns Warning message if cost is high, null otherwise
 */
export function getSmsLengthWarning(message: string): string | null {
  const segments = calculateSmsSegments(message);
  if (segments > 2) {
    return `Message exceeds ${MAX_MESSAGE_LENGTH} characters and will be truncated`;
  }
  if (segments > 1) {
    return `Message will be sent as ${segments} SMS segments`;
  }
  return null;
}

/**
 * Determine if a market should receive an alert based on recipient group
 * @param marketList - The market's broadcast list
 * @param recipientGroup - Target recipient group
 * @returns true if the market should receive the alert
 */
export function isEligibleRecipient(
  marketList: MarketList,
  recipientGroup: RecipientGroupId
): boolean {
  return isInBroadcastList(marketList, recipientGroup);
}

/**
 * Get recipient group metadata
 * @param groupId - Recipient group identifier
 * @returns Display information for the group
 */
export function getRecipientGroupMeta(groupId: RecipientGroupId): {
  label: string;
  description: string;
  color: string;
} {
  switch (groupId) {
    case "all":
      return {
        label: "All Stations",
        description: "Send to all markets",
        color: "#007AFF",
      };
    case "3pm":
      return {
        label: "3:30 Feed",
        description: "3:30 PM broadcast list",
        color: "#F59E0B",
      };
    case "6pm":
      return {
        label: "6:00 Feed",
        description: "6:00 PM broadcast list",
        color: "#8B5CF6",
      };
  }
}

/**
 * Validate that an alert can be sent
 * @param alertType - Type of alert
 * @param content - Alert content (message or audio URI)
 * @param recipientGroup - Target recipient group
 * @returns Validation result with error message if invalid
 */
export function validateAlert(
  alertType: AlertType,
  content: string | null,
  recipientGroup: RecipientGroupId | null
): { isValid: boolean; error?: string } {
  if (!recipientGroup) {
    return { isValid: false, error: "Please select a recipient group" };
  }

  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      error: alertType === "text" ? "Please enter a message" : "Please record audio",
    };
  }

  if (alertType === "text" && !isValidSmsLength(content)) {
    return {
      isValid: false,
      error: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters`,
    };
  }

  return { isValid: true };
}

/**
 * Check if an alert can be sent
 * @param alertType - Type of alert
 * @param content - Alert content
 * @param recipientGroup - Target recipient group
 * @param isProcessing - Whether an alert is currently being sent
 * @returns true if the alert can be sent
 */
export function canSendAlert(
  alertType: AlertType,
  content: string | null,
  recipientGroup: RecipientGroupId | null,
  isProcessing: boolean
): boolean {
  if (isProcessing) return false;
  const validation = validateAlert(alertType, content, recipientGroup);
  return validation.isValid;
}

/**
 * Quick message templates for common alert scenarios
 */
export const MESSAGE_TEMPLATES = [
  {
    id: "breaking",
    label: "Breaking news",
    content: "Breaking news: [short description]. More details to follow.",
  },
  {
    id: "programming",
    label: "Programming note",
    content: "Programming note: [details]",
  },
  {
    id: "weather",
    label: "Weather / Emergency",
    content: "Weather alert: [details]. Please stay tuned for updates.",
  },
] as const;
