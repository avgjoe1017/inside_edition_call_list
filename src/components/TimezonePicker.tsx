import React from "react";
import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";
import { useThemeColors } from "@/lib/theme";

interface TimezonePickerProps {
  value: string | null; // "EST", "CST", "MST", "PST", or null
  onChange: (value: string | null) => void;
}

const US_TIMEZONES = [
  { code: "EST", name: "Eastern (EST)" },
  { code: "CST", name: "Central (CST)" },
  { code: "MST", name: "Mountain (MST)" },
  { code: "PST", name: "Pacific (PST)" },
];

export function TimezonePicker({ value, onChange }: TimezonePickerProps) {
  const colors = useThemeColors();

  const handleSelect = (timezone: string | null) => {
    Haptics.selectionAsync();
    onChange(timezone);
  };

  return (
    <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.cardBackground }}>
      {/* None/EST option (default) */}
      <Pressable
        onPress={() => handleSelect(null)}
        className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <View>
          <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
            Eastern (EST)
          </Text>
          <Text className="text-sm mt-0.5" style={{ color: colors.textTertiary }}>Default timezone</Text>
        </View>
        {(value === null || value === "" || value === "EST") && (
          <Check size={20} color={colors.blue.text} strokeWidth={2.5} />
        )}
      </Pressable>

      {/* Other US timezones */}
      {US_TIMEZONES.filter((tz) => tz.code !== "EST").map((timezone, index, arr) => (
        <Pressable
          key={timezone.code}
          onPress={() => handleSelect(timezone.code)}
          className="flex-row items-center justify-between px-4 py-3.5 active:opacity-70"
          style={index < arr.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border } : undefined}
        >
          <Text className="text-base font-medium" style={{ color: colors.textPrimary }}>
            {timezone.name}
          </Text>
          {value === timezone.code && (
            <Check size={20} color={colors.blue.text} strokeWidth={2.5} />
          )}
        </Pressable>
      ))}
    </View>
  );
}
