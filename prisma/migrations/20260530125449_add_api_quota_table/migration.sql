-- CreateTable
CREATE TABLE "ApiQuota" (
    "date" DATE NOT NULL,
    "requestsCount" INTEGER NOT NULL DEFAULT 0,
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiQuota_pkey" PRIMARY KEY ("date")
);
