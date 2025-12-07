import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors, useThemedShadow } from '@/lib/theme';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { Mic, MessageSquare, Users, Clock, ChevronRight } from 'lucide-react-native';
import { useAlertLogsQuery } from '@/hooks/useAlertLogs';
import { formatAlertTime, formatAlertDate, getRecipientGroupMeta } from '@/utils/format';
import type { AlertLog } from '../../shared/contracts';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * AlertHistoryScreen - Unified alert history showing all voice and text alerts
 * Displays complete audit trail with:
 * - Alert type (voice/text)
 * - Timestamp
 * - Recipient group (All Stations / 3:30 Feed / 6:00 Feed)
 * - Sender
 * - Tap to see per-station delivery status
 */
export default function AlertHistoryScreen() {
  const colors = useThemeColors();
  const shadow = useThemedShadow();
  const navigation = useNavigation<NavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  
  const { data, isLoading, error, refetch } = useAlertLogsQuery();
  
  // Convert error to string for display
  const errorMessage = error ? 'Failed to load alert history' : null;
  const groupedLogs = data?.groupedLogs || {};

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderAlertItem = (log: AlertLog) => {
    const isVoice = log.alertType === 'voice';
    const recipientInfo = getRecipientGroupMeta(log.recipientGroup, colors);

    return (
      <TouchableOpacity
        key={log.id}
        onPress={() => navigation.navigate('AlertDetail', { alertId: log.id })}
        activeOpacity={0.7}
        className="mb-3 rounded-xl overflow-hidden"
        style={{
          backgroundColor: colors.cardBackground,
          ...shadow,
        }}
      >
        {/* Header Row */}
        <View className="flex-row items-start justify-between p-4">
          <View className="flex-row items-center flex-1">
            {/* Icon */}
            <View
              className="mr-3 p-2.5 rounded-full"
              style={{ backgroundColor: isVoice ? '#EEF2FF' : '#F0FDF4' }}
            >
              {isVoice ? (
                <Mic size={20} color="#6366F1" />
              ) : (
                <MessageSquare size={20} color="#10B981" />
              )}
            </View>

            {/* Alert Type and Timestamp */}
            <View className="flex-1">
              <Text
                className="text-lg font-bold mb-1"
                style={{ color: colors.textPrimary }}
              >
                {isVoice ? 'Voice Alert' : 'Text Alert'}
              </Text>
              <View className="flex-row items-center">
                <Clock size={14} color={colors.textTertiary} />
                <Text
                  className="text-sm ml-1"
                  style={{ color: colors.textTertiary }}
                >
                  {formatAlertTime(log.createdAt)}
                </Text>
              </View>
            </View>

            {/* Chevron */}
            <ChevronRight size={20} color={colors.textTertiary} />
          </View>
        </View>

        {/* Message Preview (for text alerts) */}
        {!isVoice && log.message && (
          <Text
            className="text-sm mb-3"
            style={{ color: colors.textSecondary }}
            numberOfLines={2}
          >
            {log.message}
          </Text>
        )}

        {/* Voice Duration (for voice alerts) */}
        {isVoice && log.audioDuration && (
          <Text
            className="text-sm mb-3"
            style={{ color: colors.textSecondary }}
          >
            Duration: {Math.round(log.audioDuration)}s
          </Text>
        )}

        {/* Footer: Recipient Group and Count */}
        <View className="flex-row items-center justify-between pt-3" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
          <View className="flex-row items-center">
            <Users size={16} color={recipientInfo.color} />
            <Text
              className="text-sm font-medium ml-2"
              style={{ color: recipientInfo.color }}
            >
              {recipientInfo.label}
            </Text>
          </View>
          <Text
            className="text-sm font-medium"
            style={{ color: colors.textSecondary }}
          >
            {log.recipientCount} {log.recipientCount === 1 ? 'station' : 'stations'}
          </Text>
        </View>

        {/* Sender Info */}
        {log.sentBy && (
          <Text
            className="text-xs mt-2"
            style={{ color: colors.textTertiary }}
          >
            Sent by {log.sentBy}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.systemBlue} />
        <Text className="mt-4 text-base" style={{ color: colors.textSecondary }}>
          Loading alert history...
        </Text>
      </View>
    );
  }

  const dateKeys = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const hasLogs = dateKeys.length > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Add padding to account for transparent header */}
        <View className="pt-20 flex-1">
          {error ? (
            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-base text-center mb-4" style={{ color: colors.textSecondary }}>
                Failed to load alert history
              </Text>
              <TouchableOpacity
                onPress={() => refetch()}
                className="px-6 py-3 rounded-lg"
                style={{ backgroundColor: colors.systemBlue }}
              >
                <Text className="text-base font-semibold text-white">
                  Try Again
                </Text>
              </TouchableOpacity>
            </View>
          ) : !hasLogs ? (
            <View className="flex-1 items-center justify-center px-6">
              <View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: colors.cardBackground }}
              >
                <MessageSquare size={36} color={colors.textSecondary} />
              </View>
              <Text className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                No Alerts Yet
              </Text>
              <Text className="text-base text-center" style={{ color: colors.textSecondary }}>
                Voice and text alerts will appear here when sent.
              </Text>
            </View>
          ) : (
            <ScrollView
              className="flex-1 px-4"
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.systemBlue}
                />
              }
            >
              {dateKeys.map((date) => (
                <View key={date} className="mb-6">
                  {/* Date Header */}
                  <Text
                    className="text-lg font-bold mb-3"
                    style={{ color: colors.textPrimary }}
                  >
                    {formatAlertDate(date)}
                  </Text>

                  {/* Alert Items */}
                  {groupedLogs[date].map((log) => renderAlertItem(log))}
                </View>
              ))}

              {/* Bottom Spacing */}
              <View className="h-8" />
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
