import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert, TextInput, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { Loader2 } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import type { RootStackScreenProps } from "@/navigation/types";
import { useThemeColors, useThemedShadow } from "@/lib/theme";
import type { RecipientGroup, SendTextAlertResponse, GetAlertGroupsResponse } from "@/shared/contracts";
import { api } from "@/lib/api";

type Props = RootStackScreenProps<"TextAlert">;

const SMS_SEGMENT_SIZE = 160;
const MAX_MESSAGE_LENGTH = 320;

// Fallback mock data if API fails
const FALLBACK_GROUPS: RecipientGroup[] = [
  { id: "all", name: "All Stations", description: "Send to all stations", recipientCount: 0, list: "all" },
  { id: "3pm", name: "3:30 Feed", description: "3:30pm broadcast list", recipientCount: 0, list: "3pm" },
  { id: "6pm", name: "6:00 Feed", description: "6:00pm broadcast list", recipientCount: 0, list: "6pm" },
];

// Animated spinning loader component
const SpinningLoader = ({ size = 16, color = "#FFFFFF" }: { size?: number; color?: string }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1, // infinite
      false
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Loader2 size={size} color={color} />
    </Animated.View>
  );
};

// Quick templates
const TEMPLATES = [
  { id: "breaking", label: "Breaking news", content: "Breaking news: [short description]. More details to follow." },
  { id: "programming", label: "Programming note", content: "Programming note: [details]" },
  { id: "weather", label: "Weather / Emergency", content: "Weather alert: [details]. Please stay tuned for updates." },
];

export default function TextAlertScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const shadow = useThemedShadow();

  const [groups, setGroups] = useState<RecipientGroup[]>(FALLBACK_GROUPS);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  // Fetch recipient groups from API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setIsLoadingGroups(true);
        const response = await api.get<GetAlertGroupsResponse>("/api/alert-groups");
        setGroups(response.groups);
      } catch (error) {
        console.error("Failed to fetch alert groups:", error);
        // Keep fallback groups if API fails
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, []);

  // Set up the header
  useEffect(() => {
    navigation.setOptions({
      headerTitle: "Text Alert",
      headerBackTitle: "Back",
    });
  }, [navigation]);

  const calculateSmsSegments = (text: string): number => {
    if (text.length === 0) return 0;
    return Math.ceil(text.length / SMS_SEGMENT_SIZE);
  };

  const smsSegments = calculateSmsSegments(message);
  const charCount = message.length;
  const isMessageValid = message.trim().length > 0 && message.length <= MAX_MESSAGE_LENGTH;

  const handleTemplateSelect = (templateContent: string) => {
    Haptics.selectionAsync();
    setMessage(templateContent);
  };

  const handleSend = async () => {
    if (!selectedGroup || !isMessageValid) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSending(true);

    try {
      const response = await api.post<SendTextAlertResponse>("/api/alerts/text", {
        groupId: selectedGroup.id,
        message: message.trim(),
      });

      setIsSending(false);

      Alert.alert(
        "Success",
        `Text alert sent to ${response.recipientCount} recipients.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error("Failed to send text alert:", error);
      setIsSending(false);
      const errorMessage = error.message?.includes("Twilio is not configured")
        ? "SMS service is not configured. Please contact support."
        : "There was a problem sending this text. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const canSend = selectedGroup && isMessageValid && !isSending;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 120, paddingBottom: 140 }}>
        {/* Header Info */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 }}>
            Text Alert
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 22 }}>
            Send a short SMS update to selected stations.
          </Text>
        </View>

        {/* Recipient Group Selector */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 17, fontWeight: "600", color: colors.textPrimary, marginBottom: 12 }}>
            Recipients
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {groups.map((group) => {
              const isSelected = selectedGroupId === group.id;
              const bgColor = isSelected
                ? group.list === "all" ? colors.systemBlue : group.list === "3pm" ? colors.amber.text : colors.purple.text
                : colors.cardBackground;
              const textColor = isSelected ? "#FFFFFF" : colors.textPrimary;

              return (
                <Pressable
                  key={group.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedGroupId(group.id);
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

        {/* Message Composer */}
        <View style={{
          backgroundColor: colors.cardBackground,
          borderRadius: 16,
          padding: 24,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadow,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: colors.textPrimary }}>
              Compose message
            </Text>
            {TEMPLATES.length > 0 && (
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>
                Templates
              </Text>
            )}
          </View>

          {/* Quick Templates */}
          {TEMPLATES.length > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {TEMPLATES.map((template) => (
                <Pressable
                  key={template.id}
                  onPress={() => handleTemplateSelect(template.content)}
                  style={({ pressed }) => ({
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 16,
                    backgroundColor: colors.inputBackground,
                    borderWidth: 1,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    {template.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Message Input */}
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 8 }}>
              Message
            </Text>
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Type your message to stations..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={5}
              maxLength={MAX_MESSAGE_LENGTH}
              style={{
                backgroundColor: colors.inputBackground,
                borderWidth: 1,
                borderColor: message.length > MAX_MESSAGE_LENGTH ? colors.red.text : colors.border,
                borderRadius: 12,
                padding: 14,
                fontSize: 16,
                color: colors.textPrimary,
                minHeight: 120,
                textAlignVertical: "top",
              }}
            />
          </View>

          {/* Helper Text and Character Counter */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 13, color: colors.textTertiary }}>
              Plain text only. Links are allowed.
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{
                fontSize: 13,
                color: charCount > MAX_MESSAGE_LENGTH ? colors.red.text : colors.textTertiary,
                fontWeight: charCount > MAX_MESSAGE_LENGTH ? "600" : "400",
              }}>
                {charCount} characters
              </Text>
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>·</Text>
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>
                {smsSegments} SMS segment{smsSegments !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {/* Error Message */}
          {message.length > MAX_MESSAGE_LENGTH && (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 13, color: colors.red.text }}>
                Message is too long. Please shorten to {MAX_MESSAGE_LENGTH} characters or fewer.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Footer - Review and Send Bar */}
      {selectedGroup && message.trim().length > 0 && (
        <View style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.cardBackground,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: 32,
          ...shadow,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            {/* Summary */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 2 }}>
                Sending to:
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "600", color: colors.textPrimary, marginBottom: 4 }}>
                {selectedGroup.name} ({selectedGroup.recipientCount} recipients)
              </Text>
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>
                Length: {charCount} characters · {smsSegments} SMS segment{smsSegments !== 1 ? "s" : ""}
              </Text>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={{ paddingVertical: 10, paddingHorizontal: 16 }}
              >
                <Text style={{ fontSize: 16, color: colors.systemBlue }}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSend}
                disabled={!canSend}
                style={({ pressed }) => ({
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 10,
                  backgroundColor: canSend ? colors.systemBlue : colors.border,
                  opacity: pressed ? 0.7 : 1,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                })}
              >
                {isSending && <SpinningLoader size={16} color="#FFFFFF" />}
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
                  {isSending ? "Sending..." : "Send Text Alert"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
