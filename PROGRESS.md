---

## January 2025 - Codebase Streamlining & Architecture Improvements

### 2025-01-XX - Comprehensive Codebase Refactoring

**Time:** Major refactoring session  
**Files Modified:** Multiple files across frontend and backend  
**Action:** Implemented comprehensive improvements based on codebase analysis, focusing on server-state management, code organization, validation, and environment normalization.

#### Step 1: Migrated to React Query for Server State

**Files:** `src/hooks/useMarkets.ts`, `src/hooks/useCallLogs.ts`, `src/hooks/useAlertLogs.ts`, `src/state/marketStore.ts`, `src/screens/MarketListScreen.tsx`, `src/screens/MarketDetailScreen.tsx`, `src/screens/MarketEditScreen.tsx`, `src/screens/CallLogsScreen.tsx`, `src/screens/AlertHistoryScreen.tsx`  
**Action:** 
- Created React Query hooks for all server state (markets, call logs, alert logs)
- Refactored `marketStore` to only handle local UI state (filters, search)
- Updated all screens to use React Query hooks instead of manual API calls
- Removed duplicate data fetching logic from screens
- Added automatic caching, invalidation, and retry logic

**Why:** React Query was already installed but unused. This migration provides automatic caching, stale-while-revalidate, and better error handling. Zustand now only manages local UI preferences (filters, theme), which is its intended use case.

#### Step 2: Created Centralized Formatting Utilities

**Files:** `src/utils/format.ts`, `src/screens/CallLogsScreen.tsx`, `src/screens/AlertHistoryScreen.tsx`  
**Action:**
- Created `format.ts` with centralized date/time formatting functions
- Added `getRecipientGroupMeta()` for consistent group label/color logic
- Replaced duplicate formatting code in multiple screens with shared utilities

**Why:** Date/time formatting and group metadata were duplicated across multiple screens, leading to inconsistencies. Centralizing these utilities ensures consistency and makes future changes easier.

#### Step 3: Added Zod Validation to Backend Routes

**Files:** `backend/src/routes/market.ts`  
**Action:**
- Added `zValidator` with `updateMarketRequestSchema` to PUT `/api/markets/:id` route
- Ensures all market updates are validated against shared contracts before processing

**Why:** Other routes (alert.ts, callLog.ts, import.ts) already had validation, but market updates were trusting request bodies without validation. This prevents invalid data from reaching the database.

#### Step 4: Normalized Environment Variables

**Files:** `backend/src/env.ts`, `src/lib/api.ts`, `backend/src/index.ts`, `backend/src/auth.ts`, `src/lib/authClient.ts`, `src/lib/gemini.ts`  
**Action:**
- Removed SQLite default (`"file:dev.db"`) from `DATABASE_URL` - now required (matches PostgreSQL schema)
- Unified `BACKEND_URL` to use `EXPO_PUBLIC_BACKEND_URL` (removed Vibecode-specific env var)
- Removed hardcoded IP address from `api.ts`
- Updated auth scheme from "vibecode" to "insideedition" to match `app.json`
- Made verbose endpoint logging dev-only in `backend/src/index.ts`
- Updated Gemini API key to use generic env var name (dev-only feature)

**Why:** 
- SQLite default was misleading since schema uses PostgreSQL
- Vibecode naming was legacy and confusing
- Hardcoded IP addresses shouldn't be in source code
- Verbose logging should only appear in development

#### Step 5: Wired Auth Info into Alerts and Edit Logs

**Files:** `backend/src/routes/alert.ts`, `src/screens/TextAlertScreen.tsx`  
**Action:**
- Updated alert routes to get `sentBy` from auth context instead of request body
- Removed TODO comment and `sentBy: null` from TextAlertScreen
- EditHistoryScreen and AlertHistoryScreen already display `editedBy` and `sentBy` respectively

**Why:** Auth was configured but not fully integrated. Now alerts and edits show who made the change, making audit trails more useful.

#### Step 6: Componentized Large Screens

**Files:** `src/components/MarketSearchBar.tsx`, `src/components/MarketTimeFilter.tsx`, `src/components/MarketFilterBar.tsx`, `src/components/MarketCard.tsx`, `src/components/RecipientGroupSelector.tsx`, `src/components/RecordingControls.tsx`, `src/hooks/useVoiceRecorder.ts`, `src/screens/MarketListScreen.tsx`, `src/screens/VoiceAlertScreen.tsx`  
**Action:**
- Extracted MarketSearchBar, MarketTimeFilter, and MarketFilterBar components from MarketListScreen
- Extracted MarketCard component for individual market display
- Extracted RecipientGroupSelector and RecordingControls components from VoiceAlertScreen
- Created useVoiceRecorder hook to handle all recording logic
- Reduced MarketListScreen from 369 lines to ~160 lines
- Reduced VoiceAlertScreen from 598 lines to ~270 lines

**Why:** Large monolithic screens are hard to maintain and test. Breaking them into smaller, focused components makes the code more readable, reusable, and easier to reason about. Each component now has a single responsibility.

#### Step 7: Cleaned Up Unused Dependencies

**Files:** `package.json`  
**Action:**
- Removed 50+ unused packages including:
  - Unused Expo modules: expo-calendar, expo-camera, expo-contacts, expo-document-picker, expo-battery, expo-sensors, expo-sms, expo-video, expo-clipboard, and many others
  - Unused React Native libraries: @gorhom/bottom-sheet, @nandorojo/galeria, react-native-vision-camera, victory-native, @shopify/react-native-skia, lottie-react-native, react-native-maps, react-native-purchases, and others
  - Unused navigation libraries: @react-navigation/bottom-tabs, @react-navigation/drawer, @react-navigation/material-top-tabs, @react-navigation/stack
  - Other unused packages: openai, zeego, and various utility libraries

**Why:** A large dependency tree increases build times, app size, and the chance of native module conflicts. Removing unused packages reduces these risks and makes the project easier to maintain. Fewer native modules also means fewer potential issues like the Reanimated/NativeWorklets problems.

#### Benefits of These Changes:

1. **Better Caching**: React Query automatically caches server data, reducing unnecessary API calls
2. **Consistency**: Centralized formatting ensures date/time display is consistent across the app
3. **Type Safety**: Zod validation catches invalid data before it reaches the database
4. **Maintainability**: Clear separation between server state (React Query) and local state (Zustand)
5. **Production Ready**: Environment variables are properly normalized, verbose logging is dev-only
6. **Better UX**: Auth info is now visible in history screens, showing who sent alerts and made edits
7. **Code Quality**: Smaller, focused components are easier to test, debug, and modify
8. **Performance**: Fewer dependencies mean faster builds and smaller bundle size

---

### 2025-12-06 - USTVDB DMA Ranking Alignment Script

**Time:** Evening coding session
**Files Modified:** `backend/src/scripts/update-market-ranks-from-ustvdb.mjs`, `backend/prisma/schema.prisma`, `PROGRESS.md`  
**Action:** Added a Node script that reads a locally-downloaded USTVDB market JSON file and updates `market.rank` values in the database to match the official 2024-25 DMA rankings. Adjusted Prisma schema/relations as needed and documented how to run the script and where to place the JSON snapshot.  
**Why:** Needed the app's internal `marketNumber` values and the CSV `Rank` column to align with the official 2024-25 Nielsen DMA ordering from USTVDB, so searches, lists, and any "market #" references are consistent with the current industry rankings. The standalone script makes it easy to re-run this update in future seasons by pointing it at a new Cursor snapshot.

### 2025-12-07 - Fix Duplicate Theme Store Import

**Time:** Cursor coding session  
**Files Modified:** `App.tsx`, `PROGRESS.md`  
**Action:** Merged two separate imports from `@/state/themeStore` in `App.tsx` into a single named import statement (`{ useInitializeTheme, useThemeStore }`) to satisfy the linter rule that disallows importing the same module multiple times in one file.  
**Why:** The linter reported "`src/state/themeStore.ts` imported multiple times" due to two distinct import lines from the same module. Consolidating them into one import removes the warning without changing runtime behavior.

---

**2025-12-07 – Fix frontend API/auth require cycle & set dev backend URL**

- **Time:** Cursor coding session  
- **Files Modified:** `src/lib/config.ts`, `src/lib/api.ts`, `src/lib/authClient.ts`, `PROGRESS.md`  
- **Action:** Introduced `src/lib/config.ts` to centralize the frontend `BACKEND_URL` and avoid `api` ↔ `authClient` circular imports. Updated `authClient` to read `BACKEND_URL` from `config` instead of `api`, and updated `api` to import `BACKEND_URL` from `config` while still delegating cookie handling to `authClient`. Set the default dev backend URL to `http://192.168.86.37:3000` so Expo Go on a physical device talks to the backend running on the host machine without extra env config.  
- **Why:** Metro reported a require cycle between `src/lib/api.ts` and `src/lib/authClient.ts`, which can lead to partially initialized modules. Separating configuration into `config.ts` breaks that coupling and makes it clear where the backend base URL is defined. Using the LAN IP as the dev default matches the actual backend host and avoids the common "localhost on device" trap.

---

**2025-12-07 – Diagnose React Native Reanimated iOS crash**

- **Time:** Evening coding session  
- **Files Modified:** `FIX_REANIMATED.md`, `PROGRESS.md`  
- **Action:** Identified the root cause of the `NativeReanimated` iOS crash: the app is running in Expo Go, which doesn't support React Native Reanimated 3.16.6 (or any Reanimated 3.x). Created comprehensive fix instructions in `FIX_REANIMATED.md` that walk through building with `expo-dev-client` instead. The `babel.config.js` is already correct with `react-native-reanimated/plugin` as the last plugin.  
- **Why:** Expo Go has a fixed set of native modules and cannot load newer native modules like Reanimated 3.x, which requires native compilation. The solution is to use `expo prebuild` and `expo run:ios` to create a development build with all required native modules properly linked. This is a common gotcha when moving from Expo Go to more advanced native functionality.

---
