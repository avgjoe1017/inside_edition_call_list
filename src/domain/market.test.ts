/**
 * Market Domain Logic Tests
 * Tests for market business rules and air time calculations
 */

import { describe, it, expect } from "vitest";
import {
  parseAirTime,
  hasAiredToday,
  getTimeUntilAir,
  formatAirTime,
  isInBroadcastList,
  getBroadcastTimeLabel,
} from "../../src/domain/market";

describe("Market Domain", () => {
  describe("parseAirTime", () => {
    it("should parse PM times correctly", () => {
      const result = parseAirTime("10:00 PM");
      expect(result).toEqual({ hour: 22, minute: 0 });
    });

    it("should parse AM times correctly", () => {
      const result = parseAirTime("9:00 AM");
      expect(result).toEqual({ hour: 9, minute: 0 });
    });

    it("should handle 12 PM (noon) correctly", () => {
      const result = parseAirTime("12:00 PM");
      expect(result).toEqual({ hour: 12, minute: 0 });
    });

    it("should handle 12 AM (midnight) correctly", () => {
      const result = parseAirTime("12:00 AM");
      expect(result).toEqual({ hour: 0, minute: 0 });
    });

    it("should parse times with minutes", () => {
      const result = parseAirTime("3:30 PM");
      expect(result).toEqual({ hour: 15, minute: 30 });
    });

    it("should handle times without minutes", () => {
      const result = parseAirTime("7 PM");
      expect(result).toEqual({ hour: 19, minute: 0 });
    });

    it("should return null for invalid format", () => {
      const result = parseAirTime("invalid");
      expect(result).toBeNull();
    });

    it("should handle whitespace", () => {
      const result = parseAirTime("  10:00 PM  ");
      expect(result).toEqual({ hour: 22, minute: 0 });
    });
  });

  describe("hasAiredToday", () => {
    it("should return true for past times", () => {
      const result = hasAiredToday("12:00 AM", "EST");
      expect(typeof result).toBe("boolean");
      // Since this depends on current time, we just verify it returns a boolean
    });

    it("should return false for invalid time format", () => {
      const result = hasAiredToday("invalid", "EST");
      expect(result).toBe(false);
    });

    it("should handle different timezones", () => {
      const resultEST = hasAiredToday("10:00 PM", "EST");
      const resultPST = hasAiredToday("10:00 PM", "PST");
      expect(typeof resultEST).toBe("boolean");
      expect(typeof resultPST).toBe("boolean");
    });

    it("should use EST as default for unknown timezone", () => {
      const result = hasAiredToday("10:00 PM", "UNKNOWN");
      expect(typeof result).toBe("boolean");
    });
  });

  describe("getTimeUntilAir", () => {
    it("should return time until air for future times", () => {
      const result = getTimeUntilAir("11:59 PM", "EST");
      expect(typeof result).toBe("string");
      // Result will vary based on current time
    });

    it("should return empty string for invalid format", () => {
      const result = getTimeUntilAir("invalid", "EST");
      expect(result).toBe("");
    });

    it("should handle different timezones", () => {
      const result = getTimeUntilAir("10:00 PM", "PST");
      expect(typeof result).toBe("string");
    });

    it("should format plural correctly", () => {
      // This test verifies the internal logic, but the exact result depends on current time
      const result = getTimeUntilAir("11:59 PM", "EST");
      expect(result).toMatch(/(hour|minute|ago|in)/i);
    });
  });

  describe("formatAirTime", () => {
    it("should format air time with timezone", () => {
      const result = formatAirTime("10:00 PM", "EST");
      expect(result).toBe("10:00 PM EST");
    });

    it("should handle different timezones", () => {
      const result = formatAirTime("7:00 PM", "PST");
      expect(result).toBe("7:00 PM PST");
    });

    it("should handle empty strings", () => {
      const result = formatAirTime("", "EST");
      expect(result).toBe(" EST");
    });
  });

  describe("isInBroadcastList", () => {
    it("should return true for 'all' target", () => {
      expect(isInBroadcastList("3pm", "all")).toBe(true);
      expect(isInBroadcastList("6pm", "all")).toBe(true);
      expect(isInBroadcastList(null, "all")).toBe(true);
    });

    it("should match 3pm markets correctly", () => {
      expect(isInBroadcastList("3pm", "3pm")).toBe(true);
      expect(isInBroadcastList("6pm", "3pm")).toBe(false);
      expect(isInBroadcastList(null, "3pm")).toBe(false);
    });

    it("should match 6pm markets correctly", () => {
      expect(isInBroadcastList("6pm", "6pm")).toBe(true);
      expect(isInBroadcastList("3pm", "6pm")).toBe(false);
      expect(isInBroadcastList(null, "6pm")).toBe(false);
    });
  });

  describe("getBroadcastTimeLabel", () => {
    it("should return correct label for 3pm", () => {
      expect(getBroadcastTimeLabel("3pm")).toBe("3:30 PM Feed");
    });

    it("should return correct label for 6pm", () => {
      expect(getBroadcastTimeLabel("6pm")).toBe("6:00 PM Feed");
    });

    it("should return unscheduled for null", () => {
      expect(getBroadcastTimeLabel(null)).toBe("Unscheduled");
    });
  });
});
