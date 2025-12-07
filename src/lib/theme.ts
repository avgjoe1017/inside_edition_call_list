import { useThemeStore, type ColorScheme } from "@/state/themeStore";

/**
 * Theme colors that adapt based on the current color scheme
 * Following professional design system principles with proper contrast ratios
 */
export const useThemeColors = () => {
  const colorScheme = useThemeStore((s) => s.colorScheme);

  const isDark = colorScheme === "dark";

  return {
    isDark,

    // Background colors - Professional design inspired by modern iOS apps
    background: isDark ? "#000000" : "#F5F5F7",      // Apple-style light gray background
    cardBackground: isDark ? "#1C1C1E" : "#FFFFFF",
    cardBackgroundHover: isDark ? "#2C2C2E" : "#F9FAFB",
    inputBackground: isDark ? "#2C2C2E" : "#F9FAFB",
    sectionBackground: isDark ? "#1C1C1E" : "#FFFFFF", // For grouped sections

    // Text colors - Improved hierarchy with better contrast
    textPrimary: isDark ? "#FFFFFF" : "#111827",        // Display & headlines
    textSecondary: isDark ? "#EBEBF5" : "#374151",      // Body text - IMPROVED from #98989D / #6B7280
    textTertiary: isDark ? "#98989D" : "#6B7280",       // Captions & metadata
    textQuaternary: isDark ? "#636366" : "#9CA3AF",     // Very subtle text

    // Border colors - More defined
    border: isDark ? "#38383A" : "#D1D5DB",             // Stronger borders - was #E5E7EB
    borderLight: isDark ? "#2C2C2E" : "#E5E7EB",        // Subtle dividers
    borderSubtle: isDark ? "#1C1C1E" : "#F3F4F6",       // Very subtle borders

    // Primary brand color - Blue for CTAs and interactive elements
    primary: {
      background: isDark ? "#1E3A8A" : "#DBEAFE",       // Darker blue bg for better contrast
      text: isDark ? "#60A5FA" : "#0066FF",             // Changed to #0066FF - more vibrant
      icon: isDark ? "#60A5FA" : "#0066FF",
      hover: isDark ? "#2563EB" : "#0052CC",            // New: hover states
    },

    // Secondary accent - Amber/Gold for 3pm list (matches edit screen button)
    amber: {
      background: isDark ? "#451A03" : "#FEF3C7",
      text: isDark ? "#FCD34D" : "#F59E0B",          // Changed to match edit screen: #F59E0B (amber-500)
      icon: isDark ? "#FCD34D" : "#F59E0B",
    },

    // Purple accent for 6pm list (matches edit screen button)
    purple: {
      background: isDark ? "#581C87" : "#F3E8FF",
      text: isDark ? "#C084FC" : "#A855F7",          // Already matches edit screen: #A855F7 (purple-500)
      icon: isDark ? "#C084FC" : "#A855F7",
    },

    // Success/Status colors
    green: {
      background: isDark ? "#065F46" : "#D1FAE5",
      text: isDark ? "#34D399" : "#059669",             // Slightly darker for better contrast
      icon: isDark ? "#34D399" : "#059669",
    },

    // Warning colors
    orange: {
      background: isDark ? "#7C2D12" : "#FFEDD5",
      text: isDark ? "#FB923C" : "#EA580C",
      icon: isDark ? "#FB923C" : "#EA580C",
    },

    // Error/Destructive colors
    red: {
      background: isDark ? "#7F1D1D" : "#FEE2E2",
      text: isDark ? "#F87171" : "#DC2626",
      icon: isDark ? "#F87171" : "#DC2626",
    },

    // Info/Secondary colors (replacing indigo)
    indigo: {
      background: isDark ? "#312E81" : "#E0E7FF",
      text: isDark ? "#A78BFA" : "#6366F1",
      icon: isDark ? "#A78BFA" : "#6366F1",
    },

    // System colors
    systemBlue: "#007AFF",
    systemGray: "#8E8E93",

    // Legacy blue mapping (for backwards compatibility)
    blue: {
      background: isDark ? "#1E3A8A" : "#DBEAFE",
      text: isDark ? "#60A5FA" : "#0066FF",
      icon: isDark ? "#60A5FA" : "#0066FF",
    },
  };
};

/**
 * Get themed shadow style - subtle and professional
 * Inspired by modern iOS/Material Design cards
 */
export const useThemedShadow = () => {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const isDark = colorScheme === "dark";

  if (isDark) {
    return {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 5,
    };
  }

  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,                   // More subtle for professional look
    shadowRadius: 8,
    elevation: 2,
  };
};

/**
 * Lighter shadow for subtle elevation
 */
export const useThemedShadowLight = () => {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const isDark = colorScheme === "dark";

  if (isDark) {
    return {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      elevation: 3,
    };
  }

  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  };
};
