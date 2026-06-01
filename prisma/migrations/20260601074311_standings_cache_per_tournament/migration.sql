/*
  Warnings:

  - The primary key for the `StandingsCache` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `StandingsCache` table. All the data in the column will be lost.
  - Added the required column `tournament` to the `StandingsCache` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StandingsCache" DROP CONSTRAINT "StandingsCache_pkey",
DROP COLUMN "id",
ADD COLUMN     "tournament" TEXT NOT NULL,
ADD CONSTRAINT "StandingsCache_pkey" PRIMARY KEY ("tournament");
