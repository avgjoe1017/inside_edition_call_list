import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { Loader2, Globe } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
import type { RootStackScreenProps } from "@/navigation/types";
import { useThemeColors } from "@/lib/theme";
import type { RecipientGroup, GetAlertGroupsResponse } from "@/shared/contracts";
import { api } from "@/lib/api";
import { isWeb, supportsVoiceRecording } from "@/lib/platform";
import { RecipientGroupSelector } from "@/components/RecipientGroupSelector";
import { RecordingControls } from "@/components/RecordingControls";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";

type Props = RootStackScreenProps<"VoiceAlert">;

// Fallback mock data if API fails
const FALLBACK_GROUPS: RecipientGroup[] = [
  { id: "all", name: "All Stations", description: "Send to all stations", recipientCount: 0, list: "all" },
  { id: "3pm", name: "3PM Feed", description: "3pm broadcast list", recipientCount: 0, list: "3pm" },
  { id: "5pm", name: "5PM Feed", description: "5pm broadcast list", recipientCount: 0, list: "5pm" },
  { id: "6pm", name: "6PM Feed", description: "6pm broadcast list", recipientCount: 0, list: "6pm" },
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

export default function VoiceAlertScreen({ navigation }: Props) {
  const colors = useThemeColors();

  const [groups, setGroups] = useState<RecipientGroup[]>(FALLBACK_GROUPS);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [audioUploaded, setAudioUploaded] = useState(false);

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const {
    recordingState,
    recordingDuration,
    audioUri,
    isPlaying,
    startRecording,
    stopRecording,
    cancelRecording,
    reRecord,
    togglePlayback,
    formatDuration,
  } = useVoiceRecorder();

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
      headerTitle: "Voice Alert",
      headerBackTitle: "Back",
    });
  }, [navigation]);

  const keepRecording = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsUploading(true);

    // Simulate upload for now
    setTimeout(() => {
      setIsUploading(false);
      setAudioUploaded(true);
    }, 1500);
  };

  const handleSend = async () => {
    if (!selectedGroup || !audioUri || !audioUploaded) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSending(true);

    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSending(false);

      Alert.alert(
        "Success",
        `Voice alert sent to ${selectedGroup.recipientCount} recipients.`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error("Failed to send voice alert:", error);
      setIsSending(false);
      Alert.alert("Error", "There was a problem sending this alert. Please try again.");
    }
  };

  const canSend = selectedGroup && audioUri && audioUploaded && !isSending;

  // Show web unsupported message
  if (isWeb || !supportsVoiceRecording) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 120, alignItems: "center", justifyContent: "center", minHeight: "100%" }}>
          <Globe size={64} color={colors.textTertiary} strokeWidth={1.5} />
          <Text style={{ fontSize: 24, fontWeight: "700", color: colors.textPrimary, marginTop: 24, textAlign: "center" }}>
            Voice Alerts Not Available
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 12, textAlign: "center", lineHeight: 24, maxWidth: 320 }}>
            Voice recording requires the mobile app. Please use the Inside Edition Call List app on iOS or Android to send voice alerts.
          </Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 24, textAlign: "center" }}>
            Text alerts are available on all platforms.
          </Text>
          <Pressable
            onPress={() => navigation.navigate("TextAlert")}
            style={({ pressed }) => ({
              marginTop: 24,
              paddingVertical: 14,
              paddingHorizontal: 28,
              backgroundColor: colors.systemBlue,
              borderRadius: 12,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}>
              Send Text Alert Instead
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 120, paddingBottom: 140 }}>
        {/* Header Info */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 }}>
            Voice Alert
          </Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary, lineHeight: 22 }}>
            Record a message and send it to selected stations.
          </Text>
        </View>

        <RecipientGroupSelector
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={setSelectedGroupId}
        />

        <RecordingControls
          recordingState={recordingState}
          recordingDuration={recordingDuration}
          isPlaying={isPlaying}
          isUploading={isUploading}
          audioUploaded={audioUploaded}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onCancelRecording={cancelRecording}
          onReRecord={reRecord}
          onKeepRecording={keepRecording}
          onTogglePlayback={togglePlayback}
          formatDuration={formatDuration}
        />
      </ScrollView>

      {/* Fixed Footer - Review and Send Bar */}
      {selectedGroup && audioUri && (
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
                Message length: {formatDuration(recordingDuration)}
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
                  {isSending ? "Sending..." : "Send Voice Alert"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
