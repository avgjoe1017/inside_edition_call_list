import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Mic, Square, Play, Pause } from "lucide-react-native";
import { useThemeColors, useThemedShadow } from "@/lib/theme";

const MAX_RECORDING_DURATION = 60;

interface RecordingControlsProps {
  recordingState: "initial" | "recording" | "review";
  recordingDuration: number;
  isPlaying: boolean;
  isUploading: boolean;
  audioUploaded: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onCancelRecording: () => void;
  onReRecord: () => void;
  onKeepRecording: () => void;
  onTogglePlayback: () => void;
  formatDuration: (seconds: number) => string;
}

export function RecordingControls({
  recordingState,
  recordingDuration,
  isPlaying,
  isUploading,
  audioUploaded,
  onStartRecording,
  onStopRecording,
  onCancelRecording,
  onReRecord,
  onKeepRecording,
  onTogglePlayback,
  formatDuration,
}: RecordingControlsProps) {
  const colors = useThemeColors();
  const shadow = useThemedShadow();

  return (
    <View style={{
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      ...shadow,
    }}>
      <Text style={{ fontSize: 17, fontWeight: "600", color: colors.textPrimary, marginBottom: 8 }}>
        Record message
      </Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24 }}>
        Use your microphone to record a short message for stations.
      </Text>

      {/* Initial State */}
      {recordingState === "initial" && (
        <View style={{ alignItems: "center", paddingVertical: 32 }}>
          <Pressable
            onPress={onStartRecording}
            style={({ pressed }) => ({
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.systemBlue,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
              ...shadow,
            })}
          >
            <Mic size={40} color="#FFFFFF" strokeWidth={2.5} />
          </Pressable>
          <Text style={{ fontSize: 17, fontWeight: "600", color: colors.textPrimary, marginTop: 16 }}>
            Record
          </Text>
          <Text style={{ fontSize: 14, color: colors.textTertiary, marginTop: 8, textAlign: "center" }}>
            Up to {MAX_RECORDING_DURATION} seconds
          </Text>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 4, textAlign: "center", paddingHorizontal: 20 }}>
            Your browser will ask for microphone permission when you start.
          </Text>
        </View>
      )}

      {/* Recording State */}
      {recordingState === "recording" && (
        <View style={{ alignItems: "center", paddingVertical: 32 }}>
          <Text style={{ fontSize: 15, color: colors.red.text, marginBottom: 16, fontWeight: "600" }}>
            Recording... {formatDuration(recordingDuration)}
          </Text>
          <Pressable
            onPress={onStopRecording}
            style={({ pressed }) => ({
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.red.text,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
              ...shadow,
            })}
          >
            <Square size={40} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
          </Pressable>
          <Text style={{ fontSize: 17, fontWeight: "600", color: colors.textPrimary, marginTop: 16 }}>
            Stop
          </Text>
          <Pressable onPress={onCancelRecording} style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 14, color: colors.systemBlue }}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {/* Review State */}
      {recordingState === "review" && (
        <View style={{ paddingVertical: 16 }}>
          {/* Playback Controls */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <Pressable
              onPress={onTogglePlayback}
              style={({ pressed }) => ({
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.systemBlue,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              {isPlaying ? (
                <Pause size={24} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" strokeWidth={2.5} fill="#FFFFFF" />
              )}
            </Pressable>
            <View style={{ flex: 1, height: 4, backgroundColor: colors.border, borderRadius: 2 }}>
              <View style={{ width: "0%", height: "100%", backgroundColor: colors.systemBlue, borderRadius: 2 }} />
            </View>
            <Text style={{ fontSize: 15, color: colors.textTertiary, minWidth: 44 }}>
              {formatDuration(recordingDuration)}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: colors.textTertiary, marginBottom: 20 }}>
            Recorded just now
          </Text>

          {/* Upload Status */}
          {isUploading && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <ActivityIndicator size="small" color={colors.systemBlue} />
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Uploading audio...</Text>
            </View>
          )}
          {audioUploaded && !isUploading && (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: colors.green.text, fontWeight: "600" }}>✓ Audio uploaded</Text>
            </View>
          )}

          {/* Actions */}
          {!audioUploaded && !isUploading && (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={onReRecord}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.cardBackground,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.textPrimary, textAlign: "center" }}>
                  Re-record
                </Text>
              </Pressable>
              <Pressable
                onPress={onKeepRecording}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 10,
                  backgroundColor: colors.systemBlue,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF", textAlign: "center" }}>
                  Keep recording
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
