import React from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/lib/theme";
import { getRecipientGroupMeta } from "@/utils/format";

interface MarketFilterBarProps {
  filterList: "all" | "3pm" | "5pm" | "6pm";
  onFilterChange: (list: "all" | "3pm" | "5pm" | "6pm") => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function MarketFilterBar({ filterList, onFilterChange, hasActiveFilters, onClearFilters }: MarketFilterBarProps) {
  const colors = useThemeColors();

  return (
    <>
      {/* Feed list selector */}
      <View className="flex-row gap-2">
        {(["all", "3pm", "5pm", "6pm"] as const).map((list) => {
          const meta = getRecipientGroupMeta(list, colors);
          const isSelected = filterList === list;

          return (
            <TouchableOpacity
              key={list}
              onPress={() => {
                Haptics.selectionAsync();
                onFilterChange(list);
              }}
              className="flex-1 py-2.5 rounded-lg"
              style={{
                backgroundColor: isSelected ? meta.backgroundColor : colors.cardBackground,
                borderWidth: 1,
                borderColor: isSelected ? meta.color : colors.border,
              }}
            >
              <Text
                className="text-center text-sm font-semibold"
                style={{ color: isSelected ? meta.textColor : colors.textSecondary }}
              >
                {list === "all" ? "All" : list === "3pm" ? "3pm" : list === "5pm" ? "5pm" : "6pm"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Clear all filters button */}
      {hasActiveFilters && (
        <Pressable
          onPress={onClearFilters}
          className="mt-2 py-2 items-center active:opacity-70"
        >
          <Text className="text-sm font-medium" style={{ color: colors.primary.text }}>
            Clear All Filters
          </Text>
        </Pressable>
      )}
    </>
  );
}
