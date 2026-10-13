"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { getMessages } from "@/lib/i18n";

type NearbySpot = { id: string; slug: string; name: string | null; address: string | null; distanceMeters: number };

export function NearbySpots({ language }: { language: string }) {
  const { location, error, loading, getCurrentLocation } = useGeolocation(language);
  const [spots, setSpots] = useState<NearbySpot[]>([]);
  const [radius, setRadius] = useState("5");
  const t = getMessages(language);

  useEffect(() => {
    if (!location) return;
    void fetch(`/api/spots/nearby?lat=${location.latitude}&lng=${location.longitude}&radiusKm=${radius}&language=${language}`)
      .then((response) => response.json())
      .then((data) => setSpots(Array.isArray(data) ? data : []))
      .catch(() => setSpots([]));
  }, [location, radius, language]);

  return (
    <section className="mt-10 rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-ink">{t.nearbyTitle}</h2>
          <p className="mt-1 text-sm text-ink/60">{t.nearbyHint}</p>
        </div>
        <div className="flex gap-2">
          <select value={radius} onChange={(event) => { setRadius(event.target.value); setSpots([]); }} className="rounded-full border border-ink/15 px-3 py-2 text-sm">
            <option value="1">1km</option><option value="3">3km</option><option value="5">5km</option>
          </select>
          <button type="button" onClick={getCurrentLocation} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-sand">{loading ? "..." : t.currentLocation}</button>
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {spots.length > 0 && <div className="mt-5 grid gap-3 sm:grid-cols-2">{spots.map((spot) => <Link key={spot.id} href={`/spots/${spot.slug}?language=${language}`} className="rounded-xl border border-ink/10 p-3 hover:border-vermilion"><p className="font-semibold text-ink">{spot.name ?? "スポット"}</p><p className="mt-1 text-xs text-ink/55">{(spot.distanceMeters / 1000).toFixed(1)}km · {spot.address}</p></Link>)}</div>}
    </section>
  );
}
