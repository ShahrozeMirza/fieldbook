-- AlterTable
ALTER TABLE "Deal" ADD COLUMN "closedAt" DATETIME;

-- CreateIndex
CREATE INDEX "Deal_stage_closedAt_idx" ON "Deal"("stage", "closedAt");

-- Backfill: deals already closed get their last update as the close date.
UPDATE "Deal" SET "closedAt" = "updatedAt" WHERE "stage" IN ('won', 'lost') AND "closedAt" IS NULL;
