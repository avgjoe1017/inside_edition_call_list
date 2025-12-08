/**
 * Market Store - Local UI state only
 * Server state is handled by React Query hooks (useMarketsQuery, etc.)
 * This store only manages filter preferences and provides filtering logic
 */

import { create } from "zustand";
import Fuse from "fuse.js";
import type { Market } from "@/shared/contracts";

export type { Market };
export type { PhoneNumber } from "@/shared/contracts";

interface MarketStore {
  // Local UI state - filters
  filterText: string;
  filterTime: string;
  filterList: "all" | "3pm" | "5pm" | "6pm";
  setFilterText: (text: string) => void;
  setFilterTime: (time: string) => void;
  setFilterList: (list: "all" | "3pm" | "5pm" | "6pm") => void;
  
  // Filtering logic - takes markets from React Query
  getFilteredMarkets: (markets: Market[]) => Market[];
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  filterText: "",
  filterTime: "",
  filterList: "all",

  setFilterText: (text: string) => {
    set({ filterText: text });
  },

  setFilterTime: (time: string) => {
    set({ filterTime: time });
  },

  setFilterList: (list: "all" | "3pm" | "5pm" | "6pm") => {
    set({ filterList: list });
  },

  getFilteredMarkets: (markets: Market[]) => {
    const { filterText, filterTime, filterList } = get();
    let filtered = markets;

    // Filter by list (3pm, 5pm, or 6pm) - apply this first to reduce search space
    if (filterList !== "all") {
      filtered = filtered.filter((market) => market.list === filterList);
    }

    // Filter by air time
    if (filterTime.trim()) {
      const timeLower = filterTime.toLowerCase().trim();
      filtered = filtered.filter((market) => {
        const airTime = market.airTime.toLowerCase();
        return airTime.includes(timeLower);
      });
    }

    // Fuzzy search using Fuse.js for market number and name
    if (filterText.trim()) {
      const fuse = new Fuse(filtered, {
        keys: [
          { name: "name", weight: 0.7 },
          { name: "marketNumber", weight: 0.3 },
          { name: "stationCallLetters", weight: 0.2 },
        ],
        threshold: 0.3, // 0.0 = exact match, 1.0 = match anything
        ignoreLocation: true,
        includeScore: true,
      });

      const results = fuse.search(filterText.trim());
      filtered = results.map((result) => result.item);
    }

    return filtered;
  },
}));
