import { NextResponse } from "next/server";
import { RouteCondition, TransportMode } from "@prisma/client";

import { calculateRoute } from "@/services/routeService";

const modes = new Set<string>(Object.values(TransportMode));
const conditions = new Set<string>(Object.values(RouteCondition));

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const destinations = input.destinations;
  const legacyDestination = typeof input.destLat === "number" && typeof input.destLng === "number"
    ? [{ latitude: input.destLat, longitude: input.destLng }]
    : undefined;
  if (
    typeof input.originLat !== "number" || !Number.isFinite(input.originLat) ||
    typeof input.originLng !== "number" || !Number.isFinite(input.originLng) ||
    (!Array.isArray(destinations) && !legacyDestination) ||
    (Array.isArray(destinations) && (destinations.length < 1 || destinations.length > 10 ||
      !destinations.every((destination) =>
        destination && typeof destination === "object" &&
        typeof destination.latitude === "number" && Number.isFinite(destination.latitude) &&
        typeof destination.longitude === "number" && Number.isFinite(destination.longitude),
      ))) ||
    typeof input.mode !== "string" || !modes.has(input.mode) ||
    typeof input.condition !== "string" || !conditions.has(input.condition)
  ) {
    return NextResponse.json({ error: "Invalid route search parameters." }, { status: 400 });
  }
  try {
    return NextResponse.json(await calculateRoute({
      originLat: input.originLat as number,
      originLng: input.originLng as number,
      destinations: (destinations ?? legacyDestination) as Array<{ latitude: number; longitude: number }>,
      mode: input.mode as TransportMode,
      condition: input.condition as RouteCondition,
    }));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Route calculation failed." }, { status: 502 });
  }
}
