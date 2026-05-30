-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "tournament" TEXT NOT NULL DEFAULT 'wc2026';

-- CreateIndex
CREATE INDEX "Match_tournament_idx" ON "Match"("tournament");
