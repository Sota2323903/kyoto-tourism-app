-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "sourceId" TEXT;

-- CreateTable
CREATE TABLE "SpotStatusOverride" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "isTemporarilyClosed" BOOLEAN NOT NULL DEFAULT false,
    "congestionLevel" INTEGER NOT NULL DEFAULT 1,
    "noticeMessage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SpotStatusOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notification_sourceId_key" ON "Notification"("sourceId");
CREATE UNIQUE INDEX "SpotStatusOverride_spotId_key" ON "SpotStatusOverride"("spotId");

-- AddForeignKey
ALTER TABLE "SpotStatusOverride" ADD CONSTRAINT "SpotStatusOverride_spotId_fkey"
  FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
