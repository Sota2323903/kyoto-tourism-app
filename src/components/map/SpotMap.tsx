"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

import L from "leaflet";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { getMessages } from "@/lib/i18n";
import { getTimeAdjustedCongestionLevel } from "@/lib/congestion";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type MapSpot = {
  id: string;
  slug: string;
  latitude: number;
  longitude: number;
  title: string;
  address?: string | null;
  officialUrl?: string | null;
  congestionLevel?: number;
  isTemporarilyClosed?: boolean;
  openingHours?: unknown;
};

export type MapDisplayMode = "congestion" | "route";

const congestionColors = ["#22c55e", "#facc15", "#f97316", "#dc2626"];
const closedColor = "#9ca3af";

function isOutsideOpeningHours(value: unknown, now = new Date()) {
  if (typeof value === "string") return isOutsideTimeRange(value, now);
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const hours = value as Record<string, unknown>;
  const dayKeys = [
    ["日", "sun", "sunday"], ["月", "mon", "monday"], ["火", "tue", "tuesday"],
    ["水", "wed", "wednesday"], ["木", "thu", "thursday"], ["金", "fri", "friday"],
    ["土", "sat", "saturday"],
  ][now.getDay()];
  const entry = dayKeys.map((key) => hours[key]).find((item) => typeof item === "string");
  if (!entry) return false;
  return isOutsideTimeRange(entry as string, now);
}

function isOutsideTimeRange(text: string, now: Date) {
  if (/休|closed/i.test(text)) return true;
  const match = text.match(/(\d{1,2}):?(\d{2})\s*[-〜]\s*(\d{1,2}):?(\d{2})/);
  if (!match) return false;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const start = Number(match[1]) * 60 + Number(match[2]);
  const end = Number(match[3]) * 60 + Number(match[4]);
  return start <= end
    ? currentMinutes < start || currentMinutes >= end
    : currentMinutes < start && currentMinutes >= end;
}

function ClusterMarkers({ spots, selectedSpotId, displayMode, language, timeKey }: { spots: MapSpot[]; selectedSpotId?: string; displayMode: MapDisplayMode; language: string; timeKey: string }) {
  const map = useMap();
  const t = getMessages(language);

  useEffect(() => {
    let cluster: L.MarkerClusterGroup | undefined;
    let disposed = false;

    const initialize = async () => {
      (globalThis as typeof globalThis & { L: typeof L }).L = L;
      await import("leaflet.markercluster");
      if (disposed) return;

      cluster = L.markerClusterGroup();
      const validSpots = spots.filter((spot) => Number.isFinite(spot.latitude) && Number.isFinite(spot.longitude));
      const markers = validSpots.map((spot) => {
        const level = getTimeAdjustedCongestionLevel(spot.congestionLevel, spot.slug);
        const outsideOpeningHours = isOutsideOpeningHours(spot.openingHours);
        const markerColor = outsideOpeningHours ? closedColor : congestionColors[level - 1];
        const icon = displayMode === "congestion"
          ? L.divIcon({
            className: "congestion-marker",
            html: `<span style="background:${markerColor}" aria-label="${outsideOpeningHours ? t.outsideHours : [t.congestionLow, t.congestionNormal, t.congestionHigh, t.congestionVeryHigh][level - 1]}"></span>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })
          : undefined;
        const marker = L.marker([spot.latitude, spot.longitude], icon ? { icon } : undefined);
        const congestion = `<br>${t.congestionArea}: ${[t.congestionLow, t.congestionNormal, t.congestionHigh, t.congestionVeryHigh][level - 1]}${outsideOpeningHours ? `<br><strong>${t.outsideHours}</strong>` : ""}`;
        const closed = spot.isTemporarilyClosed ? `<br><strong>${t.temporarilyClosed}</strong>` : "";
        const officialLink = spot.officialUrl
          ? `<br><a href="${escapeHtml(spot.officialUrl)}" target="_blank" rel="noreferrer">${t.officialSite}</a>`
          : "";
        marker.bindPopup(`<strong>${escapeHtml(spot.title)}</strong>${spot.address ? `<br>${escapeHtml(spot.address)}` : ""}${congestion}${closed}<br><a href="/spots/${encodeURIComponent(spot.slug)}?language=${encodeURIComponent(language)}">${t.details}</a>${officialLink}`);
        return marker;
      });
      cluster.addLayers(markers);
      map.addLayer(cluster);
      const selectedIndex = selectedSpotId ? validSpots.findIndex((spot) => spot.id === selectedSpotId) : -1;
      if (selectedIndex >= 0) {
        const selected = spots[selectedIndex];
        map.setView([selected.latitude, selected.longitude], 16);
        cluster.zoomToShowLayer(markers[selectedIndex], () => markers[selectedIndex].openPopup());
      }
    };

    void initialize();
    return () => {
      disposed = true;
      if (cluster) map.removeLayer(cluster);
    };
  }, [displayMode, language, map, selectedSpotId, spots, t, timeKey]);

  return null;
}

function CongestionOverlay({ spots, displayMode, timeKey }: { spots: MapSpot[]; displayMode: MapDisplayMode; timeKey: string }) {
  const map = useMap();

  useEffect(() => {
    if (displayMode !== "congestion") return;

    const validSpots = spots.filter((spot) => Number.isFinite(spot.latitude) && Number.isFinite(spot.longitude));
    if (validSpots.length > 0) {
      map.fitBounds(
        L.latLngBounds(validSpots.map((spot) => [spot.latitude, spot.longitude] as [number, number])),
        { padding: [70, 70], maxZoom: 14 },
      );
    }

    const layers = validSpots
      .map((spot) => {
        const level = getTimeAdjustedCongestionLevel(spot.congestionLevel, spot.slug);
        const radius = 450 + level * 100;
        const circle = L.circle([spot.latitude, spot.longitude], {
          radius,
          color: congestionColors[level - 1],
          fillColor: congestionColors[level - 1],
          fillOpacity: 0.12 + level * 0.035,
          opacity: 0.35,
          weight: 2,
          interactive: false,
        }).addTo(map);
        return circle;
      });

    return () => {
      layers.forEach((layer) => map.removeLayer(layer));
    };
  }, [displayMode, map, spots, timeKey]);

  return null;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}

function RouteOverlay({ route }: { route?: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!route || route.length < 2) return;
    const line = L.polyline(route, { color: "#c2410c", weight: 5 }).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [30, 30] });
    return () => { map.removeLayer(line); };
  }, [map, route]);
  return null;
}

function CurrentLocation({ location, accuracy }: { location?: [number, number]; accuracy?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!location) return;
    map.flyTo(location, Math.max(map.getZoom(), 16), { duration: 1 });
    const accuracyCircle = accuracy && Number.isFinite(accuracy)
      ? L.circle(location, { radius: Math.min(Math.max(accuracy, 30), 1000), color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.1, weight: 1 }).addTo(map)
      : undefined;
    const marker = L.marker(location, {
      icon: L.divIcon({
        className: "current-location-icon",
        html: `<span class="current-location-accuracy">${accuracy && Number.isFinite(accuracy) ? `${Math.round(accuracy)}m` : "現在地"}</span><span class="current-location-pin"></span>`,
        iconSize: [52, 72],
        iconAnchor: [26, 66],
      }),
      zIndexOffset: 1000,
    }).addTo(map);
    return () => {
      if (accuracyCircle) map.removeLayer(accuracyCircle);
      map.removeLayer(marker);
    };
  }, [accuracy, map, location]);
  return null;
}

export function SpotMap({ spots, selectedSpotId, route, currentLocation, currentLocationAccuracy, displayMode = "route", language = "ja" }: { spots: MapSpot[]; selectedSpotId?: string; route?: [number, number][]; currentLocation?: [number, number]; currentLocationAccuracy?: number; displayMode?: MapDisplayMode; language?: string }) {
  const [timeKey, setTimeKey] = useState(() => new Date().toISOString().slice(0, 13));
  useEffect(() => {
    const timer = window.setInterval(() => setTimeKey(new Date().toISOString().slice(0, 13)), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const center: [number, number] = spots.length ? [spots[0].latitude, spots[0].longitude] : [35.0116, 135.7681];
  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} className="h-[500px] w-full rounded-2xl">
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <CongestionOverlay spots={spots} displayMode={displayMode} timeKey={timeKey} />
      <ClusterMarkers spots={spots} selectedSpotId={selectedSpotId} displayMode={displayMode} language={language} timeKey={timeKey} />
      <RouteOverlay route={displayMode === "route" ? route : undefined} />
      <CurrentLocation location={currentLocation} accuracy={currentLocationAccuracy} />
    </MapContainer>
  );
}
