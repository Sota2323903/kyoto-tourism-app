-- AlterTable
ALTER TABLE "Spot" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "officialUrl" TEXT,
ADD COLUMN     "openingHours" JSONB,
ADD COLUMN     "priceInfo" JSONB,
ADD COLUMN     "xUrl" TEXT;

-- CreateTable
CREATE TABLE "SpotTranslation" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "SpotTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTranslation" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CategoryTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotImage" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SpotImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpotTranslation_language_idx" ON "SpotTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "SpotTranslation_spotId_language_key" ON "SpotTranslation"("spotId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "CategoryTranslation_language_idx" ON "CategoryTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTranslation_categoryId_language_key" ON "CategoryTranslation"("categoryId", "language");

-- CreateIndex
CREATE INDEX "SpotImage_spotId_sortOrder_idx" ON "SpotImage"("spotId", "sortOrder");

-- CreateIndex
CREATE INDEX "Spot_categoryId_idx" ON "Spot"("categoryId");

-- AddForeignKey
ALTER TABLE "Spot" ADD CONSTRAINT "Spot_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotTranslation" ADD CONSTRAINT "SpotTranslation_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTranslation" ADD CONSTRAINT "CategoryTranslation_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotImage" ADD CONSTRAINT "SpotImage_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "Spot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
