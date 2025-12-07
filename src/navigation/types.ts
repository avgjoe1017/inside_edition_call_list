import type { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  MarketList: undefined;
  MarketDetail: { marketId: string };
  MarketEdit: { marketId: string };
  Settings: undefined;
  EditHistory: undefined;
  CallLogs: undefined;
  AlertHistory: undefined;
  AlertDetail: { alertId: string };
  GeminiTest: undefined;
  VoiceAlert: undefined;
  TextAlert: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
