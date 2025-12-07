# Quick Start: Import CSV Data

## Import Your CSV Data in 3 Steps

### Step 1: Test the CSV Parser (Optional but Recommended)

Verify your CSV file can be parsed correctly:

```bash
cd backend
bun run test-csv "../data/ie data as of 12-6.csv"
```

This will show you:
- How many markets were parsed
- Sample markets with their data
- Statistics (total phones, lists, etc.)
- Any warnings about missing data

### Step 2: Import the CSV

Run the import script:

```bash
cd backend
bun run import-csv "../data/ie data as of 12-6.csv"
```

The script will:
- ✅ Parse all markets from the CSV
- ✅ Validate phone numbers
- ✅ Create new markets or update existing ones
- ✅ Log all changes for audit trail
- ✅ Show a summary of results

### Step 3: Verify in the App

1. Open the app (mobile or web)
2. Check the Market List screen
3. Verify markets are showing with correct data
4. Check Edit History to see import logs

## What Gets Imported

- **Market Number** (from Rank column)
- **Market Name** (from City column)
- **Station Call Letters** (from Station column, cleaned)
- **Air Time** (from Air Time column, normalized)
- **Timezone** (detected from air time vs ET time)
- **List** (3pm or 6pm based on Feed column)
- **Phone Numbers** (up to 4 per market, validated and formatted)

## Phone Number Handling

- Phone numbers are validated using libphonenumber
- Invalid numbers are skipped (with warning)
- Extensions (x123, ext 123) are removed
- Numbers are formatted to E.164 format (+15551234567)
- At least one valid phone is required per market

## Real-Time Updates

After import, all data is available in real-time:

- ✅ Changes sync instantly across all devices
- ✅ Edit any market from the app
- ✅ Add/remove phone numbers
- ✅ Update air times, timezones, lists
- ✅ All changes are logged for audit trail

## Troubleshooting

### "No valid phone numbers" warning
- Check the phone number format in your CSV
- Ensure phone numbers include area codes
- Remove any special characters or extensions manually if needed

### Markets not appearing
- Check if market number (Rank) is valid
- Verify the CSV file path is correct
- Check console output for specific errors

### Duplicate markets
- Markets with the same Rank are merged
- Phone numbers from all rows are combined
- 6pm list takes precedence if both feeds exist

## API Import (Alternative Method)

You can also import via API for programmatic access:

```bash
curl -X POST http://localhost:3000/api/import/csv \
  -H "Content-Type: application/json" \
  -d '{
    "csvData": "<paste CSV content here>",
    "dryRun": false
  }'
```

Use `"dryRun": true` to validate without importing.
