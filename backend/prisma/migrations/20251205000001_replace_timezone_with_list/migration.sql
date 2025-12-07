-- Drop localTimezone and add list field
-- Step 1: Create new table with updated schema
CREATE TABLE "market_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "stationCallLetters" TEXT,
    "airTime" TEXT NOT NULL,
    "list" TEXT NOT NULL DEFAULT '6pm',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Step 2: Copy data from old table to new table
INSERT INTO "market_new" ("id", "marketNumber", "name", "stationCallLetters", "airTime", "createdAt", "updatedAt")
SELECT "id", "marketNumber", "name", "stationCallLetters", "airTime", "createdAt", "updatedAt"
FROM "market";

-- Step 3: Drop old table
DROP TABLE "market";

-- Step 4: Rename new table to market
ALTER TABLE "market_new" RENAME TO "market";

-- Step 5: Recreate unique index
CREATE UNIQUE INDEX "market_marketNumber_key" ON "market"("marketNumber");
