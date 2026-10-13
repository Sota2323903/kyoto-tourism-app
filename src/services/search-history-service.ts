import { prisma } from "@/lib/prisma";

export async function recordSearchHistory(userId: string, query: string) {
  const normalizedQuery = query.trim().slice(0, 200);
  if (!normalizedQuery) return null;
  return prisma.searchHistory.create({ data: { userId, query: normalizedQuery } });
}

export async function getSearchHistory(userId: string, limit = 20) {
  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 50),
    select: { id: true, query: true, createdAt: true },
  });
}
