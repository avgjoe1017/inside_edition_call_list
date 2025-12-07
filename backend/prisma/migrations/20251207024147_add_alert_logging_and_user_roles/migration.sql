-- CreateTable
CREATE TABLE "alert_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertType" TEXT NOT NULL,
    "message" TEXT,
    "audioUrl" TEXT,
    "audioDuration" REAL,
    "recipientGroup" TEXT NOT NULL,
    "recipientCount" INTEGER NOT NULL,
    "sentBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "alert_delivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "marketName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "phoneLabel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorReason" TEXT,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" DATETIME,
    "readAt" DATETIME,
    CONSTRAINT "alert_delivery_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "alert_log" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_phone_number" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "marketId" TEXT NOT NULL,
    "lastFailedAt" DATETIME,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "phone_number_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "market" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_phone_number" ("createdAt", "id", "isPrimary", "label", "marketId", "number", "updatedAt") SELECT "createdAt", "id", "isPrimary", "label", "marketId", "number", "updatedAt" FROM "phone_number";
DROP TABLE "phone_number";
ALTER TABLE "new_phone_number" RENAME TO "phone_number";
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'producer',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_user" ("createdAt", "email", "emailVerified", "id", "image", "name", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "updatedAt" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "alert_log_alertType_idx" ON "alert_log"("alertType");

-- CreateIndex
CREATE INDEX "alert_log_recipientGroup_idx" ON "alert_log"("recipientGroup");

-- CreateIndex
CREATE INDEX "alert_log_sentBy_idx" ON "alert_log"("sentBy");

-- CreateIndex
CREATE INDEX "alert_log_createdAt_idx" ON "alert_log"("createdAt");

-- CreateIndex
CREATE INDEX "alert_delivery_alertId_idx" ON "alert_delivery"("alertId");

-- CreateIndex
CREATE INDEX "alert_delivery_marketId_idx" ON "alert_delivery"("marketId");

-- CreateIndex
CREATE INDEX "alert_delivery_status_idx" ON "alert_delivery"("status");

-- CreateIndex
CREATE INDEX "alert_delivery_sentAt_idx" ON "alert_delivery"("sentAt");
