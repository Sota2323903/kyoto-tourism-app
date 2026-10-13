"use client";

import { useState } from "react";
import { getMessages } from "@/lib/i18n";

type FormSpot = { id?: string; regionId?: string; slug?: string; name?: string; description?: string | null; category?: string; address?: string | null; latitude?: number; longitude?: number; isPublished?: boolean; instagramUrl?: string | null; xUrl?: string | null; officialUrl?: string | null };

export function SpotForm({ initial = {}, language = "ja" }: { initial?: FormSpot; language?: string }) {
  const t = getMessages(language);
  const [form, setForm] = useState({ regionId: initial.regionId ?? "", slug: initial.slug ?? "", name: initial.name ?? "", description: initial.description ?? "", category: initial.category ?? "", address: initial.address ?? "", latitude: String(initial.latitude ?? 35.0116), longitude: String(initial.longitude ?? 135.7681), isPublished: initial.isPublished ?? false, instagramUrl: initial.instagramUrl ?? "", xUrl: initial.xUrl ?? "", officialUrl: initial.officialUrl ?? "" });
  const [message, setMessage] = useState("");
  const update = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch(initial.id ? `/api/admin/spots/${initial.id}` : "/api/admin/spots", { method: initial.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, latitude: Number(form.latitude), longitude: Number(form.longitude) }) });
    setMessage(response.ok ? t.saved : (await response.json()).error ?? t.saveFailed);
  }
  return <form onSubmit={submit} className="grid max-w-2xl gap-4 rounded-2xl border bg-white p-6">{(["regionId", "slug", "name", "category", "address", "latitude", "longitude", "instagramUrl", "xUrl", "officialUrl"] as const).map((key) => <label className="grid gap-1 text-sm" key={key}>{key}<input className="rounded-lg border px-3 py-2" value={form[key]} onChange={(event) => update(key, event.target.value)} required={["regionId", "slug", "name", "category", "latitude", "longitude"].includes(key)} /></label>)}<label className="grid gap-1 text-sm">description<textarea className="rounded-lg border px-3 py-2" value={form.description} onChange={(event) => update("description", event.target.value)} /></label><label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(event) => update("isPublished", event.target.checked)} />{t.publish}</label><button className="rounded-full bg-vermilion px-5 py-3 font-semibold text-white" type="submit">{t.save}</button>{message && <p role="status">{message}</p>}</form>;
}
