"use client";

import dynamic from "next/dynamic";

import type { MapDisplayMode, MapSpot } from "@/components/map/SpotMap";

const SpotMap = dynamic(() => import("@/components/map/SpotMap").then((module) => module.SpotMap), {
  ssr: false,
  loading: () => <div className="h-[500px] animate-pulse rounded-2xl bg-slate-200" />,
});

export function SpotMapLoader({ spots, selectedSpotId, route, currentLocation, currentLocationAccuracy, displayMode, language }: { spots: MapSpot[]; selectedSpotId?: string; route?: [number, number][]; currentLocation?: [number, number]; currentLocationAccuracy?: number; displayMode?: MapDisplayMode; language?: string }) {
  return <SpotMap spots={spots} selectedSpotId={selectedSpotId} route={route} currentLocation={currentLocation} currentLocationAccuracy={currentLocationAccuracy} displayMode={displayMode} language={language} />;
}
