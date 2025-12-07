-- CreateTable
CREATE TABLE "market" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "airTime" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "phone_number" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "marketId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "phone_number_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "market" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "market_marketNumber_key" ON "market"("marketNumber");
