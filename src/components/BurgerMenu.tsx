import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { Menu, X, List, History, Mic, MessageSquare, Settings as SettingsIcon, Bell } from 'lucide-react-native';
import { useThemeColors } from '@/lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}

export const BurgerMenuButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-4 p-2"
      activeOpacity={0.7}
    >
      <Menu size={24} color={colors.textPrimary} />
    </TouchableOpacity>
  );
};

export const BurgerMenu: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const handleNavigate = (screen: keyof RootStackParamList) => {
    setVisible(false);
    // @ts-ignore - Navigation typing is complex, but this is safe for screens without params
    navigation.navigate(screen);
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Call List',
      icon: <List size={22} color={colors.textPrimary} />,
      onPress: () => handleNavigate('MarketList'),
    },
    {
      title: 'Call Log',
      icon: <History size={22} color={colors.textPrimary} />,
      onPress: () => handleNavigate('CallLogs'),
    },
    {
      title: 'Voice Alert',
      icon: <Mic size={22} color={colors.textPrimary} />,
      onPress: () => handleNavigate('VoiceAlert'),
    },
    {
      title: 'Text Alert',
      icon: <MessageSquare size={22} color={colors.textPrimary} />,
      onPress: () => handleNavigate('TextAlert'),
    },
    {
      title: 'Alert History',
      icon: <Bell size={22} color={colors.textPrimary} />,
      onPress: () => handleNavigate('AlertHistory'),
    },
    {
      title: 'Settings',
      icon: <SettingsIcon size={22} color={colors.textPrimary} />,
      onPress: () => handleNavigate('Settings'),
    },
  ];

  return (
    <>
      <BurgerMenuButton onPress={() => setVisible(true)} />

      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setVisible(false)}
        >
          <Pressable
            className="ml-auto h-full"
            style={{
              backgroundColor: colors.cardBackground,
              width: '85%',
              maxWidth: 400,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              className="flex-1"
              style={{ paddingTop: insets.top }}
            >
              {/* Header */}
              <View
                className="flex-row items-center justify-between px-6 py-4"
                style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
              >
                <Text
                  className="text-2xl font-bold"
                  style={{ color: colors.textPrimary }}
                >
                  Menu
                </Text>
                <TouchableOpacity
                  onPress={() => setVisible(false)}
                  className="p-2"
                  activeOpacity={0.7}
                >
                  <X size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Menu Items */}
              <ScrollView className="flex-1 px-6 py-4">
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                    className="flex-row items-center py-4"
                    style={{
                      borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border
                    }}
                  >
                    <View className="mr-4">
                      {item.icon}
                    </View>
                    <Text
                      className="text-lg font-medium"
                      style={{ color: colors.textPrimary }}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
