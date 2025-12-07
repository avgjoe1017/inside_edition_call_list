import React from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Phone } from "lucide-react-native";
import type { RootStackScreenProps } from "@/navigation/types";
import { useThemeColors } from "@/lib/theme";
import { useCallLogsQuery } from "@/hooks/useCallLogs";
import { formatCallTime, formatAlertDate } from "@/utils/format";

type Props = RootStackScreenProps<"CallLogs">;

export function CallLogsScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const { data, isLoading } = useCallLogsQuery();
  const groupedLogs = data?.groupedLogs || {};

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 80 }}>
          {isLoading ? (
            <View className="items-center justify-center py-20">
              <ActivityIndicator size="large" color={colors.primary.icon} />
            </View>
          ) : Object.keys(groupedLogs).length === 0 ? (
            <View className="items-center justify-center py-20">
              <Phone size={48} color={colors.textQuaternary} strokeWidth={1.5} />
              <Text className="text-lg font-semibold mt-4" style={{ color: colors.textSecondary }}>
                No Call History
              </Text>
              <Text className="text-sm mt-1" style={{ color: colors.textTertiary }}>
                Your call history will appear here
              </Text>
            </View>
          ) : (
            <View className="py-4">
              {Object.keys(groupedLogs)
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                .map((date) => (
                  <View key={date} className="mb-6">
                    <Text
                      className="text-xs font-semibold uppercase tracking-wide mb-3 px-1"
                      style={{ color: colors.textTertiary }}
                    >
                      {formatAlertDate(date)}
                    </Text>

                    {groupedLogs[date].map((log) => (
                      <View
                        key={log.id}
                        className="mb-2 p-4 rounded-xl"
                        style={{
                          backgroundColor: colors.cardBackground,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1">
                            <Text className="text-base font-semibold mb-1" style={{ color: colors.textPrimary }}>
                              {log.marketName}
                            </Text>
                            <Text className="text-sm mb-1" style={{ color: colors.textSecondary }}>
                              {log.phoneLabel} • {log.phoneNumber}
                            </Text>
                            <Text className="text-xs" style={{ color: colors.textTertiary }}>
                              {formatCallTime(log.createdAt)}
                            </Text>
                          </View>

                          <View
                            className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5"
                            style={{
                              backgroundColor: colors.green.background,
                            }}
                          >
                            <Phone size={12} color={colors.green.icon} strokeWidth={2.5} />
                            <Text
                              className="text-xs font-semibold"
                              style={{
                                color: colors.green.text,
                              }}
                            >
                              Called
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
