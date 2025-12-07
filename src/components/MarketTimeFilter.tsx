import React from "react";
import { View, TextInput, Pressable } from "react-native";
import { Clock, X } from "lucide-react-native";
import { useThemeColors } from "@/lib/theme";

interface MarketTimeFilterProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function MarketTimeFilter({ value, onChangeText, placeholder = "Filter by air time (10pm, 7:30...)" }: MarketTimeFilterProps) {
  const colors = useThemeColors();

  return (
    <View className="mb-2">
      <View
        className="flex-row items-center rounded-full px-3 py-2"
        style={{
          backgroundColor: colors.isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)",
          borderWidth: 1,
          borderColor: colors.borderLight,
        }}
      >
        <Clock size={16} color={colors.textTertiary} strokeWidth={2} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          cursorColor={colors.textPrimary}
          selectionColor={colors.textPrimary}
          className="flex-1 ml-2 text-sm"
          style={{ color: colors.textPrimary }}
        />
        {value !== "" && (
          <Pressable onPress={() => onChangeText("")} className="ml-1">
            <X size={16} color={colors.textTertiary} strokeWidth={2} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
