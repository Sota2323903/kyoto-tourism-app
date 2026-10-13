"use client";

import { useState } from "react";
import { getMessages } from "@/lib/i18n";

export function useGeolocation(language = "ja") {
  const t = getMessages(language);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setError(t.locationUnsupported);
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy });
        setLoading(false);
      },
      () => {
        setError(t.locationDenied);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return { location, error, loading, getCurrentLocation };
}
