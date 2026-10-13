import { RoutePlanner } from "@/components/route-planner";
import { listPublishedSpots } from "@/services/spot-service";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getLocalizedSpotName, getMessages } from "@/lib/i18n";
import Link from "next/link";
import { MapSearchHistory } from "@/components/map-search-history";
import { AccountNav } from "@/components/account-nav";

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<{ spot?: string; language?: string; q?: string }>;
}) {
  const { spot: selectedSpotId, language = "ja", q = "" } = await searchParams;
  const t = getMessages(language);
  const { spots } = await listPublishedSpots({ pageSize: 100, language, query: q });
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-vermilion">EXPLORE KYOTO</p><h1 className="mt-2 font-serif text-4xl text-ink">{t.mapTitle}</h1></div><div className="flex items-center gap-3"><LanguageSwitcher language={language} /><Link href={`/spots?language=${language}`} className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink">{t.explore}</Link><AccountNav language={language} callbackUrl={`/map${q ? `?q=${encodeURIComponent(q)}` : ""}`} /></div></div>
      <form className="flex max-w-2xl gap-3" action="/map">
        <input name="q" defaultValue={q} placeholder={t.searchPlaceholder} className="min-w-0 flex-1 rounded-full border border-ink/15 bg-white px-5 py-3 text-sm outline-none focus:border-vermilion" />
        <input type="hidden" name="language" value={language} />
        <button className="rounded-full bg-vermilion px-6 py-3 text-sm font-semibold text-white" type="submit">{t.search}</button>
      </form>
      <RoutePlanner selectedSpotId={selectedSpotId ?? (q && spots.length === 1 ? spots[0].id : undefined)} language={language} spots={spots.map((spot) => ({ id: spot.id, slug: spot.slug, latitude: Number(spot.latitude), longitude: Number(spot.longitude), title: getLocalizedSpotName(spot.slug, spot.translations[0]?.name ?? spot.name, language), address: spot.address, officialUrl: spot.officialUrl, category: spot.category, openingHours: spot.openingHours, statusOverride: spot.statusOverride }))} />
      <MapSearchHistory query={q} language={language} />
      {q && (
        <section>
          <h2 className="mb-4 font-serif text-3xl text-ink">「{q}」{t.searchResults}</h2>
          {spots.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {spots.map((spot) => (
                <article key={spot.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                  <div className="photo-placeholder flex h-40 items-end p-5">
                    <span className="rounded-full bg-sand/85 px-3 py-1 text-xs text-ink">{spot.category}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-2xl text-ink">{getLocalizedSpotName(spot.slug, spot.translations[0]?.name ?? spot.name, language)}</h3>
                    <p className="mt-3 text-sm leading-6 text-ink/60">{spot.translations[0]?.description ?? t.defaultDescription}</p>
                    <p className="mt-3 text-xs text-ink/50">{spot.address}</p>
                    <Link href={`/map?spot=${spot.id}&q=${encodeURIComponent(q)}&language=${encodeURIComponent(language)}`} className="mt-5 inline-block text-sm font-semibold text-vermilion">{t.viewOnMap}</Link>
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="rounded-2xl border border-dashed border-ink/20 p-8 text-center text-ink/60">{t.noResults}</p>}
        </section>
      )}
    </main>
  );
}
