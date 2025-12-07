import React from "react";
import { View, Text, ScrollView, Pressable, Linking, Alert, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { Phone, Star, ArrowLeft, Edit3 } from "lucide-react-native";
import type { RootStackScreenProps } from "@/navigation/types";
import { useMarketStore, type PhoneNumber } from "@/state/marketStore";
import { useThemeColors, useThemedShadow } from "@/lib/theme";
import { api } from "@/lib/api";
import { useMarketQuery, useSetPrimaryPhoneMutation } from "@/hooks/useMarkets";

type Props = RootStackScreenProps<"MarketDetail">;

export default function MarketDetailScreen({ navigation, route }: Props) {
  const { marketId } = route.params;
  const colors = useThemeColors();
  const shadow = useThemedShadow();
  
  const { data: market, isLoading } = useMarketQuery(marketId);
  const setPrimaryPhoneMutation = useSetPrimaryPhoneMutation();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary.text} />
      </View>
    );
  }

  if (!market) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Text style={{ color: colors.textTertiary }}>Market not found</Text>
      </View>
    );
  }

  const handleCall = async (phoneNumber: string, phoneLabel: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Log that the user viewed the call alert
    try {
      await api.post("/api/call-logs", {
        marketId: market.id,
        marketName: market.name,
        phoneNumber,
        phoneLabel,
        action: "viewed" as const,
        calledBy: null,
      });
    } catch (error) {
      console.error("Failed to log call view:", error);
    }

    const cleanNumber = phoneNumber.replace(/[^0-9+]/g, "");

    Alert.alert(
      "Call",
      phoneNumber,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Call",
          onPress: async () => {
            // Log that the user actually pressed "Call"
            try {
              await api.post("/api/call-logs", {
                marketId: market.id,
                marketName: market.name,
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

  const handleSetPrimary = async (phoneId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await setPrimaryPhoneMutation.mutateAsync({ marketId, phoneId });
    } catch (error) {
      console.error("Failed to set primary phone:", error);
      Alert.alert("Error", "Failed to update primary phone");
    }
  };

  const handleEdit = () => {
    Haptics.selectionAsync();
    navigation.navigate("MarketEdit", { marketId });
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        contentContainerStyle={{ paddingTop: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View
          className="mb-6 rounded-2xl p-5"
          style={{
            backgroundColor: colors.cardBackground,
            ...shadow,
          }}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold" style={{ color: colors.blue.text }}>
              Market #{market.marketNumber}
            </Text>
            <Pressable
              onPress={handleEdit}
              className="flex-row items-center rounded-lg px-3 py-1.5 active:opacity-70"
              style={{ backgroundColor: colors.blue.background }}
            >
              <Edit3 size={16} color={colors.blue.text} strokeWidth={2} />
              <Text className="text-sm font-semibold ml-1.5" style={{ color: colors.blue.text }}>Edit</Text>
            </Pressable>
          </View>
          <Text className="text-2xl font-bold mb-2" style={{ color: colors.textPrimary }}>
            {market.name}
          </Text>
          {market.stationCallLetters && (
            <Text className="text-base font-semibold mb-2" style={{ color: colors.textSecondary }}>
              {market.stationCallLetters}
            </Text>
          )}
          <Text className="text-base mb-3" style={{ color: colors.textSecondary }}>
            Airs at {market.airTime} {market.timezone}
          </Text>
          <Text className="text-sm" style={{ color: colors.textTertiary }}>
            {market.phones.length} {market.phones.length === 1 ? "number" : "numbers"} available
          </Text>
        </View>

        {/* Phone Numbers List */}
        <Text className="text-xs font-semibold uppercase tracking-wide mb-3 px-1" style={{ color: colors.textTertiary }}>
          Phone Numbers
        </Text>

        {market.phones.map((phone: PhoneNumber) => (
          <View
            key={phone.id}
            className="mb-3 rounded-2xl overflow-hidden"
            style={{
              backgroundColor: colors.cardBackground,
              ...shadow,
            }}
          >
            <View className="flex-row">
              {/* Call button area */}
              <Pressable
                onPress={() => handleCall(phone.number, phone.label)}
                className="flex-1 p-4"
                style={({ pressed }) => ({
                  backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
                })}
              >
                <View className="flex-row items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-3"
                    style={{
                      backgroundColor: phone.isPrimary ? colors.blue.text : colors.isDark ? '#2C2C2E' : '#F3F4F6',
                    }}
                  >
                    <Phone
                      size={20}
                      color={phone.isPrimary ? "white" : colors.textTertiary}
                      strokeWidth={2.5}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <Text className="text-base font-semibold mr-2" style={{ color: colors.textPrimary }}>
                        {phone.label}
                      </Text>
                      {phone.isPrimary && (
                        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.blue.background }}>
                          <Text className="text-xs font-medium" style={{ color: colors.blue.text }}>
                            Primary
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm" style={{ color: colors.textSecondary }}>{phone.number}</Text>
                  </View>
                </View>
              </Pressable>

              {/* Set as primary button */}
              {!phone.isPrimary && (
                <Pressable
                  onPress={() => handleSetPrimary(phone.id)}
                  className="w-16 items-center justify-center"
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? colors.cardBackgroundHover : 'transparent',
                    borderLeftWidth: 1,
                    borderLeftColor: colors.borderLight,
                  })}
                >
                  <Star size={20} color={colors.textTertiary} strokeWidth={2} />
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
