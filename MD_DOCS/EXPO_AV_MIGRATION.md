# Expo AV Migration Guide

## Overview

The `expo-av` package is **deprecated** as of Expo SDK 54 and will be **removed in SDK 55**. The VoiceAlertScreen currently uses `expo-av` for audio recording and playback.

## Current Usage

`src/screens/VoiceAlertScreen.tsx` uses:
- `Audio.Recording` - for recording voice alerts
- `Audio.Sound` - for playing back recorded audio
- `Audio.requestPermissionsAsync()` - for microphone permissions
- `Audio.setAudioModeAsync()` - for configuring audio mode

## Migration Path

### Before SDK 55 Upgrade, migrate to:

1. **For Audio Recording**: Use `expo-audio`
   ```bash
   bunx expo install expo-audio
   ```

2. **For Audio Playback**: Use `expo-audio` (or `expo-video` for video)
   ```bash
   bunx expo install expo-audio
   ```

### Code Changes Required

#### Recording (expo-av → expo-audio)

**Before (expo-av):**
```typescript
import { Audio } from "expo-av";

const { recording } = await Audio.Recording.createAsync(
  Audio.RecordingOptionsPresets.HIGH_QUALITY
);
await recording.stopAndUnloadAsync();
const uri = recording.getURI();
```

**After (expo-audio):**
```typescript
import { useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";

// In component:
const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

// Start recording
audioRecorder.record();

// Stop recording
await audioRecorder.stop();
const uri = audioRecorder.uri;
```

#### Playback (expo-av → expo-audio)

**Before (expo-av):**
```typescript
import { Audio } from "expo-av";

const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
await sound.playAsync();
await sound.pauseAsync();
sound.setOnPlaybackStatusUpdate(callback);
```

**After (expo-audio):**
```typescript
import { useAudioPlayer } from "expo-audio";

// In component:
const player = useAudioPlayer(audioUri);

player.play();
player.pause();
// Status is available via player.playing, player.duration, etc.
```

#### Permissions

**Before (expo-av):**
```typescript
const { granted } = await Audio.requestPermissionsAsync();
```

**After (expo-audio):**
```typescript
import { AudioModule } from "expo-audio";

const status = await AudioModule.requestRecordingPermissionsAsync();
const granted = status.granted;
```

## Timeline

- **SDK 54 (current)**: `expo-av` works but shows deprecation warning
- **SDK 55 (upcoming)**: `expo-av` will be removed - **migration required**

## Resources

- [expo-audio documentation](https://docs.expo.dev/versions/latest/sdk/audio/)
- [expo-video documentation](https://docs.expo.dev/versions/latest/sdk/video/)
- [SDK 54 changelog](https://expo.dev/changelog/sdk-54) - deprecation announcement

## Temporary Workaround

The deprecation warning is currently suppressed in `index.ts`:
```typescript
LogBox.ignoreLogs([
  "Expo AV has been deprecated",
  // ... other warnings
]);
```

This is acceptable for SDK 54 but must be addressed before upgrading to SDK 55.

## Priority

**Medium** - Should be completed before SDK 55 upgrade. The app will continue to work on SDK 54 with the current implementation.
