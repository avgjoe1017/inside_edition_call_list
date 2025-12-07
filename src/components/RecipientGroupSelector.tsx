import React from "react";
import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import type { RecipientGroup } from "@/shared/contracts";
import { useThemeColors, useThemedShadow } from "@/lib/theme";
import { getRecipientGroupMeta } from "@/utils/format";

interface RecipientGroupSelectorProps {
  groups: RecipientGroup[];
  selectedGroupId: string;
  onSelectGroup: (groupId: string) => void;
}

export function RecipientGroupSelector({ groups, selectedGroupId, onSelectGroup }: RecipientGroupSelectorProps) {
  const colors = useThemeColors();
  const shadow = useThemedShadow();

  return (
    <View style={{ marginBottom: 32 }}>
      <Text style={{ fontSize: 17, fontWeight: "600", color: colors.textPrimary, marginBottom: 12 }}>
        Recipients
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {groups.map((group) => {
          const isSelected = selectedGroupId === group.id;
          const meta = getRecipientGroupMeta(group.list, colors);
          const bgColor = isSelected ? meta.backgroundColor : colors.cardBackground;
          const textColor = isSelected ? meta.textColor : colors.textPrimary;

          return (
            <Pressable
              key={group.id}
              onPress={() => {
                Haptics.selectionAsync();
                onSelectGroup(group.id);
              }}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: bgColor,
                paddingVertical: 16,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: isSelected ? 0 : 1,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
                ...shadow,
              })}
            >
              <Text style={{ fontSize: 15, fontWeight: "600", color: textColor, textAlign: "center", marginBottom: 4 }}>
                {group.name}
              </Text>
              <Text style={{ fontSize: 13, color: isSelected ? "#FFFFFF" : colors.textTertiary, textAlign: "center" }}>
                {group.recipientCount} recipients
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
