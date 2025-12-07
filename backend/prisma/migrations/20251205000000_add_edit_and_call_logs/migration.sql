-- CreateTable: EditLog
CREATE TABLE "edit_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "editedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "edit_log_marketId_idx" ON "edit_log"("marketId");

-- CreateIndex
CREATE INDEX "edit_log_createdAt_idx" ON "edit_log"("createdAt");

-- CreateTable: CallLog
CREATE TABLE "call_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "marketId" TEXT NOT NULL,
    "marketName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "phoneLabel" TEXT NOT NULL,
    "calledBy" TEXT,
    "action" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "call_log_marketId_idx" ON "call_log"("marketId");

-- CreateIndex
CREATE INDEX "call_log_calledBy_idx" ON "call_log"("calledBy");

-- CreateIndex
CREATE INDEX "call_log_createdAt_idx" ON "call_log"("createdAt");

-- CreateIndex
CREATE INDEX "call_log_action_idx" ON "call_log"("action");
