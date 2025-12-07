# CSV Import Guide

This document explains how to import market data from CSV files into the database.

## Overview

The app supports importing market data from CSV files in the INSIDE EDITION format. The import system:

- Parses CSV files with market data
- Validates phone numbers using libphonenumber
- Creates new markets or updates existing ones
- Logs all changes for audit trail
- Handles multiple phone numbers per market
- Supports both 3pm and 6pm feed lists

## CSV Format

The CSV file should have the following columns:

- `Feed` - Feed time (e.g., "3:00 PM" or "6:00 PM")
- `Rank` - Market number/rank
- `Station` - Station call letters (e.g., "WCBS-TV")
- `City` - Market name/city
- `Air Time` - Local air time
- `ET Time` - Eastern time
- `Main Name` - First phone label
- `Main Phone #` - First phone number
- `#2 Name` - Second phone label
- `Phone #2` - Second phone number
- `#3 Name` - Third phone label
- `Phone #3` - Third phone number
- `#4 Name` - Fourth phone label
- `Phone #4` - Fourth phone number

## Import Methods

### Method 1: Command Line Script (Recommended for Initial Import)

Use the import script to import a CSV file directly:

```bash
cd backend
bun run import-csv "../data/ie data as of 12-6.csv"
```

The script will:
- Parse the CSV file
- Validate all phone numbers
- Create new markets or update existing ones
- Log all changes
- Print a summary of results

### Method 2: API Endpoint (For Real-Time Updates)

Use the API endpoint to import CSV data programmatically:

```bash
POST /api/import/csv
Content-Type: application/json

{
  "csvData": "<csv file contents as string>",
  "dryRun": false
}
```

**Parameters:**
- `csvData` (required) - The CSV file contents as a string
- `dryRun` (optional) - If `true`, validates the data without importing (default: `false`)

**Response:**
```json
{
  "success": true,
  "dryRun": false,
  "results": {
    "created": 10,
    "updated": 145,
    "skipped": 0,
    "errors": []
  },
  "message": "Import complete: 10 created, 145 updated, 0 skipped"
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:3000/api/import/csv \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": "Feed,,Rank,Station,City,Air Time,ET Time,Main Name,Main Phone #,#2 Name,Phone #2\n6:00 PM,,1,WCBS-TV,\"NEW YORK, NY\",7:00 PM,7:00 PM,Encompass Hub,678-421-6825,Encompass Hub,678-421-6613",
    "dryRun": false
  }'
```

## Phone Number Validation

All phone numbers are validated and formatted using libphonenumber:

- Invalid phone numbers are skipped (with a warning)
- Valid phone numbers are formatted to E.164 format (e.g., `+15551234567`)
- At least one valid phone number is required per market

## Market Updates

When importing:

- **New markets** are created with all provided data
- **Existing markets** (matched by market number) are updated:
  - Market name, station call letters, air time, timezone, and list are updated if changed
  - New phone numbers are added (duplicates are skipped)
  - Existing phone numbers are not removed (use the edit screen to remove)
  - Primary phone is set if no primary exists

## Feed List Mapping

- `3:00 PM` feed → `"3pm"` list
- `6:00 PM` feed → `"6pm"` list
- Markets can appear in both feeds (will be merged, with 6pm taking precedence)

## Audit Trail

All changes are logged in the `EditLog` table:

- Market creation
- Field updates (name, station call letters, air time, timezone, list)
- Phone number additions
- Changes are attributed to "CSV Import" or the authenticated user (if using API)

## Real-Time Updates

The app already supports real-time updates through the existing API:

- **PUT /api/markets/:id** - Update a single market
- **PATCH /api/markets/:marketId/phones/:phoneId/primary** - Set primary phone
- **DELETE /api/markets/:marketId/phones/:phoneId** - Delete a phone number

All changes sync instantly across all devices through the cloud database.

## Troubleshooting

### Invalid Phone Numbers

If phone numbers fail validation:
- Check the format (should be US phone numbers)
- Ensure area codes are correct
- The import will skip invalid numbers and continue

### Duplicate Markets

If a market appears multiple times in the CSV:
- Markets are matched by `marketNumber` (Rank column)
- Phone numbers from all rows are merged
- The 6pm list takes precedence if both feeds exist

### Timezone Detection

The importer attempts to detect timezones but defaults to EST. You can:
- Update timezones manually in the app after import
- Edit the CSV parser to improve timezone detection
- Use the market edit screen to correct timezones

## Example CSV Row

```
Feed,Rank,Station,City,Air Time,ET Time,Main Name,Main Phone #,#2 Name,Phone #2
6:00 PM,,1,WCBS-TV,"NEW YORK, NY",7:00 PM,7:00 PM,Encompass Hub,678-421-6825,Encompass Hub,678-421-6613
```

This creates/updates:
- Market #1: New York, NY
- Station: WCBS
- Air Time: 7:00 PM
- List: 6pm
- Two phone numbers (both Encompass Hub)
