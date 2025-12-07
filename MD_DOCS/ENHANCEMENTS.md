# Codebase Enhancements - January 2025

## Overview
This document outlines the enhancements added to the INSIDE EDITION Call List app to improve SMS delivery, phone validation, search functionality, and timezone handling.

## 1. Twilio Integration for SMS Delivery

### Implementation
- **Backend**: Added Twilio SDK integration for reliable SMS delivery
- **Webhook Support**: Created webhook endpoint to receive delivery status updates from Twilio
- **Status Tracking**: Automatic tracking of sent, delivered, failed, and bounced statuses

### Files Added
- `backend/src/lib/twilio.ts` - Twilio SMS service
- `backend/src/routes/alert.ts` - Alert sending endpoints (text and voice)
- `backend/src/routes/twilioWebhook.ts` - Twilio status callback webhook

### Environment Variables Required
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number
```

### Features
- Real-time SMS delivery via Twilio API
- Automatic status updates via webhooks (sent → delivered/failed)
- Phone number failure tracking (updates `lastFailedAt` and `failureCount`)
- Error handling with descriptive error messages

### API Endpoints
- `POST /api/alerts/text` - Send text alert to recipient group
- `POST /api/alerts/voice` - Send voice alert (placeholder for future implementation)
- `POST /api/webhooks/twilio/status` - Twilio status callback webhook

## 2. Phone Number Validation (libphonenumber)

### Implementation
- **Frontend & Backend**: Added google-libphonenumber for validation and formatting
- **Validation**: Validates phone numbers before saving to database
- **Formatting**: Automatically formats numbers to E.164 format (+15551234567)

### Files Added
- `backend/src/lib/phoneValidator.ts` - Backend phone validation utility
- `src/lib/phoneValidator.ts` - Frontend phone validation utility

### Features
- Validates phone numbers on entry (catches bad numbers before alerts fail)
- Formats numbers to E.164 format for Twilio compatibility
- Displays formatted numbers in national format for readability
- Error messages for invalid phone numbers

### Integration
- Phone validation added to `MarketEditScreen` - validates all phone numbers before saving
- Backend validates and formats phone numbers before sending SMS

## 3. Fuzzy Search with Fuse.js

### Implementation
- **Frontend**: Integrated Fuse.js for intelligent fuzzy search
- **Search Quality**: Handles typos, partial matches, and variations gracefully

### Files Modified
- `src/state/marketStore.ts` - Updated `getFilteredMarkets()` to use Fuse.js

### Features
- Fuzzy matching for market names (e.g., "san fran" matches "San Francisco")
- Market number search with typo tolerance
- Station call letters search
- Weighted search (name: 70%, number: 30%, call letters: 20%)
- Threshold of 0.3 for balanced precision/recall

### Example Searches
- "NYC" → matches "New York"
- "san fran" → matches "San Francisco"
- "1" → matches "Market #1 (New York)"
- "WABC" → matches markets with WABC call letters

## 4. Enhanced Timezone Handling (date-fns)

### Implementation
- **Frontend**: Added date-fns-tz for timezone calculations
- **Utilities**: Created timezone utility functions for air time calculations

### Files Added
- `src/lib/timezone.ts` - Timezone and air time utilities

### Features
- Format air times with proper timezone abbreviations
- Check if market has already aired today
- Calculate time until air time (e.g., "Airs in 2 hours")
- Support for EST, CST, MST, PST (and daylight saving variants)

### Functions
- `formatAirTime()` - Format air time with timezone
- `hasAiredToday()` - Check if market has aired today
- `getTimeUntilAir()` - Get human-readable time until/since air time

## Technical Details

### Dependencies Added

**Backend:**
- `twilio@5.10.7` - Twilio SDK for SMS
- `google-libphonenumber@3.2.43` - Phone number validation
- `@types/google-libphonenumber@7.4.30` - TypeScript types

**Frontend:**
- `fuse.js@7.1.0` - Fuzzy search library
- `google-libphonenumber@3.2.43` - Phone number validation
- `date-fns-tz@3.2.0` - Timezone support for date-fns

### Database Schema
No schema changes required - existing `AlertDelivery` and `PhoneNumber` tables support the new features.

### Backward Compatibility
- All changes are backward compatible
- Twilio is optional (gracefully handles missing credentials)
- Phone validation is non-blocking (warns but doesn't break existing data)
- Fuse.js search is a drop-in replacement for existing search

## Usage Examples

### Sending a Text Alert
```typescript
// Frontend
await api.post("/api/alerts/text", {
  groupId: "all", // or "3pm" or "6pm"
  message: "Breaking news: [details]",
  sentBy: null, // or user email when auth is implemented
});
```

### Validating a Phone Number
```typescript
import { validateAndFormatPhone } from "@/lib/phoneValidator";

const result = validateAndFormatPhone("555-123-4567", "US");
if (result.isValid) {
  console.log(result.formatted); // "+15551234567"
}
```

### Using Fuzzy Search
The search is automatically used in `MarketListScreen` - just type in the search box and Fuse.js handles the fuzzy matching.

## Next Steps

1. **Configure Twilio**: Add Twilio credentials to environment variables
2. **Test SMS**: Send a test alert to verify Twilio integration
3. **Monitor Webhooks**: Check that Twilio status callbacks are being received
4. **Review Phone Numbers**: Validate existing phone numbers in the database

## Notes

- Twilio free tier is sufficient for testing
- Phone validation catches errors before they cause alert failures
- Fuse.js search is client-side only (no backend search infrastructure needed)
- Timezone utilities are ready for future "which stations haven't aired yet" features

