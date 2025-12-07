/**
 * Phone Number Validation and Formatting (Frontend)
 * Uses google-libphonenumber for validation and formatting
 */

import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

/**
 * Validate and format a phone number
 * @param phoneNumber - Phone number in any format
 * @param defaultRegion - Default region code (e.g., "US")
 * @returns Formatted phone number in E.164 format (e.g., +15551234567) or null if invalid
 */
export function validateAndFormatPhone(
  phoneNumber: string,
  defaultRegion: string = "US"
): { isValid: boolean; formatted: string | null; error?: string } {
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
 * @param defaultRegion - Default region code (e.g., "US")
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
  } catch (error) {
    // If parsing fails, return original
  }
  return phoneNumber;
}

