import React from "react";
import { View, Text, ScrollView, Pressable, Linking, Alert, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import type { RootStackScreenProps } from "@/navigation/types";
import { useMarketStore, type Market, type PhoneNumber } from "@/state/marketStore";
import { useThemeColors, useThemedShadow } from "@/lib/theme";
import { api } from "@/lib/api";
import { useMarketsQuery } from "@/hooks/useMarkets";
import { MarketSearchBar } from "@/components/MarketSearchBar";
import { MarketTimeFilter } from "@/components/MarketTimeFilter";
import { MarketFilterBar } from "@/components/MarketFilterBar";
import { MarketCard } from "@/components/MarketCard";

type Props = RootStackScreenProps<"MarketList">;

export default function MarketListScreen({ navigation }: Props) {
  const getFilteredMarkets = useMarketStore((s) => s.getFilteredMarkets);
  const filterText = useMarketStore((s) => s.filterText);
  const filterTime = useMarketStore((s) => s.filterTime);
  const filterList = useMarketStore((s) => s.filterList);
  const setFilterText = useMarketStore((s) => s.setFilterText);
  const setFilterTime = useMarketStore((s) => s.setFilterTime);
  const setFilterList = useMarketStore((s) => s.setFilterList);

  const colors = useThemeColors();
  const shadow = useThemedShadow();

  // Fetch markets using React Query
  const { data: marketsData = [], isLoading, error } = useMarketsQuery();
  const markets = getFilteredMarkets(marketsData);
  const hasActiveFilters = filterText.trim() !== "" || filterTime.trim() !== "" || filterList !== "all";

  const handleCall = async (phoneNumber: string, marketName: string, marketId: string, phoneLabel: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, "");

    Alert.alert(
      "Call " + marketName,
      phoneNumber,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Call",
          onPress: async () => {
            // Log that the user actually placed a call
            try {
              await api.post("/api/call-logs", {
                marketId,
                marketName,
                phoneNumber,
                phoneLabel,
                action: "called" as const,
                calledBy: null,
              });
            } catch (error) {
              console.error("Failed to log call action:", error);
            }

            Linking.openURL(`tel:${cleanNumber}`);
          },
        },
      ]
    );
  };

  const handleViewDetails = (marketId: string) => {
    Haptics.selectionAsync();
    navigation.navigate("MarketDetail", { marketId });
  };

  const getPrimaryPhone = (market: Market): PhoneNumber => {
    return market.phones.find((p: PhoneNumber) => p.isPrimary) || market.phones[0];
  };

  // Check if a phone number has recent failures (within last 7 days)
  const hasRecentFailure = (phone: PhoneNumber): boolean => {
    if (!phone.lastFailedAt || !phone.failureCount || phone.failureCount === 0) {
      return false;
    }
    const lastFailed = new Date(phone.lastFailedAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return lastFailed > sevenDaysAgo;
  };

  const clearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilterText("");
    setFilterTime("");
    setFilterList("all");
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      {/* Filter Section - Card style */}
      <View
        className="mx-4 mt-3 mb-3 p-4 rounded-xl"
        style={{
          backgroundColor: colors.cardBackground,
          ...shadow,
        }}
      >
        <MarketSearchBar value={filterText} onChangeText={setFilterText} />
        <MarketTimeFilter value={filterTime} onChangeText={setFilterTime} />
        <MarketFilterBar
          filterList={filterList}
          onFilterChange={setFilterList}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
      >
        {isLoading ? (
          <View className="items-center justify-center py-12">
            <ActivityIndicator size="large" color={colors.primary.text} />
            <Text className="text-base mt-4" style={{ color: colors.textTertiary }}>Loading markets...</Text>
          </View>
        ) : error ? (
          <View className="items-center justify-center py-12">
            <Text className="text-base" style={{ color: colors.textTertiary }}>Failed to load markets</Text>
            <Text className="text-sm mt-1" style={{ color: colors.textTertiary }}>Please try again</Text>
          </View>
        ) : markets.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-base" style={{ color: colors.textTertiary }}>No markets found</Text>
            <Text className="text-sm mt-1" style={{ color: colors.textTertiary }}>Try different filters</Text>
          </View>
        ) : (
          <>
            {markets.map((market) => {
              const primaryPhone = getPrimaryPhone(market);
              const phoneHasFailed = hasRecentFailure(primaryPhone);

              return (
                <MarketCard
                  key={market.id}
                  market={market}
                  primaryPhone={primaryPhone}
                  phoneHasFailed={phoneHasFailed}
                  onCall={handleCall}
                  onViewDetails={handleViewDetails}
                />
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}
