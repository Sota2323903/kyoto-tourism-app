import type { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getNotifications(language = "ja", limit = 10) {
  return prisma.notification.findMany({
    where: { isGlobal: true },
    take: Math.min(Math.max(limit, 1), 50),
    orderBy: { createdAt: "desc" },
    select: { id: true, type: true, createdAt: true, translations: { where: { language }, select: { title: true, content: true } } },
  });
}

export async function createNotification(input: {
  type: NotificationType;
  translations: { language: string; title: string; content: string }[];
  sourceId?: string;
}) {
  if (!input.translations.length) throw new Error("At least one translation is required.");
  return prisma.notification.create({
    data: {
      type: input.type,
      sourceId: input.sourceId,
      translations: { create: input.translations },
    },
  });
}
