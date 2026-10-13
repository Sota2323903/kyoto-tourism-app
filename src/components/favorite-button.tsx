"use client";

import { useState } from "react";
import { getMessages } from "@/lib/i18n";

export function FavoriteButton({ spotId, initialFavorite = false, language = "ja" }: { spotId: string; initialFavorite?: boolean; language?: string }) {
  const t = getMessages(language);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [error, setError] = useState("");

  async function toggle() {
    setError("");
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotId }),
    });
    if (response.status === 401) {
      setError(t.favoriteSignIn);
      return;
    }
    if (!response.ok) {
      setError(t.favoriteFailed);
      return;
    }
    const result = await response.json();
    setIsFavorite(result.isFavorite);
  }

  return (
    <div>
      <button type="button" onClick={toggle} className="rounded-full border border-vermilion px-4 py-2 text-sm font-semibold text-vermilion">
        {isFavorite ? t.favoriteAdded : t.favoriteAdd}
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
