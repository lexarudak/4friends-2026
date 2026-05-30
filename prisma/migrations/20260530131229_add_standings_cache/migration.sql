-- CreateTable
CREATE TABLE "StandingsCache" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandingsCache_pkey" PRIMARY KEY ("id")
);
