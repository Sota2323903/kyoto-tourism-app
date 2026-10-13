/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("KyotoCompass-local-2026!", 12);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "SUPER_ADMIN", passwordHash },
    create: { email: "admin@example.com", name: "Local Admin", role: "SUPER_ADMIN", passwordHash },
  });
  const region = await prisma.region.upsert({
    where: { slug: "kyoto" },
    update: {},
    create: { slug: "kyoto", name: "Kyoto" },
  });
  const categories = [
    ["temples", [["ja", "寺社・史跡"], ["en", "Temples & Heritage"], ["zh", "寺庙与历史遗迹"], ["ko", "사찰・역사 유적"]]],
    ["food", [["ja", "食べる"], ["en", "Food & Drink"], ["zh", "美食"], ["ko", "맛집"]]],
    ["culture", [["ja", "文化施設"], ["en", "Culture"], ["zh", "文化设施"], ["ko", "문화 시설"]]],
  ];
  for (const [slug, translations] of categories) {
    const category = await prisma.category.upsert({ where: { slug }, update: {}, create: { slug } });
    for (const [language, name] of translations) {
      await prisma.categoryTranslation.upsert({
        where: { categoryId_language: { categoryId: category.id, language } },
        update: { name },
        create: { categoryId: category.id, language, name },
      });
    }
  }
  const templeCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "temples" } });
  const spots = [
    { slug: "kinkakuji", name: "金閣寺", description: "京都を代表する美しい寺院。", officialUrl: "https://www.shokoku-ji.jp/kinkakuji/", latitude: 35.0394, longitude: 135.7292, address: "京都市北区金閣寺町1" },
    { slug: "fushimi-inari", name: "伏見稲荷大社", description: "千本鳥居で知られる神社。", officialUrl: "https://inari.jp/", latitude: 34.9671, longitude: 135.7727, address: "京都市伏見区深草藪之内町68" },
    { slug: "kiyomizu-dera", name: "清水寺", description: "清水の舞台で知られる京都を代表する寺院。", officialUrl: "https://www.kiyomizudera.or.jp/", latitude: 34.9949, longitude: 135.7850, address: "京都市東山区清水1丁目294" },
    { slug: "ginkakuji", name: "銀閣寺", description: "東山文化を代表する風雅な寺院。", officialUrl: "https://www.shokoku-ji.jp/ginkakuji/", category: "寺社・史跡", latitude: 35.0268, longitude: 135.7982, address: "京都市左京区銀閣寺町2" },
    { slug: "yasaka-shrine", name: "八坂神社", description: "祇園の中心にある歴史ある神社。", officialUrl: "https://www.yasaka-jinja.or.jp/", category: "寺社・史跡", latitude: 35.0037, longitude: 135.7788, address: "京都市東山区祇園町北側625" },
    { slug: "heian-jingu", name: "平安神宮", description: "朱色の大鳥居と広い神苑で知られる神社。", officialUrl: "https://www.heianjingu.or.jp/", category: "寺社・史跡", latitude: 35.0161, longitude: 135.7820, address: "京都市左京区岡崎西天王町97" },
    { slug: "nijo-castle", name: "二条城", description: "江戸時代の歴史を伝える世界遺産。", officialUrl: "https://nijo-jocastle.city.kyoto.lg.jp/", category: "寺社・史跡", latitude: 35.0142, longitude: 135.7481, address: "京都市中京区二条城町541" },
    { slug: "kyoto-imperial-palace", name: "京都御所", description: "京都の歴史と自然を感じられる宮殿跡。", officialUrl: "https://sankan.kunaicho.go.jp/guide/kyoto.html", category: "寺社・史跡", latitude: 35.0254, longitude: 135.7621, address: "京都市上京区京都御苑3" },
    { slug: "tofukuji", name: "東福寺", description: "紅葉の名所として知られる禅寺。", officialUrl: "https://tofukuji.jp/", category: "寺社・史跡", latitude: 34.9766, longitude: 135.7730, address: "京都市東山区本町15丁目778" },
    { slug: "sanjusangen-do", name: "三十三間堂", description: "千体の観音像で知られる寺院。", officialUrl: "https://sanjusangendo.jp/", category: "寺社・史跡", latitude: 34.9871, longitude: 135.7717, address: "京都市東山区三十三間堂廻り町657" },
    { slug: "arashiyama-bamboo-grove", name: "嵐山竹林", description: "京都を代表する美しい竹林の道。", officialUrl: "https://ja.kyoto.travel/tourism/article/arashiyama/", category: "自然・公園", latitude: 35.0170, longitude: 135.6713, address: "京都市右京区嵯峨小倉山田淵山町" },
    { slug: "togetsukyo-bridge", name: "渡月橋", description: "嵐山を象徴する桂川の名橋。", officialUrl: "https://ja.kyoto.travel/tourism/article/arashiyama/", category: "自然・公園", latitude: 35.0095, longitude: 135.6778, address: "京都市右京区嵯峨中ノ島町" },
    { slug: "ryoanji", name: "龍安寺", description: "石庭で世界的に知られる禅寺。", officialUrl: "https://www.ryoanji.jp/", category: "寺社・史跡", latitude: 35.0346, longitude: 135.7183, address: "京都市右京区龍安寺御陵下町13" },
    { slug: "nishiki-market", name: "錦市場", description: "京の食文化を楽しめる商店街。", officialUrl: "https://www.kyoto-nishiki.or.jp/", category: "食べる", latitude: 35.0050, longitude: 135.7648, address: "京都市中京区錦小路通" },
    { slug: "kyoto-station", name: "京都駅", description: "新幹線や各線が集まる京都の玄関口。", officialUrl: "https://www.kyoto-station-building.co.jp/", category: "駅", latitude: 34.9858, longitude: 135.7588, address: "京都市下京区東塩小路町901" },
    { slug: "gion-shijo-station", name: "祇園四条駅", description: "祇園や八坂神社に便利な駅。", officialUrl: "https://www.keihan.co.jp/traffic/station/011.html", category: "駅", latitude: 35.0035, longitude: 135.7724, address: "京都市東山区四条大橋東詰" },
    { slug: "sanjosaka-station", name: "三条京阪駅", description: "東山や岡崎方面への乗換駅。", officialUrl: "https://www.keihan.co.jp/traffic/station/010.html", category: "駅", latitude: 35.0094, longitude: 135.7726, address: "京都市東山区大橋町" },
    { slug: "kyoto-kawaramachi-station", name: "京都河原町駅", description: "四条河原町の中心にある便利な駅。", officialUrl: "https://www.hankyu.co.jp/station/karasuma.html", category: "駅", latitude: 35.0033, longitude: 135.7681, address: "京都市下京区四条通河原町西入真町52" },
    { slug: "karasuma-station", name: "烏丸駅", description: "四条烏丸エリアの中心駅。", officialUrl: "https://www.hankyu.co.jp/station/karasuma.html", category: "駅", latitude: 35.0039, longitude: 135.7595, address: "京都市下京区四条通" },
    { slug: "inari-station", name: "稲荷駅", description: "伏見稲荷大社の最寄り駅。", officialUrl: "https://www.jr-odekake.net/eki/top?id=0610703", category: "駅", latitude: 34.9671, longitude: 135.7707, address: "京都市伏見区深草稲荷御前町" },
    { slug: "saga-arashiyama-station", name: "嵯峨嵐山駅", description: "嵐山観光に便利な駅。", officialUrl: "https://www.jr-odekake.net/eki/top?id=0610705", category: "駅", latitude: 35.0182, longitude: 135.6811, address: "京都市右京区嵯峨天龍寺車道町" },
    { slug: "kyoto-aquarium", name: "京都水族館", description: "京都の川や海の生き物に出会える水族館。", officialUrl: "https://www.kyoto-aquarium.com/", category: "文化施設", latitude: 34.9874, longitude: 135.7483, address: "京都市下京区観喜寺町35-1" },
    { slug: "kyoto-tower", name: "京都タワー", description: "京都駅前から街を一望できる展望塔。", officialUrl: "https://www.keihanhotels-resorts.co.jp/kyoto-tower/", category: "文化施設", latitude: 34.9875, longitude: 135.7590, address: "京都市下京区烏丸通七条下る東塩小路町721-1" },
  ];
  const englishNames = {
    kinkakuji: "Kinkaku-ji", "fushimi-inari": "Fushimi Inari Taisha", "kiyomizu-dera": "Kiyomizu-dera",
    ginkakuji: "Ginkaku-ji", "yasaka-shrine": "Yasaka Shrine", "heian-jingu": "Heian Shrine",
    "nijo-castle": "Nijo Castle", "kyoto-imperial-palace": "Kyoto Imperial Palace", tofukuji: "Tofuku-ji",
    "sanjusangen-do": "Sanjusangen-do", "arashiyama-bamboo-grove": "Arashiyama Bamboo Grove",
    "togetsukyo-bridge": "Togetsukyo Bridge", ryoanji: "Ryoan-ji", "nishiki-market": "Nishiki Market",
    "kyoto-station": "Kyoto Station", "gion-shijo-station": "Gion-Shijo Station", "sanjosaka-station": "Sanjo Keihan Station",
    "kyoto-kawaramachi-station": "Kyoto-Kawaramachi Station", "karasuma-station": "Karasuma Station",
    "inari-station": "Inari Station", "saga-arashiyama-station": "Saga-Arashiyama Station",
    "kyoto-aquarium": "Kyoto Aquarium", "kyoto-tower": "Kyoto Tower",
  };
  for (const spot of spots) {
    const saved = await prisma.spot.upsert({
      where: { regionId_slug: { regionId: region.id, slug: spot.slug } },
      update: { ...spot, categoryId: spot.category === "寺社・史跡" ? templeCategory.id : null, isPublished: true },
      create: { ...spot, category: spot.category ?? "寺社・史跡", categoryId: spot.category === "寺社・史跡" || !spot.category ? templeCategory.id : null, regionId: region.id, isPublished: true },
    });
    await prisma.spotTranslation.upsert({
      where: { spotId_language: { spotId: saved.id, language: "ja" } },
      update: { name: spot.name, description: spot.description },
      create: { spotId: saved.id, language: "ja", name: spot.name, description: spot.description },
    });
    await prisma.spotTranslation.upsert({
      where: { spotId_language: { spotId: saved.id, language: "en" } },
      update: { name: englishNames[spot.slug] || spot.name },
      create: { spotId: saved.id, language: "en", name: englishNames[spot.slug] || spot.name },
    });
    const localizedNames = {
      zh: spot.slug === "kinkakuji" ? "金阁寺" : spot.slug === "kiyomizu-dera" ? "清水寺" : spot.name,
      ko: spot.slug === "kinkakuji" ? "금각사" : spot.slug === "kiyomizu-dera" ? "기요미즈데라" : spot.name,
    };
    for (const [language, name] of Object.entries(localizedNames)) {
      await prisma.spotTranslation.upsert({
        where: { spotId_language: { spotId: saved.id, language } },
        update: { name },
        create: { spotId: saved.id, language, name },
      });
    }
  }
}

main().finally(() => prisma.$disconnect());
