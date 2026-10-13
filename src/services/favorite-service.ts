import { prisma } from "@/lib/prisma";

export async function toggleFavorite(userId: string, spotId: string) {
  const existing = await prisma.favorite.findUnique({ where: { userId_spotId: { userId, spotId } } });
  if (existing) {
    await prisma.favorite.delete({ where: { userId_spotId: { userId, spotId } } });
    return { isFavorite: false };
  }

  await prisma.favorite.create({ data: { userId, spotId } });
  return { isFavorite: true };
}

export async function isFavorite(userId: string, spotId: string) {
  const favorite = await prisma.favorite.findUnique({
    where: { userId_spotId: { userId, spotId } },
    select: { userId: true },
  });
  return Boolean(favorite);
}

export async function getUserFavorites(userId: string, language = "ja") {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      spot: {
        select: {
          id: true, slug: true, address: true, latitude: true, longitude: true,
          name: true, description: true,
          translations: { where: { language }, select: { name: true, description: true } },
          images: { take: 1, orderBy: { sortOrder: "asc" }, select: { url: true, altText: true } },
        },
      },
    },
  });
}
