/**
 * Phone Domain Logic Tests
 * Tests for phone number validation and reliability tracking
 */

import { describe, it, expect } from "vitest";
import {
  validateAndFormatPhone,
  formatPhoneForDisplay,
  shouldFlagPhone,
  getPhoneReliabilityStatus,
  isPrimaryCandidatePhone,
  cleanPhoneInput,
  validatePhoneList,
  PHONE_FAILURE_THRESHOLD,
} from "../../src/domain/phone";

describe("Phone Domain", () => {
  describe("validateAndFormatPhone", () => {
    it("should validate and format valid US phone number", () => {
      const result = validateAndFormatPhone("(212) 555-1234");
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe("+12125551234");
      expect(result.error).toBeUndefined();
    });

    it("should handle phone number without formatting", () => {
      const result = validateAndFormatPhone("2125551234");
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe("+12125551234");
    });

    it("should handle phone number with +1 prefix", () => {
      const result = validateAndFormatPhone("+1 212-555-1234");
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe("+12125551234");
    });

    it("should reject invalid phone number", () => {
      const result = validateAndFormatPhone("invalid");
      expect(result.isValid).toBe(false);
      expect(result.formatted).toBeNull();
      expect(result.error).toBeDefined();
    });

    it("should reject phone number with too few digits", () => {
      const result = validateAndFormatPhone("12345");
      expect(result.isValid).toBe(false);
      expect(result.formatted).toBeNull();
    });

    it("should handle different area codes", () => {
      const result = validateAndFormatPhone("(818) 555-1234");
      expect(result.isValid).toBe(true);
      expect(result.formatted).toBe("+18185551234");
    });
  });

  describe("formatPhoneForDisplay", () => {
    it("should format valid phone for display", () => {
      const result = formatPhoneForDisplay("+12125551234");
      expect(result).toBe("(212) 555-1234");
    });

    it("should handle phone without +1", () => {
      const result = formatPhoneForDisplay("2125551234");
      expect(result).toBe("(212) 555-1234");
    });

    it("should return original for invalid phone", () => {
      const result = formatPhoneForDisplay("invalid");
      expect(result).toBe("invalid");
    });

    it("should handle already formatted phone", () => {
      const result = formatPhoneForDisplay("(212) 555-1234");
      expect(result).toBe("(212) 555-1234");
    });
  });

  describe("shouldFlagPhone", () => {
    it("should not flag phone with no failures", () => {
      expect(shouldFlagPhone(0)).toBe(false);
    });

    it("should not flag phone below threshold", () => {
      expect(shouldFlagPhone(PHONE_FAILURE_THRESHOLD - 1)).toBe(false);
    });

    it("should flag phone at threshold", () => {
      expect(shouldFlagPhone(PHONE_FAILURE_THRESHOLD)).toBe(true);
    });

    it("should flag phone above threshold", () => {
      expect(shouldFlagPhone(PHONE_FAILURE_THRESHOLD + 1)).toBe(true);
    });
  });

  describe("getPhoneReliabilityStatus", () => {
    it("should return good status for no failures", () => {
      const status = getPhoneReliabilityStatus(0);
      expect(status.status).toBe("good");
      expect(status.message).toContain("Reliable");
      expect(status.color).toBeDefined();
    });

    it("should return warning status for some failures", () => {
      const status = getPhoneReliabilityStatus(1);
      expect(status.status).toBe("warning");
      expect(status.message).toContain("failure");
      expect(status.color).toBeDefined();
    });

    it("should return bad status for many failures", () => {
      const status = getPhoneReliabilityStatus(PHONE_FAILURE_THRESHOLD);
      expect(status.status).toBe("bad");
      expect(status.message).toContain("consecutive failures");
      expect(status.color).toBeDefined();
    });

    it("should pluralize failure message correctly", () => {
      const status1 = getPhoneReliabilityStatus(1);
      expect(status1.message).not.toContain("failures");

      const status2 = getPhoneReliabilityStatus(2);
      expect(status2.message).toContain("failures");
    });
  });

  describe("isPrimaryCandidatePhone", () => {
    it("should return true for reliable phone", () => {
      expect(isPrimaryCandidatePhone(0)).toBe(true);
    });

    it("should return true for phone below threshold", () => {
      expect(isPrimaryCandidatePhone(PHONE_FAILURE_THRESHOLD - 1)).toBe(true);
    });

    it("should return false for unreliable phone", () => {
      expect(isPrimaryCandidatePhone(PHONE_FAILURE_THRESHOLD)).toBe(false);
    });
  });

  describe("cleanPhoneInput", () => {
    it("should remove x extension", () => {
      const result = cleanPhoneInput("212-555-1234 x123");
      expect(result).toBe("212-555-1234");
    });

    it("should remove ext extension", () => {
      const result = cleanPhoneInput("212-555-1234 ext 123");
      expect(result).toBe("212-555-1234");
    });

    it("should remove extension extension", () => {
      const result = cleanPhoneInput("212-555-1234 extension 123");
      expect(result).toBe("212-555-1234");
    });

    it("should remove unblock instructions", () => {
      const result = cleanPhoneInput("212-555-1234 (to unblock 67)");
      expect(result).toBe("212-555-1234");
    });

    it("should handle multiple cleaning operations", () => {
      const result = cleanPhoneInput("  212-555-1234 x123 (to unblock 67)  ");
      expect(result).toBe("212-555-1234");
    });

    it("should preserve valid phone format", () => {
      const result = cleanPhoneInput("(212) 555-1234");
      expect(result).toBe("(212) 555-1234");
    });
  });

  describe("validatePhoneList", () => {
    it("should validate multiple phones", () => {
      const phones = ["212-555-1234", "818-555-5678"];
      const result = validatePhoneList(phones);

      expect(result).toHaveLength(2);
      expect(result[0].isValid).toBe(true);
      expect(result[0].index).toBe(0);
      expect(result[1].isValid).toBe(true);
      expect(result[1].index).toBe(1);
    });

    it("should include original phone numbers", () => {
      const phones = ["212-555-1234"];
      const result = validatePhoneList(phones);

      expect(result[0].original).toBe("212-555-1234");
    });

    it("should handle mixed valid and invalid phones", () => {
      const phones = ["212-555-1234", "invalid", "818-555-5678"];
      const result = validatePhoneList(phones);

      expect(result).toHaveLength(3);
      expect(result[0].isValid).toBe(true);
      expect(result[1].isValid).toBe(false);
      expect(result[2].isValid).toBe(true);
    });

    it("should clean phones before validation", () => {
      const phones = ["212-555-1234 x123"];
      const result = validatePhoneList(phones);

      expect(result[0].isValid).toBe(true);
    });

    it("should handle empty array", () => {
      const result = validatePhoneList([]);
      expect(result).toHaveLength(0);
    });
  });
});
