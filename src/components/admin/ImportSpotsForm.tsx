"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { getMessages } from "@/lib/i18n";

export function ImportSpotsForm() {
  const language = useSearchParams().get("language") ?? "ja";
  const t = getMessages(language);
  const [result, setResult] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("file");
    if (!(file instanceof File)) return;
    const response = await fetch("/api/admin/spots/import", { method: "POST", body: await file.text(), headers: { "Content-Type": "text/csv; charset=utf-8" } });
    const data = await response.json();
    setResult(response.ok ? t.imported(data.successCount, data.errorCount) : data.error ?? t.importFailed);
  }
  return <main className="mx-auto max-w-3xl space-y-6 px-6 py-12"><h1 className="font-serif text-4xl text-ink">{t.importTitle}</h1><p className="text-sm text-ink/60">{t.csvHelp}</p><form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-white p-6"><input name="file" type="file" accept=".csv,text/csv" required /><button className="rounded-full bg-vermilion px-5 py-3 font-semibold text-white" type="submit">{t.import}</button>{result && <p role="status">{result}</p>}</form></main>;
}
