import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getPublishedSpotBySlug } from "@/services/spot-service";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getMessages } from "@/lib/i18n";
import { FavoriteButton } from "@/components/favorite-button";
import { AccountNav } from "@/components/account-nav";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isFavorite } from "@/services/favorite-service";

export default async function SpotDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ language?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const spot = await getPublishedSpotBySlug(slug, query.language ?? "ja");
  const t = getMessages(query.language);
  if (!spot) notFound();
  const session = await getServerSession(authOptions);
  const favorite = session?.user?.id ? await isFavorite(session.user.id, spot.id) : false;

  const translation = spot.translations[0];
  const categoryName = spot.categoryRef?.translations[0]?.name ?? spot.category;
  return (
    <main className="min-h-screen bg-sand px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-semibold text-ink">{t.appName}</Link>
          <div className="flex gap-3">
            <LanguageSwitcher language={query.language ?? "ja"} />
            <Link href={`/spots?language=${query.language ?? "ja"}`} className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink">{t.back}</Link>
            <AccountNav language={query.language ?? "ja"} callbackUrl={`/spots/${slug}?language=${query.language ?? "ja"}`} />
            <Link href={`/map?spot=${spot.id}&language=${encodeURIComponent(query.language ?? "ja")}`} className="rounded-full bg-vermilion px-4 py-2 text-sm text-white">{t.map}</Link>
          </div>
        </header>
        <section className="mt-12 overflow-hidden rounded-3xl border border-ink/10 bg-white">
          {spot.images[0] ? (
            <div className="relative flex min-h-64 items-end p-8 sm:min-h-80">
              <Image src={spot.images[0].url} alt={spot.images[0].altText ?? translation?.name ?? spot.name} fill unoptimized className="object-cover" />
              <div className="absolute inset-0 bg-ink/45" />
              <div className="relative">
                <span className="rounded-full bg-sand/85 px-3 py-1 text-xs text-ink">{categoryName}</span>
                <h1 className="mt-4 font-serif text-5xl text-white">{translation?.name ?? spot.name}</h1>
              </div>
            </div>
          ) : (
          <div className="photo-placeholder flex min-h-64 items-end p-8 sm:min-h-80">
            <div>
              <span className="rounded-full bg-sand/85 px-3 py-1 text-xs text-ink">{categoryName}</span>
              <h1 className="mt-4 font-serif text-5xl text-white">{translation?.name ?? spot.name}</h1>
            </div>
          </div>
          )}
          <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_280px]">
            <div>
              <p className="text-base leading-8 text-ink/70">{translation?.description ?? t.defaultDescription}</p>
              {spot.address && <div className="mt-8 border-t border-ink/10 pt-5"><p className="text-xs text-ink/45">{t.address}</p><p className="mt-2 text-sm text-ink">{spot.address}</p></div>}
            </div>
            <aside className="space-y-4 rounded-2xl bg-sand p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{t.information}</p>
              <p className="text-sm text-ink">{t.region}: {spot.region.name}</p>
              <p className="text-sm text-ink">{t.latitude}: {Number(spot.latitude).toFixed(5)}</p>
              <p className="text-sm text-ink">{t.longitude}: {Number(spot.longitude).toFixed(5)}</p>
              {spot.openingHours && <p className="text-sm text-ink">{t.hours}: {String(spot.openingHours)}</p>}
              {spot.priceInfo && <p className="text-sm text-ink">{t.price}: {String(spot.priceInfo)}</p>}
              <div className="flex flex-wrap gap-3 pt-2">
                <FavoriteButton spotId={spot.id} initialFavorite={favorite} language={query.language} />
                {spot.officialUrl && <a className="rounded-full bg-vermilion px-4 py-2 text-sm font-semibold text-white" href={spot.officialUrl} target="_blank" rel="noreferrer">{t.official}</a>}
                {spot.instagramUrl && <a className="text-sm font-semibold text-vermilion" href={spot.instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a>}
                {spot.xUrl && <a className="text-sm font-semibold text-vermilion" href={spot.xUrl} target="_blank" rel="noreferrer">X ↗</a>}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
