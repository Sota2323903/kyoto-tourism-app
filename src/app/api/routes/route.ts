import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { RouteCondition, TransportMode } from "@prisma/client";

import { authOptions } from "@/lib/auth";
import { saveUserRoute } from "@/services/routeService";
import { prisma } from "@/lib/prisma";

const modes = new Set<string>(Object.values(TransportMode));
const conditions = new Set<string>(Object.values(RouteCondition));

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isJsonValue(value: unknown): value is object {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const routes = await prisma.savedRoute.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(routes);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  if (
    !isNonEmptyString(input.title) ||
    !isNonEmptyString(input.origin) ||
    !isNonEmptyString(input.destination) ||
    !modes.has(String(input.mode)) ||
    (input.condition !== undefined && !conditions.has(String(input.condition)))
  ) {
    return NextResponse.json(
      { error: "title, origin, destination, and mode are required." },
      { status: 400 },
    );
  }
  if (input.details !== undefined && !isJsonValue(input.details)) {
    return NextResponse.json({ error: "details must be a JSON object." }, { status: 400 });
  }

  try {
    const savedRoute = await saveUserRoute(session.user.id, {
      title: input.title.trim(),
      origin: input.origin.trim(),
      destination: input.destination.trim(),
      mode: input.mode as TransportMode,
      condition: input.condition as RouteCondition | undefined,
      details: input.details as object | undefined,
    });
    return NextResponse.json(savedRoute, { status: 201 });
  } catch (error) {
    console.error("Failed to save route.", error);
    return NextResponse.json({ error: "Failed to save route." }, { status: 500 });
  }
}
