import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, createAuditLog } from "@/services/audit-log-service";

export type SpotMutationInput = {
  regionId: string;
  slug: string;
  name: string;
  description?: string;
  category: string;
  categoryId?: string;
  address?: string;
  latitude: number;
  longitude: number;
  isPublished?: boolean;
  openingHours?: unknown;
  priceInfo?: unknown;
  instagramUrl?: string;
  xUrl?: string;
  officialUrl?: string;
  translations?: Array<{ language: string; name: string; description?: string }>;
};

function validate(input: SpotMutationInput) {
  if (!input.regionId || !input.slug || !input.name || !input.category) {
    throw new Error("regionId, slug, name, and category are required.");
  }
  if (!Number.isFinite(input.latitude) || input.latitude < -90 || input.latitude > 90) {
    throw new Error("latitude must be between -90 and 90.");
  }
  if (!Number.isFinite(input.longitude) || input.longitude < -180 || input.longitude > 180) {
    throw new Error("longitude must be between -180 and 180.");
  }
  for (const value of [input.instagramUrl, input.xUrl, input.officialUrl]) {
    if (value && !value.startsWith("https://")) throw new Error("External links must use HTTPS.");
  }
}

export async function createSpot(input: SpotMutationInput, userId: string) {
  validate(input);
  const spot = await prisma.$transaction(async (transaction) => {
    const created = await transaction.spot.create({
      data: {
        regionId: input.regionId,
        slug: input.slug,
        name: input.name,
        description: input.description,
        category: input.category,
        categoryId: input.categoryId || null,
        address: input.address,
        latitude: input.latitude,
        longitude: input.longitude,
        isPublished: input.isPublished ?? false,
        openingHours: input.openingHours as object | undefined,
        priceInfo: input.priceInfo as object | undefined,
        instagramUrl: input.instagramUrl,
        xUrl: input.xUrl,
        officialUrl: input.officialUrl,
      },
    });
    if (input.translations?.length) {
      await transaction.spotTranslation.createMany({
        data: input.translations.map((translation) => ({ ...translation, spotId: created.id })),
      });
    }
    return created;
  });
  await createAuditLog({
    userId,
    action: AUDIT_ACTIONS.ADMIN_OPERATION,
    entityType: "Spot",
    entityId: spot.id,
    metadata: { operation: "create" },
  });
  return spot;
}

export async function updateSpot(id: string, input: Partial<SpotMutationInput>, userId: string) {
  if (input.latitude !== undefined || input.longitude !== undefined) {
    validate({
      regionId: input.regionId ?? "existing",
      slug: input.slug ?? "existing",
      name: input.name ?? "existing",
      category: input.category ?? "existing",
      latitude: input.latitude ?? 0,
      longitude: input.longitude ?? 0,
    });
  }
  const spot = await prisma.spot.update({
    where: { id },
    data: {
      regionId: input.regionId,
      slug: input.slug,
      name: input.name,
      description: input.description,
      category: input.category,
      categoryId: input.categoryId,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      isPublished: input.isPublished,
      openingHours: input.openingHours as object | undefined,
      priceInfo: input.priceInfo as object | undefined,
      instagramUrl: input.instagramUrl,
      xUrl: input.xUrl,
      officialUrl: input.officialUrl,
    },
  });
  if (input.translations) {
    await prisma.$transaction([
      prisma.spotTranslation.deleteMany({ where: { spotId: id } }),
      prisma.spotTranslation.createMany({
        data: input.translations.map((translation) => ({ ...translation, spotId: id })),
      }),
    ]);
  }
  await createAuditLog({
    userId,
    action: AUDIT_ACTIONS.ADMIN_OPERATION,
    entityType: "Spot",
    entityId: id,
    metadata: { operation: "update" },
  });
  return spot;
}

export async function deleteSpot(id: string, userId: string) {
  await prisma.spot.delete({ where: { id } });
  await createAuditLog({
    userId,
    action: AUDIT_ACTIONS.ADMIN_OPERATION,
    entityType: "Spot",
    entityId: id,
    metadata: { operation: "delete" },
  });
}
