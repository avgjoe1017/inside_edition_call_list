import React from "react";
import { View, TextInput, Pressable } from "react-native";
import { Search, X } from "lucide-react-native";
import { useThemeColors } from "@/lib/theme";

interface MarketSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function MarketSearchBar({ value, onChangeText, placeholder = "Search markets or #..." }: MarketSearchBarProps) {
  const colors = useThemeColors();

  return (
    <View className="mb-2">
      <View
        className="flex-row items-center rounded-xl px-3 py-2.5"
        style={{ backgroundColor: colors.isDark ? "#2C2C2E" : "#F3F4F6" }}
      >
        <Search size={18} color={colors.textTertiary} strokeWidth={2} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          cursorColor={colors.textPrimary}
          selectionColor={colors.textPrimary}
          className="flex-1 ml-2 text-base"
          style={{ color: colors.textPrimary }}
        />
        {value !== "" && (
          <Pressable onPress={() => onChangeText("")} className="ml-1">
            <X size={18} color={colors.textTertiary} strokeWidth={2} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
