"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMessages } from "@/lib/i18n";

const STORAGE_KEY = "kyoto-compass-map-search-history";

export function MapSearchHistory({ query, language, basePath = "/map" }: { query: string; language: string; basePath?: "/map" | "/spots" }) {
  const [history, setHistory] = useState<string[]>([]);
  const t = getMessages(language);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
        if (Array.isArray(stored)) setHistory(stored.filter((item): item is string => typeof item === "string"));
      } catch {
        setHistory([]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const value = query.trim();
    if (!value) return;
    const timer = window.setTimeout(() => {
      setHistory((current) => {
        const next = [value, ...current.filter((item) => item !== value)].slice(0, 8);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [query]);

  if (!history.length) return null;

  return (
    <section aria-label={t.searchHistory} className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl text-ink">{t.searchHistory}</h2>
        <button type="button" className="text-xs text-ink/50 underline" onClick={() => { localStorage.removeItem(STORAGE_KEY); setHistory([]); }}>
          {t.clearHistory}
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {history.map((item) => (
          <Link key={item} href={`${basePath}?q=${encodeURIComponent(item)}&language=${encodeURIComponent(language)}`} className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink transition-colors hover:border-vermilion hover:text-vermilion">
            {item}
          </Link>
        ))}
      </div>
    </section>
  );
}
