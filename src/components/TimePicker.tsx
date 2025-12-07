import React, { useRef, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { useThemeColors } from "@/lib/theme";

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

interface TimePickerProps {
  value: string; // "10:00 PM" format
  onChange: (value: string) => void;
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const colors = useThemeColors();
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = ["00", "30"];
  const periods = ["AM", "PM"];

  // Parse current value
  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      return {
        hour: parseInt(match[1]),
        minute: match[2],
        period: match[3].toUpperCase(),
      };
    }
    return { hour: 10, minute: "00", period: "PM" };
  };

  const { hour, minute, period } = parseTime(value);

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const periodScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to initial positions
    setTimeout(() => {
      hourScrollRef.current?.scrollTo({
        y: (hour - 1) * ITEM_HEIGHT,
        animated: false,
      });
      minuteScrollRef.current?.scrollTo({
        y: minutes.indexOf(minute) * ITEM_HEIGHT,
        animated: false,
      });
      periodScrollRef.current?.scrollTo({
        y: periods.indexOf(period) * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, []);

  const handleScroll = (
    type: "hour" | "minute" | "period",
    event: any
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);

    let newHour = hour;
    let newMinute = minute;
    let newPeriod = period;

    if (type === "hour" && index >= 0 && index < hours.length) {
      newHour = hours[index];
    } else if (type === "minute" && index >= 0 && index < minutes.length) {
      newMinute = minutes[index];
    } else if (type === "period" && index >= 0 && index < periods.length) {
      newPeriod = periods[index];
    } else {
      return; // Invalid index, don't update
    }

    const newValue = `${newHour}:${newMinute} ${newPeriod}`;
    if (newValue !== value) {
      Haptics.selectionAsync();
      onChange(newValue);
    }
  };

  const renderPickerColumn = (
    data: any[],
    selected: any,
    scrollRef: any,
    onScroll: any
  ) => {
    const containerHeight = ITEM_HEIGHT * VISIBLE_ITEMS;

    return (
      <View style={{ height: containerHeight }} className="relative">
        {/* Selection indicator */}
        <View
          className="absolute left-0 right-0 rounded-lg"
          style={{
            backgroundColor: colors.border,
            top: ITEM_HEIGHT * 2,
            height: ITEM_HEIGHT,
            zIndex: 0,
          }}
        />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onScroll}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * 2,
          }}
        >
          {data.map((item, index) => {
            const isSelected = item === selected;
            return (
              <View
                key={index}
                style={{ height: ITEM_HEIGHT }}
                className="items-center justify-center"
              >
                <Text
                  className="text-xl"
                  style={{
                    color: isSelected ? colors.textPrimary : colors.textTertiary,
                    fontWeight: isSelected ? "700" : "500",
                  }}
                >
                  {item}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View className="rounded-2xl p-4" style={{ backgroundColor: colors.cardBackground }}>
      <View className="flex-row items-center justify-center">
        {/* Hours */}
        <View className="flex-1">
          {renderPickerColumn(
            hours,
            hour,
            hourScrollRef,
            (e: any) => handleScroll("hour", e)
          )}
        </View>

        {/* Colon */}
        <View className="px-2">
          <Text className="text-2xl font-bold" style={{ color: colors.textPrimary }}>:</Text>
        </View>

        {/* Minutes */}
        <View className="flex-1">
          {renderPickerColumn(
            minutes,
            minute,
            minuteScrollRef,
            (e: any) => handleScroll("minute", e)
          )}
        </View>

        {/* Period */}
        <View className="flex-1 ml-4">
          {renderPickerColumn(
            periods,
            period,
            periodScrollRef,
            (e: any) => handleScroll("period", e)
          )}
        </View>
      </View>
    </View>
  );
}
