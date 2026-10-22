import Link from "next/link";
import Image from "next/image";

import { listPublishedCategories, listPublishedSpots } from "@/services/spot-service";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getLocalizedCategory, getLocalizedSpotName, getMessages } from "@/lib/i18n";
import { NearbySpots } from "@/components/nearby-spots";
import { MapSearchHistory } from "@/components/map-search-history";
import { SpotMapLoader } from "@/components/map/SpotMapLoader";
import { AccountNav } from "@/components/account-nav";

export default async function SpotsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; popularity?: "LOCAL_FAVORITE" | "MAJOR"; language?: string }>;
}) {
  const params = await searchParams;
  const t = getMessages(params.language);
  const [result, categories] = await Promise.all([
    listPublishedSpots({
      query: params.q,
      category: params.category,
      popularity: params.popularity,
      language: params.language ?? "ja",
      pageSize: 50,
    }),
    listPublishedCategories(),
  ]);
  const groupedSpots = categories
    .map((category) => ({
      category,
      spots: result.spots.filter((spot) => spot.category === category),
    }))
    .filter((group) => group.spots.length > 0);

  return (
    <main className="min-h-screen bg-sand px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-semibold text-ink">{t.appName}</Link>
          <div className="flex gap-3">
            <LanguageSwitcher language={params.language ?? "ja"} />
            <Link href={`/map?language=${params.language ?? "ja"}`} className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink">{t.map}</Link>
            <AccountNav language={params.language ?? "ja"} callbackUrl={`/spots${params.q ? `?q=${encodeURIComponent(params.q)}` : ""}`} />
            <Link href={`/?language=${params.language ?? "ja"}`} className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink">{t.home}</Link>
          </div>
        </header>
        <section className="mt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-vermilion">{t.discoverEyebrow}</p>
          <h1 className="mt-3 font-serif text-5xl text-ink">{t.searchTitle}</h1>
          <form className="mt-8 flex max-w-3xl flex-wrap gap-3" action="/spots">
            <input name="q" defaultValue={params.q} placeholder={t.searchPlaceholder} className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-5 py-3 text-sm outline-none focus:border-vermilion" />
            <input type="hidden" name="language" value={params.language ?? "ja"} />
            <select name="category" defaultValue={params.category ?? ""} className="rounded-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none">
              <option value="">{t.allCategories}</option>
              {categories.map((category) => <option key={category} value={category}>{getLocalizedCategory(category, params.language)}</option>)}
            </select>
            <select name="popularity" defaultValue={params.popularity ?? ""} className="rounded-full border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none">
              <option value="">{t.allPopularity}</option>
              <option value="LOCAL_FAVORITE">{t.localFavorite}</option>
              <option value="MAJOR">{t.majorSpot}</option>
            </select>
            <button className="rounded-full bg-vermilion px-6 py-3 text-sm font-semibold text-white" type="submit">{t.search}</button>
          </form>
        </section>
        <MapSearchHistory query={params.q ?? ""} language={params.language ?? "ja"} basePath="/spots" />
        <section className="mt-10">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-vermilion">{t.mapLabel}</p>
            <h2 className="mt-2 font-serif text-3xl text-ink">{params.q ? `「${params.q}」${t.mapLabel}` : t.mapTitle}</h2>
          </div>
          <SpotMapLoader language={params.language ?? "ja"}
            selectedSpotId={result.spots.length === 1 ? result.spots[0].id : undefined}
            spots={result.spots.map((spot) => ({
              id: spot.id,
              slug: spot.slug,
              latitude: Number(spot.latitude),
              longitude: Number(spot.longitude),
              title: getLocalizedSpotName(spot.slug, spot.translations[0]?.name ?? spot.name, params.language),
              address: spot.address,
              officialUrl: spot.officialUrl,
            }))}
          />
        </section>
        <section className="mt-12 space-y-12">
          {groupedSpots.map((group) => <div key={group.category}>
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl text-ink">{getLocalizedCategory(group.category, params.language)}</h2>
              <span className="text-sm text-ink/50">{group.spots.length}</span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.spots.map((spot) => (
            <article key={spot.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
              <div className="relative h-40">
                {spot.images[0] ? (
                  <Image
                    src={spot.images[0].url}
                    alt={spot.images[0].altText ?? getLocalizedSpotName(spot.slug, spot.name, params.language)}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : <div className="photo-placeholder h-full" />}
                <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="rounded-full bg-sand/85 px-3 py-1 text-xs text-ink">{getLocalizedCategory(spot.category, params.language)}{spot.category === "食事" && ` / ${spot.popularity === "LOCAL_FAVORITE" ? t.localFavorite : t.majorSpot}`}</span>
                </div>
              </div>
              <div className="p-5">
                <h2 className="font-serif text-2xl text-ink">
                  <Link href={`/spots/${spot.slug}?language=${encodeURIComponent(params.language ?? "ja")}`} className="hover:text-vermilion">{getLocalizedSpotName(spot.slug, spot.translations[0]?.name ?? spot.name, params.language)}</Link>
                </h2>
                <p className="mt-3 text-sm leading-6 text-ink/60">{spot.translations[0]?.description ?? t.defaultDescription}</p>
                <p className="mt-3 text-xs text-ink/50">{spot.address}</p>
                <div className="mt-5 flex flex-wrap gap-4">
                  <Link href={`/spots/${spot.slug}?language=${encodeURIComponent(params.language ?? "ja")}`} className="text-sm font-semibold text-vermilion">{t.details} →</Link>
                  {spot.officialUrl && <a href={spot.officialUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-vermilion">{t.officialSite}</a>}
                  <Link href={`/map?spot=${spot.id}&language=${encodeURIComponent(params.language ?? "ja")}`} className="text-sm font-semibold text-ink/60">{t.viewOnMap}</Link>
                </div>
              </div>
            </article>
            ))}
            </div>
          </div>)}
        </section>
        <NearbySpots language={params.language ?? "ja"} />
        {result.spots.length === 0 && <p className="mt-12 rounded-2xl border border-dashed border-ink/20 p-8 text-center text-ink/60">{t.noResults}</p>}
      </div>
    </main>
  );
}
