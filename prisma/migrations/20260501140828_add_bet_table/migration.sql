-- CreateTable
CREATE TABLE "Bet" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "matchId" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,
    "betHome" INTEGER NOT NULL,
    "betAway" INTEGER NOT NULL,
    "winPick" INTEGER,
    "points" INTEGER,
    "bonusPoints" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bet_userId_roomId_idx" ON "Bet"("userId", "roomId");

-- CreateIndex
CREATE INDEX "Bet_matchId_idx" ON "Bet"("matchId");

-- CreateIndex
CREATE INDEX "Bet_roomId_idx" ON "Bet"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "Bet_userId_matchId_roomId_key" ON "Bet"("userId", "matchId", "roomId");

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bet" ADD CONSTRAINT "Bet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
