# Fix React Native Reanimated iOS Crash

## The Problem

You're getting the `NativeReanimated` error because **React Native Reanimated 3.16.6 doesn't work in Expo Go**. Your terminal shows "Using Expo Go" which is causing the native module crash.

## The Solution

You already have `expo-dev-client` installed, so you just need to build and run with a development build instead of Expo Go.

## Steps to Fix

### 1. Prebuild the native iOS project

```powershell
cd C:\Users\joeba\Documents\inside_edition_call_list
bunx expo prebuild --clean
```

This will generate the `ios/` folder with all native configurations.

### 2. Install CocoaPods dependencies

```powershell
cd ios
pod install --repo-update
cd ..
```

### 3. Build and run on iOS device/simulator

```powershell
bunx expo run:ios
```

This will:
- Build the native app with the dev client
- Install it on your iOS simulator/device
- Start Metro bundler
- Launch the app automatically

### 4. For future runs

After the initial build, you can just use:

```powershell
bunx expo start --dev-client
```

Then scan the QR code with your built development app (NOT Expo Go).

## What Changed

- **Before:** Using Expo Go (doesn't support Reanimated 3.x native modules)
- **After:** Using Expo Dev Client (full native module support)

## Verification

When it works, you should see:
- ✅ No "Using Expo Go" message in terminal
- ✅ "Press s │ switch to development build" (but you'll already be in dev build mode)
- ✅ No `NativeReanimated` or `NativeWorklets` errors
- ✅ The app launches and runs smoothly

## Your babel.config.js is Already Correct

Your `babel.config.js` already has `react-native-reanimated/plugin` as the last plugin, which is correct. No changes needed there.

## Why This Happened

Expo Go has a fixed set of native modules and doesn't include Reanimated 3.x. Any app using:
- react-native-reanimated 3.x
- react-native-gesture-handler (which you have)
- Most other native modules beyond the Expo Go basics

...needs a development build instead of Expo Go.

## Notes

- The first build will take 5-10 minutes
- Subsequent rebuilds are faster (only changed native code)
- You can still use Metro's fast refresh for JS changes
- Your backend at `http://192.168.86.37:3000` will work fine with the dev build
