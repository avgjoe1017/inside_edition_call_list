-- Add timezone field to market table
ALTER TABLE "market" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'EST';
