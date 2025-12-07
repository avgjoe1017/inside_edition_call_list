import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, Linking, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ChevronRight, Moon, Mail, AlertCircle, Check } from "lucide-react-native";
import type { RootStackScreenProps } from "@/navigation/types";
import { useThemeStore, useThemeModeLabel, type ThemeMode } from "@/state/themeStore";
import { useThemeColors, useThemedShadow } from "@/lib/theme";

type Props = RootStackScreenProps<"Settings">;

export default function SettingsScreen({ navigation }: Props) {
  const [showThemeModal, setShowThemeModal] = useState(false);
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const themeModeLabel = useThemeModeLabel();
  const colors = useThemeColors();
  const shadow = useThemedShadow();

  const handleThemePress = () => {
    Haptics.selectionAsync();
    setShowThemeModal(true);
  };

  const handleThemeSelect = (mode: ThemeMode) => {
    Haptics.selectionAsync();
    setThemeMode(mode);
    setShowThemeModal(false);
  };

  const handleLoginPress = () => {
    Haptics.selectionAsync();
    Alert.alert(
      "Log In",
      "Authentication is coming soon! Log in to track your edits across devices.",
      [{ text: "OK", style: "default" }]
    );
  };

  const handleEditHistoryPress = () => {
    Haptics.selectionAsync();
    navigation.navigate("EditHistory");
  };

  const handleReportPress = () => {
    Haptics.selectionAsync();
    Alert.alert(
      "Report Incorrect Number",
      "Please contact support to report any incorrect information.",
      [{ text: "OK", style: "default" }]
    );
  };

  const handleSupportPress = () => {
    Haptics.selectionAsync();
    const email = "support@inside911.com";
    const subject = "INSIDE 911 App Support";
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`);
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8" contentContainerStyle={{ paddingTop: 80 }}>
          {/* Appearance Section */}
          <View className="mb-6">
            <Text className="text-xs font-semibold uppercase tracking-wide px-4 mb-3" style={{ color: colors.textSecondary }}>
              Appearance
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.cardBackground, ...shadow }}
            >
              <Pressable
                onPress={handleThemePress}
                className="flex-row items-center px-4 py-4"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
                })}
              >
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.indigo.background }}>
                  <Moon size={18} color={colors.indigo.icon} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>Theme</Text>
                  <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>{themeModeLabel}</Text>
                </View>
                <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          {/* Account Section */}
          <View className="mb-6">
            <Text className="text-xs font-semibold uppercase tracking-wide px-4 mb-3" style={{ color: colors.textSecondary }}>
              Account
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.cardBackground, ...shadow }}
            >
              <Pressable
                onPress={handleLoginPress}
                className="flex-row items-center px-4 py-4"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
                })}
              >
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.blue.background }}>
                  <Text className="text-lg font-semibold" style={{ color: colors.blue.text }}>?</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>Log In</Text>
                  <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>Track your changes</Text>
                </View>
                <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          {/* Data Section */}
          <View className="mb-6">
            <Text className="text-xs font-semibold uppercase tracking-wide px-4 mb-3" style={{ color: colors.textSecondary }}>
              Data
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.cardBackground, ...shadow }}
            >
              <Pressable
                onPress={handleEditHistoryPress}
                className="flex-row items-center px-4 py-4"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
                })}
              >
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>View Edit History</Text>
                  <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>See what was changed and when</Text>
                </View>
                <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          {/* Support Section */}
          <View className="mb-6">
            <Text className="text-xs font-semibold uppercase tracking-wide px-4 mb-3" style={{ color: colors.textSecondary }}>
              Support
            </Text>
            <View
              className="rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.cardBackground, ...shadow }}
            >
              <Pressable
                onPress={handleReportPress}
                className="flex-row items-center px-4 py-4"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderLight,
                })}
              >
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.orange.background }}>
                  <AlertCircle size={18} color={colors.orange.icon} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>Report Incorrect Number</Text>
                </View>
                <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
              </Pressable>

              <Pressable
                onPress={handleSupportPress}
                className="flex-row items-center px-4 py-4"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
                })}
              >
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.green.background }}>
                  <Mail size={18} color={colors.green.icon} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>Contact Support</Text>
                </View>
                <ChevronRight size={20} color={colors.textTertiary} strokeWidth={2} />
              </Pressable>
            </View>
          </View>

          {/* Version */}
          <View className="items-center mt-4">
            <Text className="text-sm" style={{ color: colors.textTertiary }}>App Version 1.0.0</Text>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center px-6"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onPress={() => setShowThemeModal(false)}
        >
          <Pressable
            className="rounded-3xl w-full max-w-sm overflow-hidden"
            style={{ backgroundColor: colors.cardBackground, ...shadow }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="px-6 pt-6 pb-4" style={{ borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
              <Text className="text-xl font-bold" style={{ color: colors.textPrimary }}>Choose Theme</Text>
              <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                Select your preferred theme
              </Text>
            </View>

            {/* Theme Options */}
            <View className="py-2">
              {/* System Default */}
              <Pressable
                onPress={() => handleThemeSelect("system")}
                className="flex-row items-center px-6 py-4"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
                })}
              >
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>System Default</Text>
                  <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                    Follow device settings
                  </Text>
                </View>
                {themeMode === "system" && (
                  <Check size={24} color={colors.blue.text} strokeWidth={2.5} />
                )}
              </Pressable>

              {/* Light */}
              <Pressable
                onPress={() => handleThemeSelect("light")}
                className="flex-row items-center px-6 py-4"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
                })}
              >
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>Light</Text>
                  <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                    Always use light theme
                  </Text>
                </View>
                {themeMode === "light" && (
                  <Check size={24} color={colors.blue.text} strokeWidth={2.5} />
                )}
              </Pressable>

              {/* Dark */}
              <Pressable
                onPress={() => handleThemeSelect("dark")}
                className="flex-row items-center px-6 py-4"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
                })}
              >
                <View className="flex-1">
                  <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>Dark</Text>
                  <Text className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                    Always use dark theme
                  </Text>
                </View>
                {themeMode === "dark" && (
                  <Check size={24} color={colors.blue.text} strokeWidth={2.5} />
                )}
              </Pressable>
            </View>

            {/* Cancel Button */}
            <View className="px-6 pb-6 pt-2">
              <Pressable
                onPress={() => {
                  Haptics.selectionAsync();
                  setShowThemeModal(false);
                }}
                className="rounded-xl py-4"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.borderLight : colors.cardBackgroundHover,
                })}
              >
                <Text className="text-center text-base font-semibold" style={{ color: colors.textPrimary }}>
                  Cancel
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
