import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type SpotListFilters = {
  regionId?: string;
  category?: string;
  categoryId?: string;
  language?: string;
  query?: string;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function listPublishedSpots(filters: SpotListFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE),
  );
  const search = filters.query?.trim();
  const language = filters.language ?? "ja";

  const where: Prisma.SpotWhereInput = {
    isPublished: true,
    regionId: filters.regionId,
    ...(filters.category
      ? { category: filters.category }
      : filters.categoryId
        ? { categoryId: filters.categoryId }
        : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            {
              translations: {
                some: {
                  language,
                  name: { contains: search, mode: "insensitive" },
                },
              },
            },
          ],
        }

      : {}),
  };

  const [spots, total] = await prisma.$transaction([
    prisma.spot.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        category: true,
        address: true,
        latitude: true,
        longitude: true,
        openingHours: true,
        priceInfo: true,
        instagramUrl: true,
        xUrl: true,
        officialUrl: true,
        categoryRef: {
          select: {
            slug: true,
            translations: {
              where: { language },
              select: { name: true },
            },
          },
        },
        translations: {
          where: { language },
          select: { name: true, description: true },
        },
        images: {
          take: 1,
          orderBy: { sortOrder: "asc" },
          select: { url: true, altText: true },
        },
        statusOverride: {
          select: { isTemporarilyClosed: true, congestionLevel: true, noticeMessage: true, updatedAt: true },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.spot.count({ where }),
  ]);

  return {
    spots,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getPublishedSpotBySlug(slug: string, language = "ja") {
  return prisma.spot.findFirst({
    where: { slug, isPublished: true },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      category: true,
      address: true,
      latitude: true,
      longitude: true,
      openingHours: true,
      priceInfo: true,
      instagramUrl: true,
      xUrl: true,
      officialUrl: true,
      region: { select: { name: true, slug: true } },
      categoryRef: {
        select: {
          slug: true,
          translations: { where: { language }, select: { name: true } },
        },
      },
      translations: {
        where: { language },
        select: { name: true, description: true },
      },
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true, altText: true, sortOrder: true },
      },
    },
  });
}

export async function getNearbyPublishedSpots(
  latitude: number,
  longitude: number,
  radiusKm = 5,
  language = "ja",
) {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Invalid geographic coordinates.");
  }

  const radiusMeters = Math.min(50, Math.max(0.1, radiusKm)) * 1000;

  return prisma.$queryRaw<
    Array<{
      id: string;
      slug: string;
      latitude: number;
      longitude: number;
      address: string | null;
      name: string | null;
      description: string | null;
      distanceMeters: number;
    }>
  >`
    WITH points AS (
      SELECT
        s.*,
        ST_SetSRID(ST_MakePoint(s."longitude"::double precision, s."latitude"::double precision), 4326)::geography AS point
      FROM "Spot" s
      WHERE s."isPublished" = true
    )
    SELECT
      p.id,
      p.slug,
      p.latitude::double precision,
      p.longitude::double precision,
      p.address,
      st.name,
      st.description,
      ST_Distance(
        p.point,
        ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
      ) AS "distanceMeters"
    FROM points p
    LEFT JOIN "SpotTranslation" st
      ON st."spotId" = p.id AND st.language = ${language}
    WHERE ST_DWithin(
      p.point,
      ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
      ${radiusMeters}
    )
    ORDER BY "distanceMeters" ASC
    LIMIT 50
  `;
}
