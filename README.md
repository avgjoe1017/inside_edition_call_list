# INSIDE EDITION CALL LIST - TV Market Directory App

A beautiful, professional mobile app for INSIDE EDITION TV show with quick access to station contacts across all markets, featuring one-tap calling, intelligent filtering, and cloud-synced data.

## Features

### Alert System
- **Voice Alert Screen**: Record and send voice messages to station groups
  - Clean, focused UI for recording audio messages
  - Three recipient groups: All Stations, 3:30 Feed, 6:00 Feed
  - Visual recording interface with timer (up to 60 seconds)
  - Playback review before sending
  - Audio upload with progress indication
  - Fixed footer with send summary and controls
  - Success/error feedback with toast notifications
- **Text Alert Screen**: Send SMS updates to station groups
  - Simple SMS composer with character count
  - Same recipient group selector as voice alerts
  - SMS segment counter (160 characters per segment)
  - 320 character limit with validation
  - Quick message templates (Breaking news, Programming note, Weather/Emergency)
  - Fixed footer with send summary
  - Plain text with link support
  - Consistent success/error handling
- **Alert History Screen**: Complete audit trail of all alerts
  - Unified view of all voice and text alerts
  - Organized by date (Today, Yesterday, specific dates)
  - Each alert shows:
    - Alert type (Voice/Text) with icon
    - Timestamp
    - Message preview (for text alerts)
    - Duration (for voice alerts)
    - Recipient group (All Stations, 3:30 Feed, 6:00 Feed)
    - Station count
    - Sender information
  - Tap any alert to see detailed delivery status
  - Pull-to-refresh functionality
  - Clean, professional design
- **Alert Detail Screen**: Per-station delivery status
  - Complete delivery breakdown for each station
  - Individual station delivery status:
    - **Sent**: Message dispatched
    - **Delivered**: Confirmed receipt
    - **Failed**: Temporary delivery failure
    - **Bounced**: Invalid/disconnected number
  - Timestamps for sent, delivered, and read receipts
  - Error reasons displayed for failed/bounced deliveries
  - Delivery statistics summary:
    - Total sent count
    - Delivered count
    - Failed count
    - Bounced count
  - Failed/bounced entries highlighted in red
  - Searchable station list
  - Essential for legal compliance and audit requirements
- **Failure Escalation Indicators**:
  - Visual warning badges on station cards with recent failures
  - "Alert Failed" badge appears when primary number has bounced/failed within last 7 days
  - Red border on affected station cards
  - Automatic tracking of failure count per phone number
  - Timestamps of last failure tracked in database
  - Makes bad numbers immediately visible on main list

### Market List Screen
- Clean, scrollable list of TV markets with station contacts
- **Professional design with proper visual hierarchy:**
  - **Color-coded list badges**: Amber for 3pm list, purple for 6pm list
  - Defined card borders for better elevation
  - Improved typography with proper weight distribution
  - Enhanced phone number visibility
  - Air time display with local timezone (e.g., "10:00 PM PST")
- **Powerful triple filtering system:**
  - Search by market number or name (shorter, clearer placeholder)
  - Air time filter with pill-shaped design
  - Feed list selector (All, 3:30pm, 6:00pm) with color-coded buttons
  - Real-time filtering as you type
  - Clear individual filters or all at once
- Each market card displays:
  - Market number badge (amber for 3pm list, purple for 6pm list)
  - Market/city name
  - Station call letters (if provided)
  - Show air time with timezone
  - Primary phone number with label
  - Quick call button (tap anywhere on card)
  - Details arrow (right chevron) for more info
- Haptic feedback for all interactions
- Confirmation dialog before placing calls
- Empty state when no results match filters
- **Cloud sync**: All data loaded from backend database
- **Header buttons**:
  - Burger Menu (right side) - Opens navigation menu with expandable sections
  - Menu includes: Call List, Call Log, Voice Alert, Text Alert, Alert History, Settings
  - Call Logs button (green phone book icon) - Access call history
  - Settings button (blue gear icon) - App settings

### Market Detail Screen
- Detailed view for each TV market
- Header card showing:
  - Market number
  - Market name
  - Station call letters (if provided)
  - Air time with timezone
  - Number count
  - **Edit button** - opens full edit screen
- Complete list of all station phone numbers with labels
- Visual indication of primary contact (blue badge)
- Call any number directly from the list
- **Set any number as primary** (tap the star icon) - syncs to cloud
- Smooth animations and transitions
- Changes sync across all devices instantly
- Auto-refreshes when returning from detail screen

### Market Edit Screen
- Full editing capabilities for all market details
- Edit market information:
  - Market name
  - Station call letters (e.g., WCBS, WABC)
  - **Air time with scrollable time picker** - Select hour (1-12), minute (:00 or :30), and AM/PM
  - **List selector** - Choose between 3pm (amber) or 6pm (purple) list
- Edit phone numbers:
  - Add new phone numbers
  - Edit labels and numbers
  - Delete phone numbers (minimum 1 required)
  - Set primary contact toggle
- Validation to ensure data integrity
- Save button with loading state
- Cancel button to discard changes
- All changes sync to cloud database instantly
- **All edits are automatically logged** for audit trail

### Call History Screen
- **Complete call tracking** for all confirmed calls
- Organized by date (Today, Yesterday, specific dates)
- Each log entry shows:
  - Market name and contact info
  - Phone number and label called
  - "Called" badge (green) with timestamp
- Clean, chronological display
- Empty state when no calls exist
- Accessible via phone book icon in main screen header
- Automatic tracking when user confirms and places a call

### Settings Screen
- **Appearance**: Theme selection (System Default, Light, Dark)
  - Persists user preference across app restarts
  - System Default follows device dark mode settings
  - Beautiful modal interface with haptic feedback
- **Account**: Log In option to track edits across devices - coming soon
- **Data**: View Edit History to see all market changes
- **Support**:
  - Report Incorrect Number
  - Contact Support via email
  - App version display

### Edit History Screen
- Complete audit trail of all market changes
- Changes grouped by date (Today, Yesterday, specific dates)
- Each log entry shows:
  - What was changed (field name)
  - Old value → New value
  - Who made the change (email or "Unknown")
  - Time of change
- Clean, chronological display
- Empty state when no edits exist
- Automatically tracks:
  - Market name changes
  - Station call letter updates
  - Air time modifications
  - Phone number additions/updates/deletions
  - Primary contact changes

### Call Tracking
- **Automatic call logging** tracks confirmed calls to stations
- Logs created when user presses "Call" in the confirmation dialog
- Each log entry includes:
  - Market ID, name, phone number, and label
  - User identifier (when logged in)
  - Timestamp
- Backend API endpoints:
  - `POST /api/call-logs` - Create new call log
  - `GET /api/call-logs` - Get all logs with optional filters (marketId, action, limit)
  - `GET /api/call-logs/stats` - Get statistics (total calls, top markets)
- Data stored in SQLite database with indexed fields for fast querying
- Silent logging - doesn't interrupt user experience

## Recent Updates

### January 2025 - Enhanced SMS & Search Features
- **Twilio Integration**: Real SMS delivery with automatic status tracking via webhooks
  - Sends SMS via Twilio API with delivery status callbacks
  - Tracks sent, delivered, failed, and bounced statuses automatically
  - Updates phone number failure tracking on delivery failures
  - New endpoints: `POST /api/alerts/text`, `POST /api/webhooks/twilio/status`
- **Phone Number Validation**: Added libphonenumber for validation and formatting
  - Validates phone numbers before saving to database
  - Formats numbers to E.164 format for Twilio compatibility
  - Catches bad numbers on entry rather than when alerts fail
  - Integrated into MarketEditScreen with clear error messages
- **Fuzzy Search**: Integrated Fuse.js for intelligent search
  - Handles typos and partial matches gracefully (e.g., "san fran" → "San Francisco")
  - Weighted search across market name, number, and call letters
  - Client-side only, no backend search infrastructure needed
- **Enhanced Timezone Handling**: Added date-fns-tz utilities
  - Better timezone calculations for air times
  - Functions to check if market has aired today
  - Calculate time until air time (ready for future features)

### December 7, 2024 (Part 3)
- **Complete Database Migration Fix**: Resolved critical database sync issues
  - **Root Cause**: Only 1 of 9 migrations was actually applied to the database despite Prisma tracking showing all as "applied"
  - **Missing Tables**: alert_log, alert_delivery tables didn't exist
  - **Missing Columns**: phone_number.lastFailedAt and phone_number.failureCount were undefined
  - **Solution**: Manually applied all 8 missing migration SQL files to database
  - **Verification**: All 11 database tables now present with correct schema
  - **Result**: All API endpoints now return 200 OK (markets, edit logs, call logs, alert logs)
- **Comprehensive App Debug**: Performed full system health check
  - ✅ Frontend: No runtime errors, bundle compiled successfully (3132 modules)
  - ✅ Backend: All endpoints responding correctly (10-15ms response time)
  - ✅ Database: 210 markets, 420 phone numbers, all tables present
  - ✅ TypeScript: Zero compilation errors in strict mode
  - ✅ Navigation: All 11 screens registered and working
  - ⚠️ Non-critical: expo-av deprecation warning (can upgrade to expo-audio/expo-video later)

### December 7, 2024 (Part 2)
- **Alert History & Audit Trail System**: Complete tracking and logging for all alerts
  - New Alert History screen showing all voice and text alerts
  - Per-station delivery status view with detailed breakdown
  - Tracks sent, delivered, failed, and bounced statuses
  - Timestamps for sent, delivered, and read receipts
  - Error reasons displayed for failed deliveries
  - Delivery statistics (total sent, delivered, failed, bounced)
  - Essential for legal compliance and audit requirements
- **Failure Escalation Indicators**: Visual warnings for bad phone numbers
  - "Alert Failed" badge on station cards with recent failures (last 7 days)
  - Red border on affected station cards
  - Automatic tracking of failure count and last failure date
  - Makes bad numbers immediately visible on main station list
- **Enhanced Database Schema**:
  - AlertLog table for tracking all alerts sent
  - AlertDelivery table for per-station delivery status
  - PhoneNumber table updated with failure tracking fields
  - User role field added (admin/producer/viewer) for future permissions
- **New API Endpoints**:
  - GET /api/alert-logs - Fetch all alerts grouped by date
  - GET /api/alert-logs/:id - Get detailed delivery status
- **Enhanced Navigation**:
  - Alert History added to burger menu
  - AlertHistory and AlertDetail screens registered

### December 7, 2024
- **Removed Back Buttons**: Hamburger menu now appears on all screens for consistent navigation
  - No back buttons on any screen
  - Burger menu accessible from every page
  - Cleaner, more consistent navigation experience
- **Fixed SafeArea Padding**: All screens now properly display content below transparent headers
  - Added proper top padding to account for transparent headers (100-120px)
  - VoiceAlertScreen, TextAlertScreen, MarketDetailScreen now display correctly
  - CallLogsScreen, SettingsScreen, EditHistoryScreen fixed with SafeAreaView top edges
  - Content no longer hidden under navigation headers
  - Consistent spacing across all screens

### December 6, 2024
- **New Alert System**: Added Voice and Text alert screens for broadcasting messages
  - Voice Alert: Record audio messages up to 60 seconds
  - Text Alert: Send SMS updates with templates
  - Both screens feature recipient group selection (All Stations, 3:30 Feed, 6:00 Feed)
  - Fixed footer bars with send summary and controls
  - Consistent design language across both alert types
  - Success/error feedback with toast notifications

### December 5, 2024
- **Enhanced Feed List Filtering**: Added feed list selector to main screen
  - Three-button toggle: All, 3:30pm, 6:00pm
  - Color-coded buttons (blue for All, amber for 3:30pm, purple for 6:00pm)
  - Works alongside search and air time filters
  - Renamed time filter to "air time" for clarity
- **Fixed List Selection Saving**: Feed list (3pm/6pm) now saves properly in edit screen
  - Backend now correctly updates and persists the `list` field
  - List changes are now tracked in edit history
  - Changes are immediately reflected when navigating back to main screen
  - All data persists correctly in the database
- **Fixed Dark Mode Support**: Market Edit screen now fully supports dark mode
  - All text, backgrounds, and borders adapt to theme
  - TimePicker and TimezonePicker components support dark mode
  - Input fields properly styled for light and dark themes
- **Refined Header Icons**: Cleaner, native iOS/Android design
  - Removed wrapper container with dark grey background
  - Icons now float directly on the header background
  - Simple, clean icon-only design with proper touch targets
  - Better visual hierarchy and reduced noise
  - Icons use theme blue color for consistency
- **Fixed Database Connection**: Resolved Prisma client connectivity issues
  - Backend API now working properly
  - All endpoints returning correct data
- **Refined Header Design**: Clean, professional title "Inside Edition" that doesn't truncate
  - Title uses proper title case instead of all caps
  - Shorter, cleaner branding
  - No truncation issues with large title mode
- **Simplified Call Tracking**: Now only tracks confirmed calls
  - Removed "viewed" action logging
  - Call History shows only actual calls placed
  - Cleaner, more focused tracking
- **List-Based Organization**: Markets now organized by broadcast list (3pm and 6pm)
  - Amber badges for 3pm list markets
  - Purple badges for 6pm list markets
  - Easy list switching in edit screen
- **Simplified Time Display**: Air times now show local timezone only (e.g., "10:00 PM PST") without EST reference
- **Call History Tracking**: New Call Logs screen accessible via phone book icon in header
  - View all call interactions organized by date
  - Track both "viewed" (opened call dialog) and "called" (placed call) actions
  - Quick access from main screen
- **Enhanced UI**:
  - Two header buttons (Call Logs in green, Settings in blue)
  - Improved visual hierarchy with color-coded badges
  - Cleaner time formatting
- **Fixed Database Schema**: Resolved migration issues and added proper call/edit logging tables

## INSIDE EDITION Markets

The app includes **all 210 Nielsen DMA TV markets** where INSIDE EDITION airs:

**Top 10 Markets:**
1. **New York** - 10:00 PM EST
2. **Los Angeles** - 10:00 PM EST (7:00 PM PST)
3. **Chicago** - 10:00 PM EST (9:00 PM CST)
4. **Philadelphia** - 10:00 PM EST
5. **Dallas-Fort Worth** - 10:00 PM EST (9:00 PM CST)
6. **San Francisco-Oakland-San Jose** - 10:00 PM EST (7:00 PM PST)
7. **Atlanta** - 10:00 PM EST
8. **Houston** - 10:00 PM EST (9:00 PM CST)
9. **Washington, DC** - 10:00 PM EST
10. **Boston** - 10:00 PM EST

Complete coverage of all 210 US TV markets from New York (#1) to Glendive, MT (#210).

All markets air at 10:00 PM EST, with local time zones displayed when applicable.

Each market includes 2 labeled phone numbers (Main Station, News Desk).

## Filter Examples

- Type **"1"** → Shows Market #1 (New York)
- Type **"new"** → Shows New York
- Type **"10pm"** → Shows all markets airing at 10:00 PM EST
- Type **"7:30"** → Shows markets with 7:30 air time
- Combine both filters for precise results

**Note:** Time filter searches only EST times for consistency.

## Technical Stack

### Frontend
- **Framework**: Expo SDK 53 + React Native 0.76.7
- **Navigation**: React Navigation 7 (Native Stack)
- **State Management**: Zustand with computed selectors
- **Styling**: NativeWind (TailwindCSS for React Native)
- **Icons**: Lucide React Native
- **Interactions**: Expo Haptics
- **TypeScript**: Strict mode with full type safety
- **Search**: Fuse.js for fuzzy search with typo tolerance
- **Validation**: libphonenumber for phone number validation
- **Timezones**: date-fns-tz for enhanced timezone handling

### Backend (Vibecode Cloud)
- **Server**: Hono + Bun runtime
- **Database**: SQLite with Prisma ORM
- **Authentication**: Better Auth (ready for multi-user)
- **API**: RESTful endpoints with Zod validation
- **Type Safety**: Shared contracts between frontend and backend
- **SMS**: Twilio integration for reliable SMS delivery with status tracking
- **Validation**: libphonenumber for phone number validation and formatting

## Design Philosophy

The app draws inspiration from:
- iOS Contacts app (clean, functional design)
- Professional broadcast tools (clear information hierarchy)
- Quick-action apps like Uber (instant tap-to-call)

Design features:
- Clean white background with subtle shadows
- Blue accents for call actions and market numbers
- Professional typography with clear hierarchy
- Card-based layout for easy scanning
- Real-time search with instant feedback
- Smooth transitions and haptic feedback

## Project Structure

```
/home/user/workspace/
├── src/
│   ├── screens/
│   │   ├── MarketListScreen.tsx    # Main list with filters + data fetching
│   │   ├── MarketDetailScreen.tsx  # Detailed contact view + primary updates
│   │   ├── MarketEditScreen.tsx    # Full market editing with validation
│   │   ├── SettingsScreen.tsx      # App settings and preferences
│   │   ├── EditHistoryScreen.tsx   # Audit trail of all changes
│   │   ├── CallLogsScreen.tsx      # Call history tracking
│   │   ├── VoiceAlertScreen.tsx    # Voice alert broadcast
│   │   ├── TextAlertScreen.tsx     # Text alert broadcast
│   │   ├── AlertHistoryScreen.tsx  # Alert audit trail
│   │   └── AlertDetailScreen.tsx   # Per-station delivery status
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Stack navigator
│   │   └── types.ts                # Navigation types
│   ├── state/
│   │   └── marketStore.ts          # Market state + API calls
│   ├── lib/
│   │   └── api.ts                  # HTTP client
│   └── ...
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── market.ts           # Markets API endpoints
│   │   │   ├── editLog.ts          # Edit history API endpoints
│   │   │   ├── callLog.ts          # Call tracking API endpoints
│   │   │   └── alertLog.ts         # Alert history & delivery status API
│   │   ├── lib/
│   │   │   └── editLogger.ts       # Edit logging utilities
│   │   ├── index.ts                # Server setup
│   │   └── db.ts                   # Prisma client
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema (includes EditLog)
│   │   ├── seed.ts                 # Initial data
│   │   └── migrations/             # Schema changes
│   └── ...
├── shared/
│   └── contracts.ts                # Shared API types (includes EditLog + Alert types)
└── ...
```

## Cloud Backend API

The app uses a cloud backend for data persistence and real-time sync:

### API Endpoints

- **GET /api/markets** - Fetch all markets with phone numbers
- **GET /api/markets/:id** - Fetch single market details
- **PUT /api/markets/:id** - Update market (name, airTime, timezone, phones)
- **PATCH /api/markets/:marketId/phones/:phoneId/primary** - Set phone as primary contact
- **DELETE /api/markets/:marketId/phones/:phoneId** - Delete a phone number
- **GET /api/edit-logs** - Fetch all edit logs grouped by date
- **GET /api/edit-logs/market/:marketId** - Fetch edit logs for specific market
- **GET /api/call-logs** - Get call history with optional filters
- **POST /api/call-logs** - Create new call log
- **GET /api/alert-logs** - Fetch all alert logs grouped by date
- **GET /api/alert-logs/:id** - Get detailed alert with per-station delivery status
- **POST /api/alerts/text** - Send text alert (SMS) to recipient group via Twilio
- **POST /api/alerts/voice** - Send voice alert to recipient group
- **POST /api/webhooks/twilio/status** - Twilio status callback webhook

### Database Schema

**Market Table:**
- id (UUID)
- marketNumber (unique integer)
- name
- stationCallLetters (optional)
- airTime (local time with timezone, e.g., "10:00 PM PST")
- list ("3pm" or "6pm" - which broadcast list)
- createdAt, updatedAt

**PhoneNumber Table:**
- id (UUID)
- label
- number
- isPrimary (boolean)
- marketId (foreign key)
- lastFailedAt (timestamp, nullable) - When this number last failed in an alert
- failureCount (integer) - Count of consecutive failures
- createdAt, updatedAt

**EditLog Table:**
- id (UUID)
- marketId (foreign key reference)
- field (what was changed: "name", "airTime", "phoneNumber", etc.)
- oldValue (previous value as string)
- newValue (new value as string)
- editedBy (user email/identifier, null if not logged in)
- createdAt

**CallLog Table:**
- id (UUID)
- marketId (foreign key reference)
- marketName
- phoneNumber
- phoneLabel
- calledBy (user identifier, nullable)
- action ("called")
- createdAt

**AlertLog Table:**
- id (UUID)
- alertType ("voice" or "text")
- message (nullable, text content for SMS)
- audioUrl (nullable, audio file URL for voice alerts)
- audioDuration (nullable, duration in seconds)
- recipientGroup ("all", "3pm", or "6pm")
- recipientCount (number of stations targeted)
- sentBy (user identifier, nullable)
- createdAt

**AlertDelivery Table:**
- id (UUID)
- alertId (foreign key to AlertLog)
- marketId (foreign key reference)
- marketName
- phoneNumber
- phoneLabel
- status ("sent", "delivered", "failed", "bounced")
- errorReason (nullable, error message if failed/bounced)
- sentAt (timestamp)
- deliveredAt (nullable, timestamp)
- readAt (nullable, timestamp for read receipts)

**User Table** (prepared for future permissions):
- id (UUID)
- email
- name (nullable)
- emailVerified (boolean)
- image (nullable)
- role ("admin", "producer", "viewer") - Default: "producer"
- createdAt, updatedAt

All updates are synced instantly across devices through the cloud database.

## Data Structure

```typescript
interface Market {
  id: string;
  marketNumber: number;
  name: string;
  stationCallLetters?: string;
  airTime: string; // Local time with timezone (e.g., "10:00 PM PST")
  list: "3pm" | "6pm"; // Which broadcast list
  phones: PhoneNumber[];
}

interface PhoneNumber {
  id: string;
  label: string;
  number: string;
  isPrimary: boolean;
}
```

## Future Enhancements

Potential features for future iterations:
- Full authentication system with email/social login
- **Role-based permissions**: Admin, Producer, and Viewer roles
  - Admins: Full access to all features
  - Producers: Can send alerts and edit contacts (emergency use)
  - Viewers: Read-only access to contacts and logs
- Theme customization (Light/Dark mode)
- Sort by market number, name, or air time
- Favorites for frequently called markets
- Time zone converter
- Notes per market
- Export contact list
- Push notifications for market updates
- Advanced filtering by region or timezone
- Read receipts for alerts (when supported by delivery service)
- Retry failed alert deliveries
- Bulk import/export of station contacts

All updates are synced instantly across devices through the cloud database.

## Development

The app and backend are running automatically:
- **Frontend**: Port 8081 (Expo dev server)
- **Backend**: Port 3000 (Hono API server)
- **Database**: SQLite with Prisma Studio on port 3001 (view in CLOUD tab)

Any changes to the code will hot-reload automatically.

### Backend Development

To view the database:
- Go to the CLOUD tab in Vibecode app
- Browse markets and phone numbers in Prisma Studio

To seed the database:
```bash
cd backend && bun run seed
```

To create a new migration:
```bash
cd backend && bunx prisma migrate dev --create-only --name <migration-name>
cd backend && bunx prisma migrate deploy
```

### Frontend Development

To check for type errors:
```bash
bun run typecheck
```

To lint the code:
```bash
bun run lint
```
# inside_edition_call_list
