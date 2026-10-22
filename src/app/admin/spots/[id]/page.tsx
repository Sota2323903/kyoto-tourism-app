import { notFound } from "next/navigation";

import { SpotForm } from "@/components/admin/SpotForm";
import { prisma } from "@/lib/prisma";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getMessages } from "@/lib/i18n";

export default async function EditSpotPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ language?: string }> }) {
  const { id } = await params;
  const { language = "ja" } = await searchParams;
  const t = getMessages(language);
  const spot = await prisma.spot.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  if (!spot) notFound();
  return <main className="mx-auto max-w-7xl space-y-6 px-6 py-12"><div className="flex justify-between"><h1 className="font-serif text-4xl text-ink">{t.editSpot}</h1><LanguageSwitcher language={language} /></div><SpotForm language={language} initial={{ ...spot, latitude: Number(spot.latitude), longitude: Number(spot.longitude), images: spot.images }} /></main>;
}
