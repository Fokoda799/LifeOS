-- AlterTable
ALTER TABLE "user_tools" ADD COLUMN     "deletionScheduledFor" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "user_tools_deletionScheduledFor_idx" ON "user_tools"("deletionScheduledFor");
