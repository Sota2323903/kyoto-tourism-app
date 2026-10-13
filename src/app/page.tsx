import Link from "next/link";
import { Suspense } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getMessages } from "@/lib/i18n";
import { AccountNav } from "@/components/account-nav";

const recommendationParts = {
  ja: {
    times: ["朝の", "静かな朝に", "昼下がりの", "夕暮れの", "雨の日の", "風の心地よい", "人混みを避けた", "季節を感じる", "路地裏の", "ゆっくり楽しむ"],
    places: ["東山を歩く", "鴨川を散歩する", "寺社をめぐる", "錦市場で味わう", "嵐山を訪ねる", "北山の庭を眺める", "京町家を探す", "喫茶店で休む", "季節の景色を探す", "お気に入りを見つける"],
  },
  en: {
    times: ["A morning in", "A quiet start in", "An afternoon in", "A sunset walk in", "A rainy day in", "A breezy stroll through", "A crowd-free visit to", "A seasonal visit to", "A backstreet walk in", "A slow day in"],
    places: ["Higashiyama", "along the Kamo River", "Kyoto's temples", "Nishiki Market", "Arashiyama", "Kitayama gardens", "machiya streets", "a local café", "seasonal scenery", "your next favorite place"],
  },
  zh: {
    times: ["清晨漫步", "在安静的早晨", "午后探索", "夕阳下漫步", "雨天探索", "在微风中", "避开人潮游览", "感受季节变化", "走进小巷", "慢慢享受"],
    places: ["东山", "鸭川沿岸", "京都寺社", "锦市场", "岚山", "北山庭园", "京町屋街道", "当地咖啡馆", "四季风景", "寻找下一个心仪之处"],
  },
  ko: {
    times: ["아침의", "조용한 아침에", "오후의", "해 질 무렵", "비 오는 날의", "산들바람 속", "인파를 피해", "계절을 느끼는", "골목길의", "천천히 즐기는"],
    places: ["히가시야마", "가모강 산책", "교토의 사찰", "니시키 시장", "아라시야마", "기타야마 정원", "교마치야 거리", "현지 카페", "계절의 풍경", "다음 명소 찾기"],
  },
} as const;

function getDailyRecommendation(language: string) {
  const parts = recommendationParts[language as keyof typeof recommendationParts] ?? recommendationParts.ja;
  const day = Math.floor(Date.now() / 86_400_000);
  const index = day % 100;
  return `${parts.times[Math.floor(index / 10)]} ${parts.places[index % 10]}`;
}

export default async function Home({ searchParams }: { searchParams: Promise<{ language?: string }> }) {
  const { language = "ja" } = await searchParams;
  const t = getMessages(language);
  return (
    <main className="overflow-hidden">
      <section className="relative isolate">
        <div className="hero-grid absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-7 sm:px-10 lg:px-16 lg:pb-28">
          <header className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3" aria-label={`${t.appName} ${t.home}`}>
              <span className="font-serif text-lg font-semibold tracking-tight text-ink">
                {t.appName}
              </span>
            </Link>
            <div className="flex items-center gap-3">
            <Suspense fallback={null}><LanguageSwitcher language={language} /></Suspense>
            <nav className="hidden items-center gap-8 text-sm text-ink/70 sm:flex" aria-label={t.mainNav}>
              <Link className="transition-colors hover:text-ink" href={`/spots?language=${language}`}>{t.explore}</Link>
              <Link className="transition-colors hover:text-ink" href={`/map?language=${language}`}>{t.map}</Link>
              <a className="rounded-full border border-ink/15 px-4 py-2 transition-colors hover:bg-white/70" href="#about">
                {t.about}
              </a>
              <AccountNav language={language} />
            </nav>
            </div>
            <div className="flex items-center gap-2 sm:hidden">
              <AccountNav language={language} />
              <Link className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink" href={`/spots?language=${language}`}>
                {t.explore}
              </Link>
            </div>
          </header>

          <div className="grid items-end gap-14 pt-24 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:pt-32">
            <div>
              <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-vermilion">
                <span className="h-px w-8 bg-vermilion" />
                {t.heroKicker}
              </p>
              <h1 className="max-w-3xl font-serif text-5xl leading-[1.08] tracking-tight text-ink sm:text-7xl">
                {t.heroTitleLine1}
                <br />
                <em className="text-vermilion">{t.heroTitleLine2}</em>
              </h1>
              <p className="mt-8 max-w-lg text-base leading-8 text-ink/65 sm:text-lg">
                {t.heroText}
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href={`/spots?language=${language}`} className="rounded-full bg-vermilion px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-vermilion/20 transition-transform hover:-translate-y-0.5">
                  {t.startExploring} <span aria-hidden="true">→</span>
                </Link>
                <a href="#about" className="rounded-full border border-ink/15 bg-white/40 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-white/80">
                  {t.about}
                </a>
              </div>
            </div>
            <div className="relative mx-auto w-full max-w-md lg:mb-2">
              <div className="aspect-[4/5] overflow-hidden rounded-[10rem_10rem_1.5rem_1.5rem] bg-[#d8c5a9] shadow-2xl shadow-ink/10">
                <div className="photo-placeholder flex h-full flex-col justify-end p-8">
                  <span className="mb-auto self-end rounded-full bg-sand/80 px-3 py-1 text-xs font-medium text-ink/70">KYOTO / 35.0116° N</span>
                  <div>
                    <p className="whitespace-pre-line font-serif text-3xl leading-tight text-white">{t.heroCardTitle}</p>
                    <p className="mt-3 text-xs tracking-[0.18em] text-white/75">{t.heroImageCaption}</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-6 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-xl backdrop-blur-sm sm:-left-12">
                <p className="text-xs text-ink/50">{t.recommendationLabel}</p>
                <p className="mt-1 font-serif text-lg text-ink">{getDailyRecommendation(language)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="bg-ink px-6 py-16 text-sand sm:px-10 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sand/50">{t.discoverEyebrow}</p>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl">{t.findToday}</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-sand/60">{t.exploreHint}</p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {t.categories.map((category, index) => (
              <Link key={category} href={`/spots?category=${encodeURIComponent(category)}&language=${language}`} className="group rounded-2xl border border-sand/15 p-5 transition-colors hover:border-sand/50 hover:bg-sand/10">
                <span className="text-xs text-sand/40">0{index + 1}</span>
                <span className="mt-10 block font-serif text-xl">{category}</span>
                <span className="mt-2 block text-xs text-sand/50 transition-transform group-hover:translate-x-1">{t.tryFind}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="bg-sand px-6 py-20 sm:px-10 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-vermilion">{t.aboutEyebrow}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-ink sm:text-5xl">{t.aboutTitle}</h2>
          </div>
          <div className="mt-14 grid gap-8 border-t border-ink/15 pt-8 md:grid-cols-3">
            {t.highlights.map((highlight) => (
              <article key={highlight.number}>
                <p className="text-sm font-semibold text-vermilion">{highlight.number}</p>
                <h3 className="mt-7 font-serif text-2xl text-ink">{highlight.title}</h3>
                <p className="mt-4 max-w-xs text-sm leading-7 text-ink/60">{highlight.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="flex flex-col justify-between gap-4 bg-sand px-6 pb-8 text-xs text-ink/50 sm:flex-row sm:px-10 lg:px-16">
        <span>© 2026 {t.appName}</span>
        <span>{t.footer}</span>
      </footer>
    </main>
  );
}
