//DO NOT REMOVE THIS CODE
import "react-native-gesture-handler";
import "./global.css";
import "react-native-get-random-values";
import { LogBox } from "react-native";
import { registerRootComponent } from "expo";
import App from "./App";
console.log("[index] Project ID is: ", process.env.EXPO_PUBLIC_VIBECODE_PROJECT_ID);
LogBox.ignoreLogs([
  "Expo AV has been deprecated", 
  "Disconnected from Metro",
  "SafeAreaView has been deprecated",
  "runtime not ready",
  "Exception in HostFunction"
]);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
