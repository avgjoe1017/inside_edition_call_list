import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";

type RecordingState = "initial" | "recording" | "review";

const MAX_RECORDING_DURATION = 60; // 60 seconds

export function useVoiceRecorder() {
  const [recordingState, setRecordingState] = useState<RecordingState>("initial");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, [sound, recording]);

  const startRecording = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission Required", "Please allow microphone access to record voice alerts.");
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setRecordingState("recording");
      setRecordingDuration(0);

      // Update duration every second
      const interval = setInterval(() => {
        setRecordingDuration(prev => {
          const next = prev + 1;
          if (next >= MAX_RECORDING_DURATION) {
            stopRecording();
            clearInterval(interval);
          }
          return next;
        });
      }, 1000);

    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setRecording(null);
      setAudioUri(uri);
      setRecordingState("review");

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording. Please try again.");
    }
  };

  const cancelRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      setRecording(null);
    }
    setRecordingState("initial");
    setRecordingDuration(0);
    setAudioUri(null);
    Haptics.selectionAsync();
  };

  const reRecord = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setRecordingState("initial");
    setRecordingDuration(0);
    setAudioUri(null);
    setIsPlaying(false);
    Haptics.selectionAsync();
  };

  const togglePlayback = async () => {
    if (!audioUri) return;

    try {
      Haptics.selectionAsync();

      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error("Failed to play audio:", error);
      Alert.alert("Error", "Failed to play audio. Please try again.");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
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
  };
}
