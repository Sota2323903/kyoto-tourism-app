"use client";

import { useState } from "react";
import { getMessages } from "@/lib/i18n";

type Location = { latitude: number; longitude: number; accuracy: number };

export function useGeolocation(language = "ja") {
  const t = getMessages(language);
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function getApproximateLocation(): Promise<Location> {
    const response = await fetch("/api/location", { cache: "no-store" });
    const data: unknown = await response.json();
    if (!response.ok || !data || typeof data !== "object") {
      throw new Error("Location fallback failed");
    }
    const candidate = data as Partial<Location>;
    if (
      typeof candidate.latitude !== "number"
      || typeof candidate.longitude !== "number"
      || typeof candidate.accuracy !== "number"
    ) {
      throw new Error("Location fallback returned invalid data");
    }
    return candidate as Location;
  }

  function setBrowserLocation({ coords }: GeolocationPosition) {
    setLocation({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy });
  }

  function getCurrentLocation() {
    setLoading(true);
    setError("");
    if (!navigator.geolocation) {
      void getApproximateLocation()
        .then(setLocation)
        .catch(() => setError(t.locationUnsupported))
        .finally(() => setLoading(false));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setBrowserLocation(position);
        setLoading(false);
      },
      () => {
        void getApproximateLocation()
          .then(setLocation)
          .catch(() => setError(t.locationDenied))
          .finally(() => setLoading(false));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }

  return { location, error, loading, getCurrentLocation };
}
