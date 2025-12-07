import React from "react";
import { View, Text, Pressable } from "react-native";
import { Phone, ChevronRight, AlertTriangle } from "lucide-react-native";
import type { Market, PhoneNumber } from "@/state/marketStore";
import { useThemeColors, useThemedShadow } from "@/lib/theme";

interface MarketCardProps {
  market: Market;
  primaryPhone: PhoneNumber;
  phoneHasFailed: boolean;
  onCall: (phoneNumber: string, marketName: string, marketId: string, phoneLabel: string) => void;
  onViewDetails: (marketId: string) => void;
}

export function MarketCard({ market, primaryPhone, phoneHasFailed, onCall, onViewDetails }: MarketCardProps) {
  const colors = useThemeColors();
  const shadow = useThemedShadow();
  
  // Use amber for 3pm list, purple for 6pm list
  const badgeColor = market.list === "3pm" ? colors.amber : colors.purple;

  return (
    <View
      className="mb-3 rounded-xl overflow-hidden"
      style={{
        backgroundColor: colors.cardBackground,
        borderWidth: phoneHasFailed ? 1.5 : 0.5,
        borderColor: phoneHasFailed ? '#FCA5A5' : colors.borderLight,
        ...shadow,
      }}
    >
      {/* Header Section with Market Info */}
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 pr-3">
            {/* Market name - prominent */}
            <Text className="text-xl font-bold mb-1" style={{ color: colors.textPrimary }}>
              {market.name}
            </Text>
            {/* Station call letters */}
            {market.stationCallLetters && (
              <Text className="text-sm font-medium" style={{ color: colors.textTertiary }}>
                {market.stationCallLetters}
              </Text>
            )}
          </View>
          {/* Market number badge - inspired by status badges */}
          <View
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: badgeColor.background }}
          >
            <Text className="text-sm font-bold" style={{ color: badgeColor.text }}>
              #{market.marketNumber}
            </Text>
          </View>
        </View>

        {/* Air time info with subtle background */}
        <View
          className="flex-row items-center px-3 py-2 rounded-lg mt-2"
          style={{ backgroundColor: colors.isDark ? '#2C2C2E' : '#F9FAFB' }}
        >
          <Text className="text-sm" style={{ color: colors.textTertiary }}>
            Airs at{" "}
          </Text>
          <Text className="text-sm font-semibold" style={{ color: colors.textSecondary }}>
            {market.airTime} {market.timezone}
          </Text>
        </View>

        {/* Failure indicator badge */}
        {phoneHasFailed && (
          <View
            className="flex-row items-center px-3 py-2 rounded-lg mt-2"
            style={{ backgroundColor: '#FEE2E2' }}
          >
            <AlertTriangle size={14} color="#DC2626" />
            <Text className="text-sm font-semibold ml-2" style={{ color: '#DC2626' }}>
              Recent delivery failure
            </Text>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: colors.borderLight }} />

      {/* Phone Section */}
      <Pressable
        onPress={() => onCall(primaryPhone.number, market.name, market.id, primaryPhone.label)}
        className="px-4 py-3.5 flex-row items-center"
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
        })}
      >
        {/* Phone icon */}
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mr-3" 
          style={{ backgroundColor: colors.primary.text }}
        >
          <Phone size={18} color="white" strokeWidth={2.5} />
        </View>
        
        {/* Phone info */}
        <View className="flex-1">
          <Text className="text-base font-semibold mb-0.5" style={{ color: colors.textPrimary }}>
            {primaryPhone.number}
          </Text>
          <Text className="text-xs" style={{ color: colors.textTertiary }}>
            {primaryPhone.label}
          </Text>
        </View>

        {/* Call indicator */}
        <View
          className="px-3 py-1.5 rounded-full"
          style={{ backgroundColor: colors.primary.background }}
        >
          <Text className="text-sm font-semibold" style={{ color: colors.primary.text }}>
            Call
          </Text>
        </View>
      </Pressable>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: colors.borderLight }} />

      {/* View Details Button */}
      <Pressable
        onPress={() => onViewDetails(market.id)}
        className="px-4 py-3 flex-row items-center justify-center"
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
        })}
      >
        <Text className="text-sm font-medium mr-1" style={{ color: colors.primary.text }}>
          View Details
        </Text>
        <ChevronRight size={16} color={colors.primary.text} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
