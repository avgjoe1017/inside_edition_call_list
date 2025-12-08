import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/types";
import MarketListScreen from "@/screens/MarketListScreen";
import MarketDetailScreen from "@/screens/MarketDetailScreen";
import MarketEditScreen from "@/screens/MarketEditScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import EditHistoryScreen from "@/screens/EditHistoryScreen";
import { CallLogsScreen } from "@/screens/CallLogsScreen";
import VoiceAlertScreen from "@/screens/VoiceAlertScreen";
import TextAlertScreen from "@/screens/TextAlertScreen";
import AlertHistoryScreen from "@/screens/AlertHistoryScreen";
import AlertDetailScreen from "@/screens/AlertDetailScreen";
import { useThemeColors } from "@/lib/theme";
import { View, Text, Image } from "react-native";
import { BurgerMenu } from "@/components/BurgerMenu";

/**
 * RootStackNavigator
 * Simple stack navigator for the market directory app
 */
const RootStack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const colors = useThemeColors();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerLargeTitle: false,
        headerTransparent: true,
        headerBlurEffect: undefined,
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerShadowVisible: false,
        headerTintColor: colors.systemBlue,
        headerTitleStyle: {
          color: colors.textPrimary,
        },
        headerBackVisible: false,
        headerLeft: () => null,
        headerRight: () => <BurgerMenu />,
      }}
    >
      <RootStack.Screen
        name="MarketList"
        component={MarketListScreen}
        options={{
          headerTitle: "",
          headerLeft: () => (
            <View style={{ marginLeft: 16 }}>
              <Image
                source={require("../../assets/image-1765046972.png")}
                style={{ width: 120, height: 40 }}
                resizeMode="contain"
              />
            </View>
          ),
          headerBackButtonMenuEnabled: false,
          headerTransparent: false,
          headerStyle: {
            backgroundColor: colors.cardBackground,
          },
          headerShadowVisible: false,
        }}
      />
      <RootStack.Screen
        name="MarketDetail"
        component={MarketDetailScreen}
        options={{
          title: "Contact Details",
        }}
      />
      <RootStack.Screen
        name="MarketEdit"
        component={MarketEditScreen}
        options={{
          title: "Edit Market",
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
        }}
      />
      <RootStack.Screen
        name="EditHistory"
        component={EditHistoryScreen}
        options={{
          title: "Edit History",
        }}
      />
      <RootStack.Screen
        name="CallLogs"
        component={CallLogsScreen}
        options={{
          title: "Call History",
        }}
      />
      <RootStack.Screen
        name="VoiceAlert"
        component={VoiceAlertScreen}
        options={{
          title: "Voice Alert",
        }}
      />
      <RootStack.Screen
        name="TextAlert"
        component={TextAlertScreen}
        options={{
          title: "Text Alert",
        }}
      />
      <RootStack.Screen
        name="AlertHistory"
        component={AlertHistoryScreen}
        options={{
          title: "Alert History",
        }}
      />
      <RootStack.Screen
        name="AlertDetail"
        component={AlertDetailScreen}
        options={{
          title: "Delivery Status",
        }}
      />
    </RootStack.Navigator>
  );
};

export default RootNavigator;
