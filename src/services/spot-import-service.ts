import { prisma } from "@/lib/prisma";

export type CsvSpotRow = {
  regionId: string;
  slug: string;
  category: string;
  categoryId?: string;
  latitude: string;
  longitude: string;
  address?: string;
  name_ja: string;
  description_ja?: string;
  name_en?: string;
  description_en?: string;
  name_zh?: string;
  description_zh?: string;
  name_ko?: string;
  description_ko?: string;
  instagramUrl?: string;
  xUrl?: string;
  officialUrl?: string;
};

type UrlField = "instagramUrl" | "xUrl" | "officialUrl";

function parseCoordinate(value: string, field: string, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`${field} must be between ${min} and ${max}.`);
  }
  return parsed;
}

function optionalUrl(value: string | undefined, field: UrlField) {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") throw new Error();
    return url.toString();
  } catch {
    throw new Error(`${field} must be a valid HTTPS URL.`);
  }
}

export async function importSpotsFromCsv(rows: CsvSpotRow[]) {
  const results = { successCount: 0, errorCount: 0, errors: [] as string[] };

  for (const [index, row] of rows.entries()) {
    try {
      if (!row.regionId || !row.slug.trim() || !row.category.trim() || !row.name_ja.trim()) {
        throw new Error("regionId, slug, category, and name_ja are required.");
      }

      const latitude = parseCoordinate(row.latitude, "latitude", -90, 90);
      const longitude = parseCoordinate(row.longitude, "longitude", -180, 180);
      const translations = [
        ["ja", row.name_ja, row.description_ja],
        ["en", row.name_en, row.description_en],
        ["zh", row.name_zh, row.description_zh],
        ["ko", row.name_ko, row.description_ko],
      ].filter((translation): translation is [string, string, string | undefined] =>
        Boolean(translation[1]?.trim()),
      );

      await prisma.$transaction(async (transaction) => {
        const spot = await transaction.spot.upsert({
          where: {
            regionId_slug: { regionId: row.regionId, slug: row.slug.trim() },
          },
          update: {
            name: row.name_ja.trim(),
            description: row.description_ja?.trim() || null,
            category: row.category.trim(),
            categoryId: row.categoryId || null,
            address: row.address?.trim() || null,
            latitude,
            longitude,
            instagramUrl: optionalUrl(row.instagramUrl, "instagramUrl"),
            xUrl: optionalUrl(row.xUrl, "xUrl"),
            officialUrl: optionalUrl(row.officialUrl, "officialUrl"),
          },
          create: {
            regionId: row.regionId,
            slug: row.slug.trim(),
            name: row.name_ja.trim(),
            description: row.description_ja?.trim() || null,
            category: row.category.trim(),
            categoryId: row.categoryId || null,
            address: row.address?.trim() || null,
            latitude,
            longitude,
            isPublished: true,
            instagramUrl: optionalUrl(row.instagramUrl, "instagramUrl"),
            xUrl: optionalUrl(row.xUrl, "xUrl"),
            officialUrl: optionalUrl(row.officialUrl, "officialUrl"),
          },
        });

        await transaction.spotTranslation.deleteMany({ where: { spotId: spot.id } });
        if (translations.length > 0) {
          await transaction.spotTranslation.createMany({
            data: translations.map(([language, name, description]) => ({
              spotId: spot.id,
              language,
              name: name.trim(),
              description: description?.trim() || null,
            })),
          });
        }
      });
      results.successCount++;
    } catch (error) {
      results.errorCount++;
      results.errors.push(
        `Row ${index + 1}: ${error instanceof Error ? error.message : "Unknown import error."}`,
      );
    }
  }

  return results;
}
