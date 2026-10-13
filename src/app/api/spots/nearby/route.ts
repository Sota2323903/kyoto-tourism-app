import { NextResponse } from "next/server";

import { getNearbyPublishedSpots } from "@/services/spot-service";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const latitude = Number(params.get("lat"));
  const longitude = Number(params.get("lng"));
  const radiusKm = Number(params.get("radiusKm") ?? "5");
  try {
    return NextResponse.json(await getNearbyPublishedSpots(latitude, longitude, radiusKm, params.get("language") ?? "ja"));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}
