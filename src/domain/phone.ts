/**
 * Phone Number Domain Logic
 * Core business rules for phone number validation, formatting, and reliability tracking
 */

import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * Phone validation result
 */
export interface PhoneValidationResult {
  isValid: boolean;
  formatted: string | null;
  error?: string;
}

/**
 * Phone reliability threshold
 * After this many consecutive failures, a phone should be flagged
 */
export const PHONE_FAILURE_THRESHOLD = 3;

/**
 * Validate and format a phone number
 * @param phoneNumber - Phone number in any format
 * @param defaultRegion - Default region code (default: "US")
 * @returns Validation result with formatted phone number in E.164 format
 */
export function validateAndFormatPhone(
  phoneNumber: string,
  defaultRegion: string = "US"
): PhoneValidationResult {
  try {
    // Parse the phone number
    const parsed = phoneUtil.parse(phoneNumber, defaultRegion);

    // Check if valid
    const isValid = phoneUtil.isValidNumber(parsed);

    if (!isValid) {
      return {
        isValid: false,
        formatted: null,
        error: "Invalid phone number format",
      };
    }

    // Format as E.164 (international format with +)
    const formatted = phoneUtil.format(parsed, PhoneNumberFormat.E164);

    return {
      isValid: true,
      formatted,
    };
  } catch (error: any) {
    return {
      isValid: false,
      formatted: null,
      error: error.message || "Invalid phone number",
    };
  }
}

/**
 * Format phone number for display (national format)
 * @param phoneNumber - Phone number in any format
 * @param defaultRegion - Default region code (default: "US")
 * @returns Formatted phone number for display (e.g., (555) 123-4567) or original if invalid
 */
export function formatPhoneForDisplay(
  phoneNumber: string,
  defaultRegion: string = "US"
): string {
  try {
    const parsed = phoneUtil.parse(phoneNumber, defaultRegion);
    if (phoneUtil.isValidNumber(parsed)) {
      return phoneUtil.format(parsed, PhoneNumberFormat.NATIONAL);
    }
  } catch {
    // If parsing fails, return original
  }
  return phoneNumber;
}

/**
 * Check if a phone number should be flagged as unreliable
 * @param consecutiveFailures - Number of consecutive delivery failures
 * @returns true if the phone should be flagged
 */
export function shouldFlagPhone(consecutiveFailures: number): boolean {
  return consecutiveFailures >= PHONE_FAILURE_THRESHOLD;
}

/**
 * Get reliability status for a phone number
 * @param consecutiveFailures - Number of consecutive delivery failures
 * @returns Status object with severity level
 */
export function getPhoneReliabilityStatus(consecutiveFailures: number): {
  status: "good" | "warning" | "bad";
  message: string;
  color: string;
} {
  if (consecutiveFailures === 0) {
    return {
      status: "good",
      message: "Reliable",
      color: "#10B981",
    };
  }
  
  if (consecutiveFailures < PHONE_FAILURE_THRESHOLD) {
    return {
      status: "warning",
      message: `${consecutiveFailures} recent failure${consecutiveFailures > 1 ? "s" : ""}`,
      color: "#F59E0B",
    };
  }
  
  return {
    status: "bad",
    message: `${consecutiveFailures} consecutive failures`,
    color: "#EF4444",
  };
}

/**
 * Determine if a phone number is a primary candidate
 * @param consecutiveFailures - Number of consecutive delivery failures
 * @returns true if the phone should be considered for primary status
 */
export function isPrimaryCandidatePhone(consecutiveFailures: number): boolean {
  return consecutiveFailures < PHONE_FAILURE_THRESHOLD;
}

/**
 * Clean phone number input (remove extensions, formatting, etc.)
 * @param phoneNumber - Raw phone number input
 * @returns Cleaned phone number string
 */
export function cleanPhoneInput(phoneNumber: string): string {
  // Remove common extensions patterns
  let cleaned = phoneNumber
    .replace(/\s*x\d+$/i, "") // Remove "x123" extensions
    .replace(/\s*ext\.?\s*\d+$/i, "") // Remove "ext 123" extensions
    .replace(/\(to unblock.*?\)/gi, "") // Remove "(to unblock...)" instructions
    .trim();
  
  return cleaned;
}

/**
 * Validate multiple phone numbers
 * @param phoneNumbers - Array of phone numbers to validate
 * @param defaultRegion - Default region code
 * @returns Array of validation results with original indices
 */
export function validatePhoneList(
  phoneNumbers: string[],
  defaultRegion: string = "US"
): Array<PhoneValidationResult & { index: number; original: string }> {
  return phoneNumbers.map((phone, index) => {
    const cleaned = cleanPhoneInput(phone);
    const result = validateAndFormatPhone(cleaned, defaultRegion);
    return {
      ...result,
      index,
      original: phone,
    };
  });
}
