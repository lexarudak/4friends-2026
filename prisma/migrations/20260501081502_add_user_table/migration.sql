-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "currentRoom" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentRoom_fkey" FOREIGN KEY ("currentRoom") REFERENCES "Room"("name") ON DELETE SET NULL ON UPDATE CASCADE;
