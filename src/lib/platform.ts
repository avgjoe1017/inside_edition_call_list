/**
 * Platform Detection Utilities
 * Helps handle platform-specific features gracefully
 */

import { Platform } from "react-native";

/**
 * Check if running on web
 */
export const isWeb = Platform.OS === "web";

/**
 * Check if running on iOS
 */
export const isIOS = Platform.OS === "ios";

/**
 * Check if running on Android
 */
export const isAndroid = Platform.OS === "android";

/**
 * Check if running on native (iOS or Android)
 */
export const isNative = isIOS || isAndroid;

/**
 * Safe haptic feedback - no-op on web
 */
export const safeHaptics = {
  impactAsync: async (style?: any) => {
    if (isNative) {
      const Haptics = await import("expo-haptics");
      return Haptics.impactAsync(style);
    }
    // No-op on web
  },
  selectionAsync: async () => {
    if (isNative) {
      const Haptics = await import("expo-haptics");
      return Haptics.selectionAsync();
    }
    // No-op on web
  },
  notificationAsync: async (type?: any) => {
    if (isNative) {
      const Haptics = await import("expo-haptics");
      return Haptics.notificationAsync(type);
    }
    // No-op on web
  },
};

/**
 * Check if voice recording is supported
 * Voice recording requires native audio APIs
 */
export const supportsVoiceRecording = isNative;

/**
 * Check if phone calls can be initiated
 * Works on all platforms but behavior differs
 */
export const supportsPhoneCalls = true; // tel: links work everywhere

/**
 * Get platform-specific styles
 */
export const getPlatformStyles = () => ({
  // Web needs different scroll behavior
  scrollBehavior: isWeb ? "smooth" : undefined,
  // Web doesn't support native shadows the same way
  useShadow: isNative,
});

