"use client";

import { useState } from "react";
import { getMessages } from "@/lib/i18n";

type FormImage = { url: string; altText?: string | null; sortOrder?: number };
type FormSpot = {
  id?: string;
  regionId?: string;
  slug?: string;
  name?: string;
  description?: string | null;
  category?: string;
  address?: string | null;
  latitude?: number;
  longitude?: number;
  isPublished?: boolean;
  openingHours?: unknown;
  priceInfo?: unknown;
  instagramUrl?: string | null;
  xUrl?: string | null;
  officialUrl?: string | null;
  images?: FormImage[];
};

function jsonText(value: unknown) {
  return value == null ? "" : typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

export function SpotForm({ initial = {}, language = "ja" }: { initial?: FormSpot; language?: string }) {
  const t = getMessages(language);
  const labelsByLanguage = {
    ja: { region: "地域ID", slug: "スラッグ", name: "名称", category: "カテゴリー", address: "住所", latitude: "緯度", longitude: "経度", description: "説明", hours: "営業時間（JSONまたは文字列）", price: "料金目安（JSON）", image: "画像パスまたはURL", alt: "画像の説明", instagram: "公式Instagram URL", x: "公式X URL", official: "公式サイトURL", addImage: "画像を追加", remove: "削除" },
    en: { region: "Region ID", slug: "Slug", name: "Name", category: "Category", address: "Address", latitude: "Latitude", longitude: "Longitude", description: "Description", hours: "Opening hours (JSON or text)", price: "Price guide (JSON)", image: "Image URL", alt: "Image alt text", instagram: "Official Instagram URL", x: "Official X URL", official: "Official website URL", addImage: "Add image", remove: "Remove" },
    zh: { region: "地区ID", slug: "标识名", name: "名称", category: "类别", address: "地址", latitude: "纬度", longitude: "经度", description: "说明", hours: "营业时间（JSON或文本）", price: "价格参考（JSON）", image: "图片URL", alt: "图片替代文本", instagram: "官方Instagram URL", x: "官方X URL", official: "官方网站URL", addImage: "添加图片", remove: "删除" },
    ko: { region: "지역 ID", slug: "슬러그", name: "이름", category: "카테고리", address: "주소", latitude: "위도", longitude: "경도", description: "설명", hours: "영업시간（JSON 또는 텍스트）", price: "요금 안내（JSON）", image: "이미지 URL", alt: "이미지 대체 텍스트", instagram: "공식 Instagram URL", x: "공식 X URL", official: "공식 웹사이트 URL", addImage: "이미지 추가", remove: "삭제" },
  } as const;
  const labels = labelsByLanguage[language as keyof typeof labelsByLanguage] ?? labelsByLanguage.ja;
  const [form, setForm] = useState({
    regionId: initial.regionId ?? "",
    slug: initial.slug ?? "",
    name: initial.name ?? "",
    description: initial.description ?? "",
    category: initial.category ?? "",
    address: initial.address ?? "",
    latitude: String(initial.latitude ?? 35.0116),
    longitude: String(initial.longitude ?? 135.7681),
    openingHours: jsonText(initial.openingHours),
    priceInfo: jsonText(initial.priceInfo),
    instagramUrl: initial.instagramUrl ?? "",
    xUrl: initial.xUrl ?? "",
    officialUrl: initial.officialUrl ?? "",
    isPublished: initial.isPublished ?? false,
  });
  const [images, setImages] = useState<FormImage[]>(initial.images?.map((image) => ({ url: image.url, altText: image.altText ?? "" })) ?? []);
  const [message, setMessage] = useState("");

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    const parseOptionalJson = (value: string) => {
      if (!value.trim()) return undefined;
      try { return JSON.parse(value); } catch { return value; }
    };
    const response = await fetch(initial.id ? `/api/admin/spots/${initial.id}` : "/api/admin/spots", {
      method: initial.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        openingHours: parseOptionalJson(form.openingHours),
        priceInfo: parseOptionalJson(form.priceInfo),
        images: images.filter((image) => image.url.trim()).map((image, index) => ({ ...image, sortOrder: index })),
      }),
    });
    const result = await response.json().catch(() => ({}));
    setMessage(response.ok ? t.saved : result.error ?? t.saveFailed);
  }

  return (
    <form onSubmit={submit} className="grid max-w-3xl gap-5 rounded-2xl border bg-white p-6">
      {([
        ["regionId", labels.region], ["slug", labels.slug], ["name", labels.name], ["category", labels.category],
        ["address", labels.address], ["latitude", labels.latitude], ["longitude", labels.longitude],
        ["instagramUrl", labels.instagram], ["xUrl", labels.x], ["officialUrl", labels.official],
      ] as const).map(([key, label]) => (
        <label className="grid gap-1 text-sm" key={key}>{label}
          <input className="rounded-lg border px-3 py-2" value={form[key]} onChange={(event) => update(key, event.target.value)} required={["regionId", "slug", "name", "category", "latitude", "longitude"].includes(key)} />
        </label>
      ))}
      <label className="grid gap-1 text-sm">{labels.description}<textarea className="min-h-28 rounded-lg border px-3 py-2" value={form.description} onChange={(event) => update("description", event.target.value)} /></label>
      <label className="grid gap-1 text-sm">{labels.hours}<textarea className="min-h-24 rounded-lg border px-3 py-2 font-mono text-xs" value={form.openingHours} onChange={(event) => update("openingHours", event.target.value)} placeholder='{"weekday":"9:00-17:00"}' /></label>
      <label className="grid gap-1 text-sm">{labels.price}<textarea className="min-h-24 rounded-lg border px-3 py-2 font-mono text-xs" value={form.priceInfo} onChange={(event) => update("priceInfo", event.target.value)} placeholder='{"ja":"無料","en":"Free"}' /></label>
      <fieldset className="grid gap-3 rounded-xl border p-4">
        <legend className="px-1 text-sm font-semibold">{labels.image}</legend>
        {images.map((image, index) => <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" key={`${index}-${image.url}`}>
          <input className="rounded-lg border px-3 py-2 text-sm" value={image.url} onChange={(event) => setImages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} placeholder="/images/spots/example.jpg または https://..." />
          <input className="rounded-lg border px-3 py-2 text-sm" value={image.altText ?? ""} onChange={(event) => setImages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, altText: event.target.value } : item))} placeholder={labels.alt} />
          <button type="button" className="rounded-lg border px-3 py-2 text-sm" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))}>{labels.remove}</button>
        </div>)}
        <button type="button" className="w-fit rounded-lg border px-3 py-2 text-sm" onClick={() => setImages((current) => [...current, { url: "", altText: "" }])}>{labels.addImage}</button>
      </fieldset>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isPublished} onChange={(event) => update("isPublished", event.target.checked)} />{t.publish}</label>
      <button className="rounded-full bg-vermilion px-5 py-3 font-semibold text-white" type="submit">{t.save}</button>
      {message && <p role="status" className="text-sm text-ink/70">{message}</p>}
    </form>
  );
}
