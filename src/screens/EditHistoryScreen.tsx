import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock } from "lucide-react-native";
import type { RootStackScreenProps } from "@/navigation/types";
import { api } from "@/lib/api";
import type { EditLog, GetEditLogsResponse } from "shared/contracts";
import { useThemeColors, useThemedShadow } from "@/lib/theme";

type Props = RootStackScreenProps<"EditHistory">;

interface GroupedLogs {
  [date: string]: EditLog[];
}

export default function EditHistoryScreen({ navigation }: Props) {
  const [logs, setLogs] = useState<EditLog[]>([]);
  const [groupedLogs, setGroupedLogs] = useState<GroupedLogs>({});
  const [isLoading, setIsLoading] = useState(true);

  const colors = useThemeColors();
  const shadow = useThemedShadow();

  useEffect(() => {
    fetchEditLogs();
  }, []);

  const fetchEditLogs = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<GetEditLogsResponse>("/api/edit-logs");
      setLogs(data.logs);
      setGroupedLogs(data.groupedLogs);
    } catch (error) {
      console.error("Error fetching edit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    // Otherwise format as "Mon DD"
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatFieldName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      name: "Market Name",
      stationCallLetters: "Station Call Letters",
      airTime: "Air Time",
      localTimezone: "Local Timezone",
      phoneNumber: "Phone Number",
      primaryPhone: "Primary Contact",
    };
    return fieldNames[field] || field;
  };

  const getChangeDescription = (log: EditLog): string => {
    const fieldName = formatFieldName(log.field);

    if (log.oldValue && log.newValue) {
      return `Updated: ${fieldName}`;
    } else if (!log.oldValue && log.newValue) {
      return `Added: ${fieldName}`;
    } else if (log.oldValue && !log.newValue) {
      return `Deleted: ${fieldName}`;
    }

    return `Changed: ${fieldName}`;
  };

  const getChangeDetails = (log: EditLog): string => {
    if (log.oldValue && log.newValue) {
      return `${log.oldValue} → ${log.newValue}`;
    } else if (!log.oldValue && log.newValue) {
      return log.newValue;
    } else if (log.oldValue && !log.newValue) {
      return log.oldValue;
    }
    return "";
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.blue.text} />
      </View>
    );
  }

  if (logs.length === 0) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.background }}>
        <SafeAreaView edges={["top"]} className="flex-1">
          <View className="flex-1 items-center justify-center px-8">
            <Clock size={64} color={colors.textTertiary} strokeWidth={1.5} />
            <Text className="text-lg font-semibold mt-4" style={{ color: colors.textPrimary }}>No Edit History</Text>
            <Text className="text-sm text-center mt-2" style={{ color: colors.textSecondary }}>
              Changes to markets will appear here
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView edges={["top", "bottom"]} className="flex-1">
        <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8" contentContainerStyle={{ paddingTop: 80 }}>
          {Object.keys(groupedLogs)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
            .map((date) => (
              <View key={date} className="mb-6">
                <Text className="text-xs font-semibold uppercase tracking-wide px-4 mb-3" style={{ color: colors.textSecondary }}>
                  {formatDate(date)}
                </Text>

                {groupedLogs[date].map((log) => (
                  <View
                    key={log.id}
                    className="rounded-2xl px-4 py-4 mb-3"
                    style={{ backgroundColor: colors.cardBackground, ...shadow }}
                  >
                    <View className="flex-row items-start">
                      <View className="flex-1">
                        <Text className="text-base font-semibold" style={{ color: colors.textPrimary }}>
                          {getChangeDescription(log)}
                        </Text>

                        {getChangeDetails(log) && (
                          <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
                            {getChangeDetails(log)}
                          </Text>
                        )}

                        <View className="flex-row items-center mt-2">
                          <Text className="text-xs" style={{ color: colors.textTertiary }}>
                            by {log.editedBy || "Unknown"}
                          </Text>
                          <Text className="text-xs mx-2" style={{ color: colors.textTertiary }}>•</Text>
                          <Text className="text-xs" style={{ color: colors.textTertiary }}>
                            {formatTime(log.createdAt)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
