import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Sparkles } from "lucide-react-native";
import type { RootStackScreenProps } from "@/navigation/types";
import { useThemeColors } from "@/lib/theme";
import { generateText, generateJSON } from "@/lib/gemini";

type Props = RootStackScreenProps<"GeminiTest">;

export default function GeminiTestScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const [prompt, setPrompt] = useState("Tell me a fun fact about space");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateText = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const result = await generateText(prompt.trim());
      setResponse(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate text");
      console.error("[GeminiTest] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateJSON = async () => {
    setIsLoading(true);
    setError("");
    setResponse("");

    try {
      const result = await generateJSON<{ fact: string; category: string }>(
        "Tell me an interesting fact about the ocean",
        {
          type: 'object',
          properties: {
            fact: { type: 'string' },
            category: { type: 'string' }
          }
        }
      );
      setResponse(JSON.stringify(result, null, 2));
    } catch (err: any) {
      setError(err.message || "Failed to generate JSON");
      console.error("[GeminiTest] Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
        <ScrollView className="flex-1 p-4">
          {/* Header */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <Sparkles size={28} color={colors.primary.icon} strokeWidth={2} />
              <Text className="text-2xl font-bold ml-2" style={{ color: colors.textPrimary }}>
                Gemini API Test
              </Text>
            </View>
            <Text className="text-sm" style={{ color: colors.textTertiary }}>
              Test Google Gemini 3 Pro integration
            </Text>
          </View>

          {/* Input Section */}
          <View
            className="p-4 rounded-2xl mb-4"
            style={{
              backgroundColor: colors.cardBackground,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>
              Enter your prompt:
            </Text>
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Ask Gemini anything..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={3}
              cursorColor={colors.primary.text}
              selectionColor={colors.primary.background}
              className="text-base p-3 rounded-xl"
              style={{
                color: colors.textPrimary,
                backgroundColor: colors.isDark ? "#2C2C2E" : "#F9FAFB",
                minHeight: 80,
              }}
            />
          </View>

          {/* Buttons */}
          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={handleGenerateText}
              disabled={isLoading || !prompt.trim()}
              className="flex-1 py-3 rounded-xl active:opacity-70"
              style={{
                backgroundColor: colors.primary.text,
                opacity: isLoading || !prompt.trim() ? 0.5 : 1,
              }}
            >
              <Text className="text-center font-semibold text-white">
                Generate Text
              </Text>
            </Pressable>

            <Pressable
              onPress={handleGenerateJSON}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl active:opacity-70"
              style={{
                backgroundColor: colors.green.icon,
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              <Text className="text-center font-semibold text-white">
                Test JSON
              </Text>
            </Pressable>
          </View>

          {/* Loading */}
          {isLoading && (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color={colors.primary.icon} />
              <Text className="text-sm mt-2" style={{ color: colors.textTertiary }}>
                Generating response...
              </Text>
            </View>
          )}

          {/* Error */}
          {error && (
            <View
              className="p-4 rounded-2xl mb-4"
              style={{
                backgroundColor: colors.red.background,
                borderWidth: 1,
                borderColor: colors.red.text,
              }}
            >
              <Text className="font-semibold mb-1" style={{ color: colors.red.text }}>
                Error:
              </Text>
              <Text style={{ color: colors.red.text }}>
                {error}
              </Text>
            </View>
          )}

          {/* Response */}
          {response && (
            <View
              className="p-4 rounded-2xl"
              style={{
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text className="text-sm font-semibold mb-2" style={{ color: colors.textSecondary }}>
                Response:
              </Text>
              <Text className="text-base leading-6" style={{ color: colors.textPrimary }}>
                {response}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
