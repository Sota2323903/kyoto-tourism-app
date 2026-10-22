import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getUserFavorites } from "@/services/favorite-service";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getLocalizedSpotName, getMessages } from "@/lib/i18n";

export default async function FavoritesPage({ searchParams }: { searchParams: Promise<{ language?: string }> }) {
  const session = await getServerSession(authOptions);
  const language = (await searchParams).language ?? "ja";
  const t = getMessages(language);
  if (!session?.user?.id) redirect(`/auth/signin?language=${language}&callbackUrl=%2Ffavorites`);
  const favorites = await getUserFavorites(session.user.id, language);
  return (
    <main className="min-h-screen bg-sand px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="font-serif text-xl font-semibold text-ink">{t.appName}</Link>
          <div className="flex gap-3"><LanguageSwitcher language={language} /><Link href={`/spots?language=${language}`} className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink">{t.explore}</Link></div>
        </header>
        <h1 className="mt-16 font-serif text-5xl text-ink">{t.favorites}</h1>
        {favorites.length ? (
          <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map(({ spot }) => (
              <article key={spot.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                <div className="relative h-40">
                  {spot.images[0] ? (
                    <Image
                      src={spot.images[0].url}
                      alt={spot.images[0].altText ?? getLocalizedSpotName(spot.slug, spot.name, language)}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : <div className="photo-placeholder h-full" />}
                </div>
                <div className="p-5">
                  <h2 className="font-serif text-2xl text-ink"><Link href={`/spots/${spot.slug}?language=${language}`}>{getLocalizedSpotName(spot.slug, spot.translations[0]?.name ?? spot.name, language)}</Link></h2>
                  <p className="mt-3 text-sm leading-6 text-ink/60">{spot.translations[0]?.description ?? t.defaultDescription}</p>
                  <p className="mt-3 text-xs text-ink/50">{spot.address}</p>
                  <Link href={`/spots/${spot.slug}?language=${encodeURIComponent(language)}`} className="mt-5 inline-block text-sm font-semibold text-vermilion">{t.details} →</Link>
                </div>
              </article>
            ))}
          </section>
        ) : <p className="mt-10 rounded-2xl border border-dashed border-ink/20 p-8 text-center text-ink/60">{t.noFavorites}</p>}
      </div>
    </main>
  );
}
