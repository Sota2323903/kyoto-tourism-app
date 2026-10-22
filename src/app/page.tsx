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

const howToUse = {
  ja: {
    eyebrow: "はじめての方へ",
    title: "4ステップで、京都の旅を組み立てよう。",
    intro: "気になる場所を探して、地図で距離を確認。詳細を見ながらお気に入りを集め、最後に移動ルートを作れます。",
    steps: [
      { number: "01", title: "行きたい場所を探す", text: "「スポットを探す」から、寺社・食事・文化施設などのカテゴリやキーワードで検索します。", action: "スポットを探す", href: "/spots" },
      { number: "02", title: "地図で位置関係を見る", text: "「地図を見る」では、スポットの場所と混雑の目安を確認できます。現在地から近い場所を探すこともできます。", action: "地図を見る", href: "/map" },
      { number: "03", title: "詳細を確認して保存する", text: "スポットを開くと、住所・営業時間・料金・公式サイトを確認できます。気になる場所はお気に入りに保存できます。", action: "お気に入りを見る", href: "/favorites" },
      { number: "04", title: "ルートを作って出発する", text: "地図で目的地を選び、現在地と移動方法を指定すると、京都観光のルートを表示できます。", action: "ルートを作る", href: "/map" },
    ],
  },
  en: {
    eyebrow: "GETTING STARTED",
    title: "Build your Kyoto day in four steps.",
    intro: "Find places, check their positions on the map, save your favorites, and create a route for the day.",
    steps: [
      { number: "01", title: "Find places to visit", text: "Use Explore spots to search by category or keyword, from temples and food to culture and nature.", action: "Explore spots", href: "/spots" },
      { number: "02", title: "See them on the map", text: "Open the map to check locations, congestion estimates, and places near your current location.", action: "View the map", href: "/map" },
      { number: "03", title: "Review and save", text: "Open a spot for its address, hours, price, and official site. Save places you want to remember.", action: "View favorites", href: "/favorites" },
      { number: "04", title: "Plan your route", text: "Choose destinations, your starting location, and a travel mode to display a sightseeing route.", action: "Plan a route", href: "/map" },
    ],
  },
  zh: {
    eyebrow: "使用指南",
    title: "四步规划你的京都之旅。",
    intro: "搜索景点，在地图上确认位置，收藏想去的地方，最后制作当天的路线。",
    steps: [
      { number: "01", title: "寻找想去的地方", text: "在“探索景点”中按类别或关键词搜索寺社、美食、文化和自然景点。", action: "探索景点", href: "/spots" },
      { number: "02", title: "在地图上确认位置", text: "打开地图查看景点位置、拥挤程度参考，以及当前位置附近的景点。", action: "查看地图", href: "/map" },
      { number: "03", title: "查看详情并收藏", text: "打开景点详情，查看地址、营业时间、费用和官方网站，并收藏想去的地方。", action: "查看收藏", href: "/favorites" },
      { number: "04", title: "制作出行路线", text: "选择目的地、出发位置和交通方式，即可显示京都观光路线。", action: "制作路线", href: "/map" },
    ],
  },
  ko: {
    eyebrow: "사용 방법",
    title: "네 단계로 교토 여행을 만들어 보세요.",
    intro: "가고 싶은 장소를 찾고, 지도에서 위치를 확인한 뒤, 즐겨찾기와 이동 경로를 만들어 보세요.",
    steps: [
      { number: "01", title: "가고 싶은 장소 찾기", text: "명소 찾기에서 사찰, 음식, 문화, 자연 등의 카테고리나 키워드로 검색합니다.", action: "명소 찾기", href: "/spots" },
      { number: "02", title: "지도에서 위치 확인", text: "지도에서 장소 위치와 혼잡도 참고 정보를 확인하고 현재 위치 주변도 찾아볼 수 있습니다.", action: "지도 보기", href: "/map" },
      { number: "03", title: "상세 정보와 저장", text: "주소, 영업시간, 요금, 공식 사이트를 확인하고 가고 싶은 장소를 즐겨찾기에 저장합니다.", action: "즐겨찾기 보기", href: "/favorites" },
      { number: "04", title: "이동 경로 만들기", text: "목적지와 출발 위치, 이동 방법을 선택하면 교토 관광 경로를 표시할 수 있습니다.", action: "경로 만들기", href: "/map" },
    ],
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
  const guide = howToUse[language as keyof typeof howToUse] ?? howToUse.ja;
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
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-vermilion">{guide.eyebrow}</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-ink sm:text-5xl">{guide.title}</h2>
            <p className="mt-6 max-w-lg text-sm leading-7 text-ink/60">{guide.intro}</p>
          </div>
          <div className="mt-14 grid gap-4 border-t border-ink/15 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {guide.steps.map((step) => (
              <article key={step.number} className="flex flex-col rounded-2xl border border-ink/10 bg-white/40 p-6">
                <p className="text-sm font-semibold text-vermilion">{step.number}</p>
                <h3 className="mt-5 font-serif text-2xl text-ink">{step.title}</h3>
                <p className="mt-4 flex-1 text-sm leading-7 text-ink/60">{step.text}</p>
                <Link href={`${step.href}?language=${language}`} className="mt-6 text-sm font-semibold text-vermilion transition-transform hover:translate-x-1">
                  {step.action} <span aria-hidden="true">→</span>
                </Link>
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
