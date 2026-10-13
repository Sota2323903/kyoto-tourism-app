import { NotificationType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { createNotification } from "@/services/notification-service";

const notificationTypes = new Set<string>(Object.values(NotificationType));
const allowedRoles = new Set(["ADMIN", "SUPER_ADMIN"]);

function isTranslation(value: unknown): value is { language: string; title: string; content: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  return [item.language, item.title, item.content].every(
    (field) => typeof field === "string" && field.trim().length > 0,
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!allowedRoles.has(session?.user?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  if (
    typeof input.type !== "string" ||
    !notificationTypes.has(input.type) ||
    !Array.isArray(input.translations) ||
    input.translations.length === 0 ||
    !input.translations.every(isTranslation)
  ) {
    return NextResponse.json({ error: "type and valid translations are required." }, { status: 400 });
  }

  try {
    const notification = await createNotification({
      type: input.type as NotificationType,
      translations: input.translations as { language: string; title: string; content: string }[],
      sourceId: typeof input.sourceId === "string" ? input.sourceId : undefined,
    });
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Failed to create alert notification.", error);
    return NextResponse.json({ error: "Failed to create notification." }, { status: 500 });
  }
}
