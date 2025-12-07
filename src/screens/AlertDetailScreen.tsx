import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/lib/theme';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import { CheckCircle2, XCircle, AlertCircle, Clock, Phone } from 'lucide-react-native';
import { api } from '@/lib/api';
import type { GetAlertLogResponse, AlertDelivery } from '../../shared/contracts';

type AlertDetailRouteProp = RouteProp<RootStackParamList, 'AlertDetail'>;

/**
 * AlertDetailScreen - Per-station delivery status view
 * Shows detailed delivery information for each station that received an alert
 * Displays: status (sent/delivered/failed/bounced), timestamps, error reasons
 */
export default function AlertDetailScreen() {
  const colors = useThemeColors();
  const route = useRoute<AlertDetailRouteProp>();
  const { alertId } = route.params;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<GetAlertLogResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlertDetail();
  }, [alertId]);

  const fetchAlertDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<GetAlertLogResponse>(`/alert-logs/${alertId}`);
      setData(response);
    } catch (err) {
      console.error('Error fetching alert detail:', err);
      setError('Failed to load alert details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 size={20} color="#10B981" />;
      case 'sent':
        return <Clock size={20} color={colors.systemBlue} />;
      case 'failed':
      case 'bounced':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <AlertCircle size={20} color={colors.textSecondary} />;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'delivered':
        return { label: 'Delivered', color: '#10B981' };
      case 'sent':
        return { label: 'Sent', color: colors.systemBlue };
      case 'failed':
        return { label: 'Failed', color: '#EF4444' };
      case 'bounced':
        return { label: 'Bounced', color: '#EF4444' };
      default:
        return { label: status, color: colors.textSecondary };
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderDeliveryItem = (delivery: AlertDelivery) => {
    const statusInfo = getStatusDisplay(delivery.status);
    const isFailed = delivery.status === 'failed' || delivery.status === 'bounced';

    return (
      <View
        key={delivery.id}
        className="mb-3 p-4 rounded-lg"
        style={{
          backgroundColor: colors.cardBackground,
          borderWidth: 1,
          borderColor: isFailed ? '#FEE2E2' : colors.border,
          ...(isFailed && { backgroundColor: '#FEF2F2' }),
        }}
      >
        {/* Market Name and Status */}
        <View className="flex-row items-start justify-between mb-2">
          <Text
            className="text-base font-semibold flex-1"
            style={{ color: colors.textPrimary }}
          >
            {delivery.marketName}
          </Text>
          <View className="flex-row items-center ml-2">
            {getStatusIcon(delivery.status)}
            <Text
              className="text-sm font-semibold ml-1"
              style={{ color: statusInfo.color }}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Phone Info */}
        <View className="flex-row items-center mb-2">
          <Phone size={14} color={colors.textSecondary} />
          <Text className="text-sm ml-2" style={{ color: colors.textSecondary }}>
            {delivery.phoneLabel}: {delivery.phoneNumber}
          </Text>
        </View>

        {/* Timestamps */}
        <Text className="text-xs" style={{ color: colors.textTertiary }}>
          Sent: {formatTimestamp(delivery.sentAt)}
        </Text>
        {delivery.deliveredAt && (
          <Text className="text-xs mt-1" style={{ color: colors.textTertiary }}>
            Delivered: {formatTimestamp(delivery.deliveredAt)}
          </Text>
        )}
        {delivery.readAt && (
          <Text className="text-xs mt-1" style={{ color: colors.textTertiary }}>
            Read: {formatTimestamp(delivery.readAt)}
          </Text>
        )}

        {/* Error Reason (if failed) */}
        {isFailed && delivery.errorReason && (
          <View className="mt-3 p-2 rounded" style={{ backgroundColor: '#FEE2E2' }}>
            <Text className="text-xs font-semibold mb-1" style={{ color: '#991B1B' }}>
              Error:
            </Text>
            <Text className="text-xs" style={{ color: '#991B1B' }}>
              {delivery.errorReason}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.systemBlue} />
        <Text className="mt-4 text-base" style={{ color: colors.textSecondary }}>
          Loading delivery status...
        </Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.background }}
      >
        <Text className="text-base text-center mb-4" style={{ color: colors.textSecondary }}>
          {error || 'Alert not found'}
        </Text>
        <TouchableOpacity
          onPress={fetchAlertDetail}
          className="px-6 py-3 rounded-lg"
          style={{ backgroundColor: colors.systemBlue }}
        >
          <Text className="text-base font-semibold text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { log, deliveries, stats } = data;
  const hasFailures = stats.failed > 0 || stats.bounced > 0;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Add padding to account for transparent header */}
        <View className="pt-20 flex-1">
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            {/* Alert Info Card */}
            <View
              className="mb-4 p-4 rounded-lg"
              style={{
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text className="text-xl font-bold mb-2" style={{ color: colors.textPrimary }}>
                {log.alertType === 'voice' ? 'Voice Alert' : 'Text Alert'}
              </Text>

              {log.message && (
                <Text className="text-sm mb-3" style={{ color: colors.textSecondary }}>
                  {log.message}
                </Text>
              )}

              {log.audioDuration && (
                <Text className="text-sm mb-3" style={{ color: colors.textSecondary }}>
                  Duration: {Math.round(log.audioDuration)}s
                </Text>
              )}

              <Text className="text-xs" style={{ color: colors.textTertiary }}>
                {formatTimestamp(log.createdAt)}
                {log.sentBy && ` • Sent by ${log.sentBy}`}
              </Text>
            </View>

            {/* Stats Overview */}
            <View
              className="mb-4 p-4 rounded-lg"
              style={{
                backgroundColor: hasFailures ? '#FEF2F2' : colors.cardBackground,
                borderWidth: 1,
                borderColor: hasFailures ? '#FEE2E2' : colors.border,
              }}
            >
              <Text className="text-base font-bold mb-3" style={{ color: colors.textPrimary }}>
                Delivery Summary
              </Text>

              <View className="flex-row flex-wrap">
                <View className="w-1/2 mb-2">
                  <Text className="text-2xl font-bold" style={{ color: colors.systemBlue }}>
                    {stats.sent}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    Sent
                  </Text>
                </View>

                <View className="w-1/2 mb-2">
                  <Text className="text-2xl font-bold" style={{ color: '#10B981' }}>
                    {stats.delivered}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>
                    Delivered
                  </Text>
                </View>

                {hasFailures && (
                  <>
                    <View className="w-1/2 mb-2">
                      <Text className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                        {stats.failed}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        Failed
                      </Text>
                    </View>

                    <View className="w-1/2 mb-2">
                      <Text className="text-2xl font-bold" style={{ color: '#EF4444' }}>
                        {stats.bounced}
                      </Text>
                      <Text className="text-xs" style={{ color: colors.textSecondary }}>
                        Bounced
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Delivery List Header */}
            <Text className="text-lg font-bold mb-3" style={{ color: colors.textPrimary }}>
              Station Delivery Status ({deliveries.length})
            </Text>

            {/* Failed/Bounced items first (if any) */}
            {deliveries
              .filter((d) => d.status === 'failed' || d.status === 'bounced')
              .map(renderDeliveryItem)}

            {/* Then other statuses */}
            {deliveries
              .filter((d) => d.status !== 'failed' && d.status !== 'bounced')
              .map(renderDeliveryItem)}

            {/* Bottom Spacing */}
            <View className="h-8" />
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
