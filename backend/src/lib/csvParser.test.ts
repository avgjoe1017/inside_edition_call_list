/**
 * CSV Parser Tests
 * Tests for market data CSV parsing logic
 */

import { describe, it, expect } from "vitest";
import { parseCSVRow, parseCSV, type CSVMarketRow } from "../src/lib/csvParser";

describe("CSV Parser", () => {
  describe("parseCSVRow", () => {
    it("should parse a valid market row", () => {
      const row: CSVMarketRow = {
        Feed: "3:00 PM",
        Rank: "1",
        Station: "WCBS-TV",
        City: "New York",
        "Air Time": "7:00 PM",
        "ET Time": "7:00 PM",
        "Main Name": "News Desk",
        "Main Phone #": "212-975-4321",
        "#2 Name": "Assignment Desk",
        "Phone #2": "212-975-4322",
        "#3 Name": "",
        "Phone #3": "",
        "#4 Name": "",
        "Phone #4": "",
      };

      const result = parseCSVRow(row);

      expect(result).toBeTruthy();
      expect(result?.marketNumber).toBe(1);
      expect(result?.name).toBe("New York");
      expect(result?.stationCallLetters).toBe("WCBS");
      expect(result?.airTime).toBe("7:00 PM");
      expect(result?.timezone).toBe("EST");
      expect(result?.list).toBe("3pm");
      expect(result?.phones).toHaveLength(2);
      expect(result?.phones[0].isPrimary).toBe(true);
    });

    it("should handle 6pm feed markets", () => {
      const row: CSVMarketRow = {
        Feed: "6:00 PM",
        Rank: "2",
        Station: "KNBC-TV",
        City: "Los Angeles",
        "Air Time": "11:00 PM",
        "ET Time": "11:00 PM",
        "Main Name": "News Desk",
        "Main Phone #": "818-840-4444",
        "#2 Name": "",
        "Phone #2": "",
        "#3 Name": "",
        "Phone #3": "",
        "#4 Name": "",
        "Phone #4": "",
      };

      const result = parseCSVRow(row);

      expect(result).toBeTruthy();
      expect(result?.list).toBe("6pm");
    });

    it("should clean station call letters", () => {
      const row: CSVMarketRow = {
        Feed: "3:00 PM",
        Rank: "1",
        Station: "WCBS-TV",
        City: "New York",
        "Air Time": "7:00 PM",
        "ET Time": "7:00 PM",
        "Main Name": "News Desk",
        "Main Phone #": "212-975-4321",
        "#2 Name": "",
        "Phone #2": "",
        "#3 Name": "",
        "Phone #3": "",
        "#4 Name": "",
        "Phone #4": "",
      };

      const result = parseCSVRow(row);

      expect(result?.stationCallLetters).toBe("WCBS");
    });

    it("should handle multiple station call letters", () => {
      const row: CSVMarketRow = {
        Feed: "3:00 PM",
        Rank: "1",
        Station: "KING / KONG",
        City: "Seattle",
        "Air Time": "7:00 PM",
        "ET Time": "7:00 PM",
        "Main Name": "News Desk",
        "Main Phone #": "206-448-3000",
        "#2 Name": "",
        "Phone #2": "",
        "#3 Name": "",
        "Phone #3": "",
        "#4 Name": "",
        "Phone #4": "",
      };

      const result = parseCSVRow(row);

      expect(result?.stationCallLetters).toBe("KING");
    });

    it("should handle phone number extensions", () => {
      const row: CSVMarketRow = {
        Feed: "3:00 PM",
        Rank: "1",
        Station: "WCBS-TV",
        City: "New York",
        "Air Time": "7:00 PM",
        "ET Time": "7:00 PM",
        "Main Name": "News Desk",
        "Main Phone #": "212-975-4321 x123",
        "#2 Name": "",
        "Phone #2": "",
        "#3 Name": "",
        "Phone #3": "",
        "#4 Name": "",
        "Phone #4": "",
      };

      const result = parseCSVRow(row);

      expect(result).toBeTruthy();
      expect(result?.phones).toHaveLength(1);
      expect(result?.phones[0].number).toMatch(/^\+1/); // Should be E.164 format
    });

    it("should normalize multiple air times", () => {
      const row: CSVMarketRow = {
        Feed: "3:00 PM",
        Rank: "1",
        Station: "WCBS-TV",
        City: "New York",
        "Air Time": "7:00 PM & 11:00 PM",
        "ET Time": "7:00 PM",
        "Main Name": "News Desk",
        "Main Phone #": "212-975-4321",
        "#2 Name": "",
        "Phone #2": "",
        "#3 Name": "",
        "Phone #3": "",
        "#4 Name": "",
        "Phone #4": "",
      };

      const result = parseCSVRow(row);

      expect(result?.airTime).toBe("7:00 PM");
    });

    it("should reject rows without valid phones", () => {
      const row: CSVMarketRow = {
        Feed: "3:00 PM",
        Rank: "1",
        Station: "WCBS-TV",
        City: "New York",
        "Air Time": "7:00 PM",
        "ET Time": "7:00 PM",
        "Main Name": "",
        "Main Phone #": "invalid",
        "#2 Name": "",
        "Phone #2": "",
        "#3 Name": "",
        "Phone #3": "",
        "#4 Name": "",
        "Phone #4": "",
      };

      const result = parseCSVRow(row);

      expect(result).toBeNull();
    });

    it("should reject empty rows", () => {
      const row: CSVMarketRow = {
        Feed: "",
        Rank: "",
        Station: "",
        City: "",
        "Air Time": "",
        "ET Time": "",
        "Main Name": "",
        "Main Phone #": "",
        "#2 Name": "",
        "Phone #2": "",
        "#3 Name": "",
        "Phone #3": "",
        "#4 Name": "",
        "Phone #4": "",
      };

      const result = parseCSVRow(row);

      expect(result).toBeNull();
    });

    it("should reject header rows", () => {
      const row: CSVMarketRow = {
        Feed: "Feed",
        Rank: "Rank",
        Station: "Station",
        City: "City",
        "Air Time": "Air Time",
        "ET Time": "ET Time",
        "Main Name": "Main Name",
        "Main Phone #": "Main Phone #",
        "#2 Name": "#2 Name",
        "Phone #2": "Phone #2",
        "#3 Name": "#3 Name",
        "Phone #3": "Phone #3",
        "#4 Name": "#4 Name",
        "Phone #4": "Phone #4",
      };

      const result = parseCSVRow(row);

      expect(result).toBeNull();
    });
  });

  describe("parseCSV", () => {
    it("should parse a complete CSV file", () => {
      const csvText = `Feed,Rank,Station,City,Air Time,ET Time,Main Name,Main Phone #,#2 Name,Phone #2,#3 Name,Phone #3,#4 Name,Phone #4
3:00 PM,1,WCBS-TV,New York,7:00 PM,7:00 PM,News Desk,212-975-4321,Assignment Desk,212-975-4322,,,
6:00 PM,2,KNBC-TV,Los Angeles,11:00 PM,11:00 PM,News Desk,818-840-4444,,,,,`;

      const result = parseCSV(csvText);

      expect(result).toHaveLength(2);
      expect(result[0].marketNumber).toBe(1);
      expect(result[0].name).toBe("New York");
      expect(result[0].list).toBe("3pm");
      expect(result[1].marketNumber).toBe(2);
      expect(result[1].name).toBe("Los Angeles");
      expect(result[1].list).toBe("6pm");
    });

    it("should handle quoted fields with commas", () => {
      const csvText = `Feed,Rank,Station,City,Air Time,ET Time,Main Name,Main Phone #,#2 Name,Phone #2,#3 Name,Phone #3,#4 Name,Phone #4
3:00 PM,1,WCBS-TV,"New York, NY",7:00 PM,7:00 PM,News Desk,212-975-4321,,,,,`;

      const result = parseCSV(csvText);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("New York, NY");
    });

    it("should merge duplicate markets", () => {
      const csvText = `Feed,Rank,Station,City,Air Time,ET Time,Main Name,Main Phone #,#2 Name,Phone #2,#3 Name,Phone #3,#4 Name,Phone #4
3:00 PM,1,WCBS-TV,New York,7:00 PM,7:00 PM,News Desk,212-975-4321,,,,,
3:00 PM,1,WCBS-TV,New York,7:00 PM,7:00 PM,Assignment Desk,212-975-4322,,,,,`;

      const result = parseCSV(csvText);

      expect(result).toHaveLength(1);
      expect(result[0].phones).toHaveLength(2);
    });

    it("should sort markets by market number", () => {
      const csvText = `Feed,Rank,Station,City,Air Time,ET Time,Main Name,Main Phone #,#2 Name,Phone #2,#3 Name,Phone #3,#4 Name,Phone #4
6:00 PM,2,KNBC-TV,Los Angeles,11:00 PM,11:00 PM,News Desk,818-840-4444,,,,,
3:00 PM,1,WCBS-TV,New York,7:00 PM,7:00 PM,News Desk,212-975-4321,,,,,`;

      const result = parseCSV(csvText);

      expect(result).toHaveLength(2);
      expect(result[0].marketNumber).toBe(1);
      expect(result[1].marketNumber).toBe(2);
    });

    it("should skip invalid rows", () => {
      const csvText = `Feed,Rank,Station,City,Air Time,ET Time,Main Name,Main Phone #,#2 Name,Phone #2,#3 Name,Phone #3,#4 Name,Phone #4
3:00 PM,1,WCBS-TV,New York,7:00 PM,7:00 PM,News Desk,212-975-4321,,,,,
,,,,,,,invalid,,,,,
6:00 PM,2,KNBC-TV,Los Angeles,11:00 PM,11:00 PM,News Desk,818-840-4444,,,,,`;

      const result = parseCSV(csvText);

      expect(result).toHaveLength(2);
    });

    it("should throw error for empty CSV", () => {
      const csvText = ``;

      expect(() => parseCSV(csvText)).toThrow("must have at least a header row");
    });

    it("should throw error for CSV with only header", () => {
      const csvText = `Feed,Rank,Station,City,Air Time,ET Time,Main Name,Main Phone #,#2 Name,Phone #2,#3 Name,Phone #3,#4 Name,Phone #4`;

      expect(() => parseCSV(csvText)).toThrow("must have at least a header row");
    });
  });
});
