import React from "react";
import { create } from "zustand";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

interface ThemeState {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  isLoading: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  updateColorScheme: (scheme: ColorScheme) => void;
  loadTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = "@inside911:theme";

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: "system",
  colorScheme: "light",
  isLoading: true,

  setThemeMode: async (mode: ThemeMode) => {
    console.log("[Theme] Setting theme mode to:", mode);
    set({ themeMode: mode });

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      console.log("[Theme] Theme saved to storage:", mode);
    } catch (error) {
      console.error("Error saving theme:", error);
    }

    // Update color scheme if not system mode
    if (mode !== "system") {
      set({ colorScheme: mode });
      console.log("[Theme] Color scheme updated to:", mode);
    } else {
      console.log("[Theme] System mode selected, will use device setting");
    }
  },

  updateColorScheme: (scheme: ColorScheme) => {
    const { themeMode } = get();
    // Only update if in system mode
    if (themeMode === "system") {
      set({ colorScheme: scheme });
    }
  },

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      console.log("[Theme] Loaded theme from storage:", savedTheme);
      if (savedTheme && (savedTheme === "system" || savedTheme === "light" || savedTheme === "dark")) {
        set({ themeMode: savedTheme as ThemeMode });

        // Set initial color scheme
        if (savedTheme !== "system") {
          set({ colorScheme: savedTheme as ColorScheme });
          console.log("[Theme] Color scheme set to:", savedTheme);
        }
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

/**
 * Hook to get the current theme mode label
 */
export const useThemeModeLabel = (): string => {
  const themeMode = useThemeStore((s) => s.themeMode);

  switch (themeMode) {
    case "system":
      return "System Default";
    case "light":
      return "Light";
    case "dark":
      return "Dark";
    default:
      return "System Default";
  }
};

/**
 * Hook to initialize theme from system preferences
 */
export const useInitializeTheme = () => {
  const systemColorScheme = useColorScheme();
  const themeMode = useThemeStore((s) => s.themeMode);
  const updateColorScheme = useThemeStore((s) => s.updateColorScheme);
  const loadTheme = useThemeStore((s) => s.loadTheme);

  // Load saved theme on mount
  React.useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Update color scheme when system changes (only if in system mode)
  React.useEffect(() => {
    if (themeMode === "system" && systemColorScheme) {
      updateColorScheme(systemColorScheme);
    }
  }, [systemColorScheme, themeMode, updateColorScheme]);
};
