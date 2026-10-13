import { prisma } from "@/lib/prisma";

import type { Prisma, RouteCondition, TransportMode } from "@prisma/client";

export type { RouteCondition, TransportMode };

export interface RouteSearchParams {
  originLat: number;
  originLng: number;
  destinations: Array<{ latitude: number; longitude: number }>;
  mode: TransportMode;
  condition: RouteCondition;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
}

export interface CalculatedRoute {
  mode: TransportMode;
  condition?: RouteCondition;
  durationMinutes: number;
  costYen: number;
  walkingDistanceMeters: number;
  transfers: number;
  steps: RouteStep[];
  geometry: [number, number][];
  provider: "OSRM";
}

const modeCostsYen: Record<TransportMode, number> = {
  WALK: 0,
  TRAIN: 230,
  BUS: 230,
  BICYCLE: 0,
  CAR: 0,
  MIXED: 460,
};

function assertCoordinates(params: RouteSearchParams) {
  for (const coordinate of [
    params.originLat,
    params.originLng,
    ...params.destinations.flatMap((destination) => [destination.latitude, destination.longitude]),
  ]) {
    if (!Number.isFinite(coordinate)) throw new Error("Coordinates must be finite numbers.");
  }
  if (Math.abs(params.originLat) > 90 || params.destinations.some((destination) => Math.abs(destination.latitude) > 90)) {
    throw new Error("Latitude must be between -90 and 90.");
  }
  if (Math.abs(params.originLng) > 180 || params.destinations.some((destination) => Math.abs(destination.longitude) > 180)) {
    throw new Error("Longitude must be between -180 and 180.");
  }
}

const routingEndpoints: Record<TransportMode, string> = {
  WALK: "https://routing.openstreetmap.de/routed-foot",
  BICYCLE: "https://routing.openstreetmap.de/routed-bike",
  CAR: "https://router.project-osrm.org",
  TRAIN: "https://router.project-osrm.org",
  BUS: "https://router.project-osrm.org",
  MIXED: "https://router.project-osrm.org",
};

type OsrmResponse = {
  code?: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: { coordinates?: [number, number][] };
    legs?: Array<{ steps?: Array<{ distance: number; name?: string; maneuver?: { instruction?: string } }> }>;
  }>;
};

export async function calculateRoute(params: RouteSearchParams): Promise<CalculatedRoute> {
  assertCoordinates(params);
  if (!params.destinations.length || params.destinations.length > 10) {
    throw new Error("目的地は1〜10件選択してください。");
  }
  const profile = "driving";
  const endpoint = process.env.OSRM_URL || routingEndpoints[params.mode];
  const coordinates = [
    `${params.originLng},${params.originLat}`,
    ...params.destinations.map((destination) => `${destination.longitude},${destination.latitude}`),
  ].join(";");
  const url = `${endpoint.replace(/\/$/, "")}/route/v1/${profile}/${coordinates}?overview=full&geometries=geojson&steps=true`;
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`道路ルートサービスへの接続に失敗しました（${response.status}）。`);
  const payload = (await response.json()) as OsrmResponse;
  const osrmRoute = payload.routes?.[0];
  const geometry = osrmRoute?.geometry?.coordinates;
  if (payload.code !== "Ok" || !osrmRoute || !geometry || geometry.length < 2) {
    throw new Error("現在地から目的地までの道路ルートが見つかりませんでした。");
  }
  const distanceMeters = Math.max(1, Math.round(osrmRoute.distance));
  const durationMinutes = Math.max(1, Math.ceil(osrmRoute.duration / 60));
  const steps = osrmRoute.legs?.flatMap((leg) => leg.steps ?? []).map((step) => ({
    instruction: step.maneuver?.instruction || (step.name ? `${step.name}を進む` : "道路に沿って進む"),
    distanceMeters: Math.max(1, Math.round(step.distance)),
  })) ?? [];
  const walkingDistanceMeters =
    params.mode === "WALK" ? distanceMeters : params.mode === "MIXED" ? Math.min(800, distanceMeters) : 100;

  return {
    mode: params.mode,
    condition: params.condition,
    durationMinutes,
    costYen: modeCostsYen[params.mode],
    walkingDistanceMeters,
    transfers: params.mode === "MIXED" ? 1 : 0,
    steps: steps.length ? steps : [{ instruction: "道路に沿って目的地へ進む", distanceMeters }],
    geometry: geometry.map(([longitude, latitude]) => [latitude, longitude]),
    provider: "OSRM",
  };
}

export interface SaveRouteInput {
  title: string;
  origin: string;
  destination: string;
  mode: TransportMode;
  condition?: RouteCondition;
  details?: Prisma.InputJsonValue;
}

export function saveUserRoute(userId: string, data: SaveRouteInput) {
  return prisma.savedRoute.create({
    data: {
      userId,
      title: data.title,
      origin: data.origin,
      destination: data.destination,
      mode: data.mode,
      condition: data.condition ?? "FASTEST",
      details: data.details,
    },
  });
}
