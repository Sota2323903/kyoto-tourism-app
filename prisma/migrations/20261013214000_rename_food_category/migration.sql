UPDATE "Spot" SET "category" = '食事' WHERE "category" = '食べる';
UPDATE "CategoryTranslation"
SET "name" = '食事'
WHERE "language" = 'ja'
  AND "categoryId" = (SELECT "id" FROM "Category" WHERE "slug" = 'food');
