/**
 * Alert Domain Logic Tests
 * Tests for alert business rules and validation
 */

import { describe, it, expect } from "vitest";
import {
  calculateSmsSegments,
  isValidSmsLength,
  getSmsLengthWarning,
  isEligibleRecipient,
  getRecipientGroupMeta,
  validateAlert,
  canSendAlert,
  SMS_SEGMENT_SIZE,
  MAX_MESSAGE_LENGTH,
  MESSAGE_TEMPLATES,
} from "../../src/domain/alert";

describe("Alert Domain", () => {
  describe("calculateSmsSegments", () => {
    it("should return 0 for empty message", () => {
      expect(calculateSmsSegments("")).toBe(0);
    });

    it("should return 1 for message under segment size", () => {
      const message = "A".repeat(100);
      expect(calculateSmsSegments(message)).toBe(1);
    });

    it("should return 1 for message exactly at segment size", () => {
      const message = "A".repeat(SMS_SEGMENT_SIZE);
      expect(calculateSmsSegments(message)).toBe(1);
    });

    it("should return 2 for message over segment size", () => {
      const message = "A".repeat(SMS_SEGMENT_SIZE + 1);
      expect(calculateSmsSegments(message)).toBe(2);
    });

    it("should calculate segments correctly", () => {
      const message = "A".repeat(SMS_SEGMENT_SIZE * 1.5);
      expect(calculateSmsSegments(message)).toBe(2);
    });
  });

  describe("isValidSmsLength", () => {
    it("should return false for empty message", () => {
      expect(isValidSmsLength("")).toBe(false);
    });

    it("should return true for valid message", () => {
      const message = "A".repeat(100);
      expect(isValidSmsLength(message)).toBe(true);
    });

    it("should return true for message at max length", () => {
      const message = "A".repeat(MAX_MESSAGE_LENGTH);
      expect(isValidSmsLength(message)).toBe(true);
    });

    it("should return false for message over max length", () => {
      const message = "A".repeat(MAX_MESSAGE_LENGTH + 1);
      expect(isValidSmsLength(message)).toBe(false);
    });
  });

  describe("getSmsLengthWarning", () => {
    it("should return null for single segment", () => {
      const message = "A".repeat(100);
      expect(getSmsLengthWarning(message)).toBeNull();
    });

    it("should return warning for two segments", () => {
      const message = "A".repeat(SMS_SEGMENT_SIZE + 1);
      const warning = getSmsLengthWarning(message);
      expect(warning).toContain("2 SMS segments");
    });

    it("should return truncation warning for over max length", () => {
      const message = "A".repeat(MAX_MESSAGE_LENGTH + 1);
      const warning = getSmsLengthWarning(message);
      expect(warning).toContain("truncated");
    });
  });

  describe("isEligibleRecipient", () => {
    it("should return true for all markets when targeting all", () => {
      expect(isEligibleRecipient("3pm", "all")).toBe(true);
      expect(isEligibleRecipient("6pm", "all")).toBe(true);
      expect(isEligibleRecipient(null, "all")).toBe(true);
    });

    it("should match 3pm markets correctly", () => {
      expect(isEligibleRecipient("3pm", "3pm")).toBe(true);
      expect(isEligibleRecipient("6pm", "3pm")).toBe(false);
    });

    it("should match 6pm markets correctly", () => {
      expect(isEligibleRecipient("6pm", "6pm")).toBe(true);
      expect(isEligibleRecipient("3pm", "6pm")).toBe(false);
    });
  });

  describe("getRecipientGroupMeta", () => {
    it("should return metadata for all group", () => {
      const meta = getRecipientGroupMeta("all");
      expect(meta.label).toBe("All Stations");
      expect(meta.description).toBeDefined();
      expect(meta.color).toBeDefined();
    });

    it("should return metadata for 3pm group", () => {
      const meta = getRecipientGroupMeta("3pm");
      expect(meta.label).toBe("3:30 Feed");
      expect(meta.description).toBeDefined();
      expect(meta.color).toBeDefined();
    });

    it("should return metadata for 6pm group", () => {
      const meta = getRecipientGroupMeta("6pm");
      expect(meta.label).toBe("6:00 Feed");
      expect(meta.description).toBeDefined();
      expect(meta.color).toBeDefined();
    });
  });

  describe("validateAlert", () => {
    it("should validate text alert with valid content", () => {
      const result = validateAlert("text", "Breaking news", "all");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject text alert with empty content", () => {
      const result = validateAlert("text", "", "all");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("enter a message");
    });

    it("should reject text alert with null content", () => {
      const result = validateAlert("text", null, "all");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("enter a message");
    });

    it("should reject text alert with whitespace-only content", () => {
      const result = validateAlert("text", "   ", "all");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("enter a message");
    });

    it("should reject text alert with too long message", () => {
      const message = "A".repeat(MAX_MESSAGE_LENGTH + 1);
      const result = validateAlert("text", message, "all");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("between 1 and");
    });

    it("should reject alert without recipient group", () => {
      const result = validateAlert("text", "Breaking news", null);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("select a recipient group");
    });

    it("should validate voice alert with valid content", () => {
      const result = validateAlert("voice", "file://audio.mp3", "all");
      expect(result.isValid).toBe(true);
    });

    it("should reject voice alert with empty content", () => {
      const result = validateAlert("voice", "", "all");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("record audio");
    });
  });

  describe("canSendAlert", () => {
    it("should return true when all conditions are met", () => {
      const result = canSendAlert("text", "Breaking news", "all", false);
      expect(result).toBe(true);
    });

    it("should return false when processing", () => {
      const result = canSendAlert("text", "Breaking news", "all", true);
      expect(result).toBe(false);
    });

    it("should return false when validation fails", () => {
      const result = canSendAlert("text", "", "all", false);
      expect(result).toBe(false);
    });

    it("should return false when no content", () => {
      const result = canSendAlert("text", null, "all", false);
      expect(result).toBe(false);
    });

    it("should return false when no recipient group", () => {
      const result = canSendAlert("text", "Breaking news", null, false);
      expect(result).toBe(false);
    });
  });

  describe("MESSAGE_TEMPLATES", () => {
    it("should have breaking news template", () => {
      const template = MESSAGE_TEMPLATES.find((t) => t.id === "breaking");
      expect(template).toBeDefined();
      expect(template?.label).toBeDefined();
      expect(template?.content).toBeDefined();
    });

    it("should have programming template", () => {
      const template = MESSAGE_TEMPLATES.find((t) => t.id === "programming");
      expect(template).toBeDefined();
    });

    it("should have weather template", () => {
      const template = MESSAGE_TEMPLATES.find((t) => t.id === "weather");
      expect(template).toBeDefined();
    });
  });
});
