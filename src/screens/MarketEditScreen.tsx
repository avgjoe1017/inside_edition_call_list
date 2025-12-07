import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Save, X, Plus, Trash2 } from "lucide-react-native";
import type { RootStackScreenProps } from "@/navigation/types";
import { useMarketStore, type PhoneNumber } from "@/state/marketStore";
import { TimePicker } from "@/components/TimePicker";
import { TimezonePicker } from "@/components/TimezonePicker";
import { useThemeColors } from "@/lib/theme";
import { validateAndFormatPhone } from "@/lib/phoneValidator";
import { useMarketQuery, useUpdateMarketMutation } from "@/hooks/useMarkets";

type Props = RootStackScreenProps<"MarketEdit">;

type EditablePhone = {
  id?: string;
  label: string;
  number: string;
  isPrimary: boolean;
  isNew?: boolean;
};

export default function MarketEditScreen({ navigation, route }: Props) {
  const { marketId } = route.params;
  const colors = useThemeColors();
  
  const { data: market, isLoading } = useMarketQuery(marketId);
  const updateMarketMutation = useUpdateMarketMutation();

  const [name, setName] = useState(market?.name || "");
  const [stationCallLetters, setStationCallLetters] = useState(market?.stationCallLetters || "");
  const [airTime, setAirTime] = useState(market?.airTime || "");
  const [timezone, setTimezone] = useState(market?.timezone || "EST");
  const [list, setList] = useState<"3pm" | "6pm">(market?.list || "6pm");
  const [phones, setPhones] = useState<EditablePhone[]>(
    market?.phones.map((p) => ({ ...p, isNew: false })) || []
  );
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }} className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary.text} />
      </View>
    );
  }

  if (!market) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }} className="items-center justify-center">
        <Text style={{ color: colors.textTertiary }}>Market not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Market name is required");
      return;
    }
    if (!airTime.trim()) {
      Alert.alert("Error", "Air time is required");
      return;
    }
    if (phones.length === 0) {
      Alert.alert("Error", "At least one phone number is required");
      return;
    }

    const primaryCount = phones.filter((p) => p.isPrimary).length;
    if (primaryCount === 0) {
      Alert.alert("Error", "At least one phone must be marked as primary");
      return;
    }
    if (primaryCount > 1) {
      Alert.alert("Error", "Only one phone can be marked as primary");
      return;
    }

    // Validate all phone numbers
    const invalidPhones: string[] = [];
    for (let i = 0; i < phones.length; i++) {
      const phone = phones[i];
      if (!phone.label.trim()) {
        invalidPhones.push(`Phone ${i + 1}: Label is required`);
        continue;
      }
      if (!phone.number.trim()) {
        invalidPhones.push(`Phone ${i + 1}: Number is required`);
        continue;
      }
      const validation = validateAndFormatPhone(phone.number.trim(), "US");
      if (!validation.isValid) {
        invalidPhones.push(`Phone ${i + 1} (${phone.label}): ${validation.error || "Invalid phone number format"}`);
      }
    }

    if (invalidPhones.length > 0) {
      Alert.alert("Invalid Phone Numbers", invalidPhones.join("\n"));
      return;
    }

    try {
      // Format phone numbers before sending
      const formattedPhones = phones.map((p) => {
        const validation = validateAndFormatPhone(p.number.trim(), "US");
        return {
          id: p.isNew ? undefined : p.id,
          label: p.label.trim(),
          number: validation.formatted || p.number.trim(), // Use formatted if available, fallback to original
          isPrimary: p.isPrimary,
        };
      });

      const updateData = {
        name: name.trim(),
        stationCallLetters: stationCallLetters.trim(),
        airTime: airTime.trim(),
        timezone: timezone,
        list,
        phones: formattedPhones,
      };

      console.log("📤 Sending update:", updateData);

      await updateMarketMutation.mutateAsync({ marketId, data: updateData });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error("❌ Update error:", error);
      Alert.alert("Error", "Failed to save changes");
    }
  };

  const handleAddPhone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhones([...phones, { label: "", number: "", isPrimary: false, isNew: true }]);
  };

  const handleDeletePhone = (index: number) => {
    if (phones.length <= 1) {
      Alert.alert("Error", "Cannot delete the last phone number");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newPhones = phones.filter((_, i) => i !== index);
    setPhones(newPhones);
  };

  const handleSetPrimary = (index: number) => {
    Haptics.selectionAsync();
    setPhones(phones.map((p, i) => ({ ...p, isPrimary: i === index })));
  };

  const updatePhone = (index: number, field: keyof EditablePhone, value: string | boolean) => {
    const newPhones = [...phones];
    newPhones[index] = { ...newPhones[index], [field]: value };
    setPhones(newPhones);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={["top"]}>
        {/* Header */}
        <View style={{ backgroundColor: colors.cardBackground, borderBottomWidth: 1, borderBottomColor: colors.border }} className="px-4 py-3">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => navigation.goBack()}
              className="flex-row items-center active:opacity-70"
            >
              <X size={24} color={colors.textSecondary} strokeWidth={2} />
              <Text style={{ color: colors.textSecondary }} className="text-base ml-2">Cancel</Text>
            </Pressable>

            <Text style={{ color: colors.textPrimary }} className="text-lg font-bold">Edit Market</Text>

            <Pressable
              onPress={handleSave}
              disabled={updateMarketMutation.isPending}
              className="flex-row items-center active:opacity-70"
            >
              <Save size={20} color={colors.blue.text} strokeWidth={2} />
              <Text style={{ color: colors.blue.text }} className="text-base font-semibold ml-2">
                {updateMarketMutation.isPending ? "Saving..." : "Save"}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" contentContainerClassName="p-4">
        {/* Market Info Section */}
        <View className="mb-6">
          <Text style={{ color: colors.textTertiary }} className="text-xs font-semibold uppercase tracking-wide mb-3">
            Market Information
          </Text>

          <View style={{ backgroundColor: colors.cardBackground }} className="rounded-2xl p-4 mb-3">
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mb-2">Market Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter market name"
              placeholderTextColor={colors.textTertiary}
              cursorColor={colors.textPrimary}
              selectionColor={colors.textPrimary}
              style={{
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: colors.inputBackground
              }}
              className="text-base border rounded-lg px-3 py-2"
            />
          </View>

          <View style={{ backgroundColor: colors.cardBackground }} className="rounded-2xl p-4 mb-3">
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mb-2">Station Call Letters</Text>
            <TextInput
              value={stationCallLetters}
              onChangeText={setStationCallLetters}
              placeholder="e.g., WCBS, WABC"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              cursorColor={colors.textPrimary}
              selectionColor={colors.textPrimary}
              style={{
                color: colors.textPrimary,
                borderColor: colors.border,
                backgroundColor: colors.inputBackground
              }}
              className="text-base border rounded-lg px-3 py-2"
            />
          </View>

          <View className="mb-3">
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mb-2">Air Time</Text>
            <TimePicker value={airTime} onChange={setAirTime} />
          </View>

          <View className="mb-3">
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mb-2">Timezone</Text>
            <TimezonePicker
              value={timezone}
              onChange={(tz) => setTimezone(tz || "EST")}
            />
          </View>

          <View className="mb-3">
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mb-2">List</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setList("3pm")}
                className="flex-1 p-4 rounded-xl border-2"
                style={{
                  borderColor: list === "3pm" ? colors.amber.text : colors.border,
                  backgroundColor: list === "3pm" ? colors.amber.background : colors.cardBackground,
                }}
              >
                <Text
                  className="text-center font-semibold"
                  style={{ color: list === "3pm" ? colors.amber.text : colors.textTertiary }}
                >
                  3pm List
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setList("6pm")}
                className="flex-1 p-4 rounded-xl border-2"
                style={{
                  borderColor: list === "6pm" ? colors.purple.text : colors.border,
                  backgroundColor: list === "6pm" ? colors.purple.background : colors.cardBackground,
                }}
              >
                <Text
                  className="text-center font-semibold"
                  style={{ color: list === "6pm" ? colors.purple.text : colors.textTertiary }}
                >
                  6pm List
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Phone Numbers Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.textTertiary }} className="text-xs font-semibold uppercase tracking-wide">
              Phone Numbers
            </Text>
            <Pressable
              onPress={handleAddPhone}
              className="flex-row items-center rounded-lg px-3 py-1.5 active:opacity-70"
              style={{ backgroundColor: colors.blue.text }}
            >
              <Plus size={16} color="#FFF" strokeWidth={2.5} />
              <Text className="text-sm font-semibold text-white ml-1">Add</Text>
            </Pressable>
          </View>

          {phones.map((phone, index) => (
            <View
              key={index}
              className="rounded-2xl p-4 mb-3"
              style={{
                backgroundColor: colors.cardBackground,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              {/* Primary Toggle */}
              <Pressable
                onPress={() => handleSetPrimary(index)}
                className="flex-row items-center justify-between mb-3 pb-3"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
              >
                <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold">Primary Contact</Text>
                <View
                  className="w-12 h-6 rounded-full"
                  style={{ backgroundColor: phone.isPrimary ? colors.blue.text : colors.border }}
                >
                  <View
                    className={`w-5 h-5 rounded-full bg-white mt-0.5 ${
                      phone.isPrimary ? "ml-6" : "ml-0.5"
                    }`}
                  />
                </View>
              </Pressable>

              {/* Label */}
              <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mb-2">Label</Text>
              <TextInput
                value={phone.label}
                onChangeText={(text) => updatePhone(index, "label", text)}
                placeholder="e.g., Main Station, News Desk"
                placeholderTextColor={colors.textTertiary}
                cursorColor={colors.textPrimary}
                selectionColor={colors.textPrimary}
                style={{
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground
                }}
                className="text-base border rounded-lg px-3 py-2 mb-3"
              />

              {/* Phone Number */}
              <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mb-2">Phone Number</Text>
              <TextInput
                value={phone.number}
                onChangeText={(text) => updatePhone(index, "number", text)}
                placeholder="e.g., +1 (212) 555-1234"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
                cursorColor={colors.textPrimary}
                selectionColor={colors.textPrimary}
                style={{
                  color: colors.textPrimary,
                  borderColor: colors.border,
                  backgroundColor: colors.inputBackground
                }}
                className="text-base border rounded-lg px-3 py-2 mb-3"
              />

              {/* Delete Button */}
              {phones.length > 1 && (
                <Pressable
                  onPress={() => handleDeletePhone(index)}
                  className="flex-row items-center justify-center py-2 active:opacity-70"
                >
                  <Trash2 size={18} color="#EF4444" strokeWidth={2} />
                  <Text className="text-sm font-semibold text-red-500 ml-2">Delete</Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
