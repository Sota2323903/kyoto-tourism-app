-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('WALK', 'TRAIN', 'BUS', 'BICYCLE', 'CAR', 'MIXED');

-- CreateEnum
CREATE TYPE "RouteCondition" AS ENUM ('FASTEST', 'CHEAPEST', 'LESS_WALKING', 'FEWER_TRANSFERS', 'AVOID_CROWDS');

-- CreateTable
CREATE TABLE "SavedRoute" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "mode" "TransportMode" NOT NULL,
    "condition" "RouteCondition" NOT NULL DEFAULT 'FASTEST',
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedRoute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedRoute_userId_idx" ON "SavedRoute"("userId");

-- AddForeignKey
ALTER TABLE "SavedRoute" ADD CONSTRAINT "SavedRoute_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
