import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getMessages } from "@/lib/i18n";

export default async function AdminSpotsPage({ searchParams }: { searchParams: Promise<{ language?: string }> }) {
  const { language = "ja" } = await searchParams;
  const t = getMessages(language);
  const session = await getServerSession(authOptions);
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user.role ?? "")) {
    redirect("/auth/signin?callbackUrl=%2Fadmin%2Fspots");
  }
  const spots = await prisma.spot.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, category: true, address: true, isPublished: true, updatedAt: true },
  });
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm text-vermilion">ADMIN</p><h1 className="mt-2 font-serif text-4xl text-ink">{t.admin}</h1></div>
        <div className="flex gap-3"><LanguageSwitcher language={language} /><Link href="/api/admin/spots/export" className="rounded-full border px-4 py-2 text-sm">{t.export}</Link><Link href={`/admin/spots/new?language=${language}`} className="rounded-full bg-vermilion px-4 py-2 text-sm text-white">{t.add}</Link></div>
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-white"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">{t.name}</th><th className="p-4">{t.category}</th><th className="p-4">{t.address}</th><th className="p-4">{t.published}</th><th className="p-4">{t.updated}</th></tr></thead><tbody>{spots.map((spot) => <tr className="border-t" key={spot.id}><td className="p-4"><Link className="font-semibold text-vermilion" href={`/admin/spots/${spot.id}?language=${language}`}>{spot.name}</Link></td><td className="p-4">{spot.category}</td><td className="p-4">{spot.address ?? "-"}</td><td className="p-4">{spot.isPublished ? t.published : t.unpublished}</td><td className="p-4">{spot.updatedAt.toLocaleDateString(language === "ja" ? "ja-JP" : language)}</td></tr>)}</tbody></table></div>
    </main>
  );
}
