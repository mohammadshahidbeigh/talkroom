/*
  Warnings:

  - Added the required column `creatorId` to the `VideoRoom` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VideoRoom" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "VideoRoomParticipant_roomId_idx" ON "VideoRoomParticipant"("roomId");

-- CreateIndex
CREATE INDEX "VideoRoomParticipant_userId_idx" ON "VideoRoomParticipant"("userId");

-- AddForeignKey
ALTER TABLE "VideoRoom" ADD CONSTRAINT "VideoRoom_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
