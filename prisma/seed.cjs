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
    ["food", [["ja", "食事"], ["en", "Food & Drink"], ["zh", "美食"], ["ko", "맛집"]]],
    ["culture", [["ja", "文化施設"], ["en", "Culture"], ["zh", "文化设施"], ["ko", "문화 시설"]]],
    ["hospitals", [["ja", "病院"], ["en", "Hospitals"], ["zh", "医院"], ["ko", "병원"]]],
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
  const foodCategory = await prisma.category.findUniqueOrThrow({ where: { slug: "food" } });
  const spots = [
    { slug: "kyoto-university-hospital", name: "京都大学医学部附属病院", description: "高度な専門医療と救急医療を担う京都を代表する大学病院。", officialUrl: "https://www.kuhp.kyoto-u.ac.jp/", category: "病院", latitude: 35.0178, longitude: 135.7707, address: "京都市左京区聖護院川原町54" },
    { slug: "kyoto-prefectural-university-hospital", name: "京都府立医科大学附属病院", description: "高度医療や専門診療を幅広く提供する大学附属病院。", officialUrl: "https://www.h.kpu-m.ac.jp/", category: "病院", latitude: 35.0258, longitude: 135.7710, address: "京都市上京区河原町通広小路上る梶井町465" },
    { slug: "kyoto-city-hospital", name: "京都市立病院", description: "救急・がん・周産期など幅広い診療に対応する地域の中核病院。", officialUrl: "https://www.kch-org.jp/", category: "病院", latitude: 34.9992, longitude: 135.7367, address: "京都市中京区壬生東高田町1-2" },
    { slug: "kyoto-second-red-cross-hospital", name: "京都第二赤十字病院", description: "高度救命救急センターを備えた地域の基幹病院。", officialUrl: "https://www.kyoto2.jrc.or.jp/", category: "病院", latitude: 35.0171, longitude: 135.7523, address: "京都市上京区釜座通丸太町上ル春帯町355-5" },
    { slug: "kyoto-katsura-hospital", name: "京都桂病院", description: "西京区の地域医療を支える総合病院。救急や専門診療に対応。", officialUrl: "https://www.katsura.com/", category: "病院", latitude: 34.9850, longitude: 135.6884, address: "京都市西京区山田平尾町17" },
    { slug: "takeda-hospital", name: "武田病院", description: "京都駅周辺で救急・内科・外科など幅広い診療を行う総合病院。", officialUrl: "https://www.takeda-hp.or.jp/", category: "病院", latitude: 34.9887, longitude: 135.7496, address: "京都市下京区塩小路通西洞院東入東塩小路町841-5" },
    { slug: "uji-tokushukai-hospital", name: "宇治徳洲会病院", description: "救急・産科・小児科など幅広く対応する宇治市の中核病院。", officialUrl: "https://www.ujitoku.or.jp/", category: "病院", latitude: 34.8739, longitude: 135.7757, address: "宇治市槇島町石橋145" },
    { slug: "kyoto-okazaki-hospital", name: "京都岡本記念病院", description: "久御山町で救急と専門医療を担う地域の総合病院。", officialUrl: "https://www.okamoto-hp.or.jp/", category: "病院", latitude: 34.8854, longitude: 135.7387, address: "久世郡久御山町佐山西ノ口100" },
    { slug: "honke-owariya", name: "本家尾張屋 本店", description: "創業から長く京都で親しまれている、そばと和菓子の老舗。", officialUrl: "https://honke-owariya.co.jp/", popularity: "MAJOR", category: "食事", latitude: 35.0119, longitude: 135.7587, address: "京都市中京区車屋町通二条下ル仁王門突抜町322" },
    { slug: "menya-inoichi", name: "麺屋 猪一", description: "だしの旨みを生かしたラーメンで人気の京都の店。", officialUrl: "https://menya-inoichi.com/", instagramUrl: "https://www.instagram.com/inoichi_kyoto/", popularity: "LOCAL_FAVORITE", category: "食事", latitude: 35.0024, longitude: 135.7689, address: "京都市下京区恵美須之町542" },
    { slug: "yamamoto-menzo", name: "山元麺蔵", description: "岡崎エリアで行列のできる、手打ちうどんの人気店。", officialUrl: "https://yamamotomenzou.com/", popularity: "LOCAL_FAVORITE", category: "食事", latitude: 35.0152, longitude: 135.7825, address: "京都市左京区岡崎南御所町34" },
    { slug: "katsukura-shijokarasuma", name: "名代とんかつ かつくら 四条東洞院店", description: "京都らしい食材も楽しめる、とんかつの定番店。", officialUrl: "https://www.katsukura.jp/", instagramUrl: "https://www.instagram.com/katsukura_official/", xUrl: "https://twitter.com/katsukura_jp", popularity: "MAJOR", category: "食事", latitude: 35.0060, longitude: 135.7600, address: "京都市中京区東洞院通四条上ル阪東屋町674" },
    { slug: "ippudo-nishikikoji", name: "一風堂 錦小路店", description: "京都の繁華街で楽しめる、全国的にも知られた博多ラーメン店。", officialUrl: "https://stores.ippudo.com/1031", instagramUrl: "https://www.instagram.com/ippudo_japan/", xUrl: "https://twitter.com/IPPUDO_JP", popularity: "MAJOR", category: "食事", latitude: 35.0062, longitude: 135.7650, address: "京都市中京区錦小路通東洞院西入ル元竹田町631" },
    { slug: "sushi-matsudaya-kyoto", name: "寿司 松屋 京都店", description: "京都の食材と職人の仕事を味わえる、予約制の寿司店。", officialUrl: "https://www.kyoto-matsudaya.com/", popularity: "LOCAL_FAVORITE", category: "食事", latitude: 35.0030, longitude: 135.7710, address: "京都市東山区祇園町南側570-123" },
    { slug: "arashiyama-yoshimura", name: "嵐山よしむら", description: "渡月橋を望みながら手打ちそばを楽しめる、嵐山の人気店。", officialUrl: "https://www.arashiyama-yoshimura.com/", popularity: "MAJOR", category: "食事", latitude: 35.0093, longitude: 135.6775, address: "京都市右京区嵯峨天龍寺芒ノ馬場町3" },
    { slug: "arashiyama-matsunosuke", name: "嵐山 松籟庵", description: "嵐山の自然に囲まれた山荘で京料理を味わえる店。", officialUrl: "https://www.syourai-an.com/", popularity: "LOCAL_FAVORITE", category: "食事", latitude: 35.0174, longitude: 135.6718, address: "京都市右京区嵯峨亀ノ尾町官有地内" },
    { slug: "fushimi-sakagura-kouji", name: "伏水酒蔵小路", description: "伏見の地酒と京都の料理を一度に楽しめる酒蔵街の飲食店。", officialUrl: "https://fushimi-sakagura-kouji.com/", popularity: "MAJOR", category: "食事", latitude: 34.9316, longitude: 135.7613, address: "京都市伏見区平野町82-2" },
    { slug: "fushimi-torisei", name: "鳥せい 本店", description: "伏見の酒蔵を改装した空間で、鶏料理と地酒を楽しめる老舗。", officialUrl: "https://www.torisei.com/", popularity: "LOCAL_FAVORITE", category: "食事", latitude: 34.9328, longitude: 135.7627, address: "京都市伏見区上油掛町186" },
    { slug: "kitayama-cafe-bibliotic", name: "CAFE bibliotic HELLO!", description: "北山エリアの落ち着いた空間で食事とスイーツを楽しめるカフェ。", officialUrl: "https://cafebibliotichello.com/", popularity: "LOCAL_FAVORITE", category: "食事", latitude: 35.0148, longitude: 135.7552, address: "京都市中京区二条通柳馬場東入ル晴明町650" },
    { slug: "demachiyanagi-mamezen", name: "満寿形屋", description: "出町柳周辺で親しまれている、鯖寿司とそばの老舗。", officialUrl: "https://masugata-ya.com/", popularity: "LOCAL_FAVORITE", category: "食事", latitude: 35.0302, longitude: 135.7725, address: "京都市左京区田中下柳町20" },
    { slug: "yamashina-gyouza-no-ohsho", name: "餃子の王将 山科駅前店", description: "山科駅周辺で地元の人にも利用される、気軽な中華料理店。", officialUrl: "https://map.ohsho.co.jp/b/ohsho/info/1040/", popularity: "MAJOR", category: "食事", latitude: 34.9916, longitude: 135.8174, address: "京都市山科区安朱中小路町15-3" },
    { slug: "uji-nakamura-tokichi", name: "中村藤吉本店 宇治本店", description: "宇治茶を使った甘味や食事を楽しめる、宇治を代表する老舗。", officialUrl: "https://www.tokichi.jp/", popularity: "MAJOR", category: "食事", latitude: 34.8894, longitude: 135.7997, address: "宇治市宇治壱番10" },
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
    { slug: "nishiki-market", name: "錦市場", description: "京の食文化を楽しめる商店街。", officialUrl: "https://www.kyoto-nishiki.or.jp/", category: "食事", latitude: 35.0050, longitude: 135.7648, address: "京都市中京区錦小路通" },
    { slug: "kyoto-station", name: "京都駅", description: "新幹線や各線が集まる京都の玄関口。", officialUrl: "https://www.kyoto-station-building.co.jp/", category: "駅", latitude: 34.9858, longitude: 135.7588, address: "京都市下京区東塩小路町901" },
    { slug: "gion-shijo-station", name: "祇園四条駅", description: "祇園や八坂神社に便利な駅。", officialUrl: "https://www.keihan.co.jp/traffic/station/011.html", category: "駅", latitude: 35.0035, longitude: 135.7724, address: "京都市東山区四条大橋東詰" },
    { slug: "sanjosaka-station", name: "三条京阪駅", description: "東山や岡崎方面への乗換駅。", officialUrl: "https://www.keihan.co.jp/traffic/station/010.html", category: "駅", latitude: 35.0094, longitude: 135.7726, address: "京都市東山区大橋町" },
    { slug: "kyoto-kawaramachi-station", name: "京都河原町駅", description: "四条河原町の中心にある便利な駅。", officialUrl: "https://www.hankyu.co.jp/station/karasuma.html", category: "駅", latitude: 35.0033, longitude: 135.7681, address: "京都市下京区四条通河原町西入真町52" },
    { slug: "karasuma-station", name: "烏丸駅", description: "四条烏丸エリアの中心駅。", officialUrl: "https://www.hankyu.co.jp/station/karasuma.html", category: "駅", latitude: 35.0039, longitude: 135.7595, address: "京都市下京区四条通" },
    { slug: "inari-station", name: "稲荷駅", description: "伏見稲荷大社の最寄り駅。", officialUrl: "https://www.jr-odekake.net/eki/top?id=0610703", category: "駅", latitude: 34.9671, longitude: 135.7707, address: "京都市伏見区深草稲荷御前町" },
    { slug: "saga-arashiyama-station", name: "嵯峨嵐山駅", description: "嵐山観光に便利な駅。", officialUrl: "https://www.jr-odekake.net/eki/top?id=0610705", category: "駅", latitude: 35.0182, longitude: 135.6811, address: "京都市右京区嵯峨天龍寺車道町" },
    { slug: "kyoto-aquarium", name: "京都水族館", description: "京都の川や海の生き物に出会える水族館。", officialUrl: "https://www.kyoto-aquarium.com/", category: "文化施設", latitude: 34.9874, longitude: 135.7483, address: "京都市下京区観喜寺町35-1" },
    { slug: "kyoto-tower", name: "京都タワー", description: "京都駅前から街を一望できる展望塔。", officialUrl: "https://www.keihanhotels-resorts.co.jp/kyoto-tower/", category: "文化施設", latitude: 34.9875, longitude: 135.7590, address: "京都市下京区烏丸通七条下る東塩小路町721-1" },
    { slug: "ninna-ji", name: "仁和寺", description: "御室桜で知られる世界遺産の寺院。", officialUrl: "https://ninnaji.jp/", category: "寺社・史跡", latitude: 35.0312, longitude: 135.7138, address: "京都市右京区御室大内33" },
    { slug: "daigo-ji", name: "醍醐寺", description: "豊臣秀吉の醍醐の花見で知られる世界遺産。", officialUrl: "https://www.daigoji.or.jp/", category: "寺社・史跡", latitude: 34.9515, longitude: 135.8215, address: "京都市伏見区醍醐東大路町22" },
    { slug: "nanzen-ji", name: "南禅寺", description: "三門と水路閣で知られる臨済宗の大本山。", officialUrl: "https://nanzenji.or.jp/", category: "寺社・史跡", latitude: 35.0117, longitude: 135.7930, address: "京都市左京区南禅寺福地町86" },
    { slug: "chion-in", name: "知恩院", description: "壮大な三門を持つ浄土宗の総本山。", officialUrl: "https://www.chion-in.or.jp/", category: "寺社・史跡", latitude: 35.0050, longitude: 135.7820, address: "京都市東山区林下町400" },
    { slug: "kennin-ji", name: "建仁寺", description: "風神雷神図屏風や枯山水で知られる京都最古の禅寺。", officialUrl: "https://www.kenninji.jp/", category: "寺社・史跡", latitude: 35.0005, longitude: 135.7730, address: "京都市東山区大和大路四条下る小松町584" },
    { slug: "shimogamo-shrine", name: "下鴨神社", description: "糺の森に鎮座する世界遺産の古社。", officialUrl: "https://www.shimogamo-jinja.or.jp/", category: "寺社・史跡", latitude: 35.0394, longitude: 135.7730, address: "京都市左京区下鴨泉川町59" },
    { slug: "kamigamo-shrine", name: "上賀茂神社", description: "京都最古級の神社の一つで、世界遺産にも登録されています。", officialUrl: "https://www.kamigamojinja.jp/", category: "寺社・史跡", latitude: 35.0580, longitude: 135.7528, address: "京都市北区上賀茂本山339" },
    { slug: "philosophers-path", name: "哲学の道", description: "銀閣寺から南禅寺へ続く桜と疏水の散策道。", officialUrl: "https://ja.kyoto.travel/tourism/article/teramachi/", category: "自然・公園", latitude: 35.0260, longitude: 135.7940, address: "京都市左京区若王子町付近" },
    { slug: "maruyama-park", name: "円山公園", description: "祇園に隣接する京都市最古の公園で、桜の名所です。", officialUrl: "https://kyoto-maruyama-park.jp/", category: "自然・公園", latitude: 35.0037, longitude: 135.7825, address: "京都市東山区円山町" },
    { slug: "kyoto-botanical-gardens", name: "京都府立植物園", description: "四季折々の植物を楽しめる日本最古の公立植物園。", officialUrl: "https://www.pref.kyoto.jp/plant/", category: "自然・公園", latitude: 35.0489, longitude: 135.7621, address: "京都市左京区下鴨半木町" },
    { slug: "kyoto-railway-museum", name: "京都鉄道博物館", description: "実物車両と鉄道の歴史を楽しめる博物館。", officialUrl: "https://www.kyotorailwaymuseum.jp/", category: "文化施設", latitude: 34.9875, longitude: 135.7427, address: "京都市下京区観喜寺町" },
    { slug: "kyoto-international-manga-museum", name: "京都国際マンガミュージアム", description: "国内外のマンガを収集・展示する文化施設。", officialUrl: "https://kyotomm.jp/", category: "文化施設", latitude: 35.0116, longitude: 135.7598, address: "京都市中京区烏丸通御池上る" },
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
    "ninna-ji": "Ninna-ji", "daigo-ji": "Daigo-ji", "nanzen-ji": "Nanzen-ji",
    "chion-in": "Chion-in", "kennin-ji": "Kennin-ji", "shimogamo-shrine": "Shimogamo Shrine",
    "kamigamo-shrine": "Kamigamo Shrine", "philosophers-path": "Philosopher's Path",
    "maruyama-park": "Maruyama Park", "kyoto-botanical-gardens": "Kyoto Botanical Gardens",
    "kyoto-railway-museum": "Kyoto Railway Museum",
    "kyoto-international-manga-museum": "Kyoto International Manga Museum",
    "honke-owariya": "Honke Owariya Honten", "menya-inoichi": "Menya Inoichi", "yamamoto-menzo": "Yamamoto Menzou",
    "katsukura-shijokarasuma": "Katsukura Shijo Higashinotoin", "ippudo-nishikikoji": "Ippudo Nishikikoji",
    "sushi-matsudaya-kyoto": "Sushi Matsudaya Kyoto", "arashiyama-yoshimura": "Arashiyama Yoshimura",
    "arashiyama-matsunosuke": "Arashiyama Shorai-an", "fushimi-sakagura-kouji": "Fushimi Sakagura Koji",
    "fushimi-torisei": "Torisei Honten", "kitayama-cafe-bibliotic": "CAFE bibliotic HELLO!",
    "demachiyanagi-mamezen": "Masugata-ya", "yamashina-gyouza-no-ohsho": "Gyoza no Ohsho Yamashina Station",
    "uji-nakamura-tokichi": "Nakamura Tokichi Honten Uji",
    "kyoto-university-hospital": "Kyoto University Hospital", "kyoto-prefectural-university-hospital": "Kyoto Prefectural University Hospital",
    "kyoto-city-hospital": "Kyoto City Hospital", "kyoto-second-red-cross-hospital": "Japanese Red Cross Kyoto Daini Hospital",
    "kyoto-katsura-hospital": "Kyoto Katsura Hospital", "takeda-hospital": "Takeda Hospital",
    "uji-tokushukai-hospital": "Uji Tokushukai Hospital", "kyoto-okazaki-hospital": "Kyoto Okamoto Memorial Hospital",
  };
  const defaultPriceInfo = {
    "食事": { ja: "1,000〜3,000円程度", en: "About ¥1,000–3,000 per person", zh: "每人约1,000至3,000日元", ko: "1인 약 1,000~3,000엔" },
    "寺社・史跡": { ja: "拝観料 300〜1,000円程度", en: "Admission: about ¥300–1,000", zh: "参观费约300至1,000日元", ko: "관람료 약 300~1,000엔" },
    "文化施設": { ja: "入館料 500〜2,000円程度", en: "Admission: about ¥500–2,000", zh: "门票约500至2,000日元", ko: "입장료 약 500~2,000엔" },
    "自然・公園": { ja: "無料（一部有料施設あり）", en: "Free (some facilities may charge admission)", zh: "免费（部分设施收费）", ko: "무료 (일부 시설은 유료)" },
    "駅": { ja: "無料（交通費・施設利用料は別途）", en: "Free to enter (transport and facility fees separate)", zh: "免费（交通和设施费用另计）", ko: "무료 (교통・시설 이용료 별도)" },
    "病院": { ja: "保険診療（診療内容により自己負担額が異なります）", en: "Insured medical care (out-of-pocket cost varies by treatment)", zh: "医保诊疗（自付金额因诊疗内容而异）", ko: "보험 진료 (진료 내용에 따라 본인 부담금이 다릅니다)" },
  };
  const localImages = {
    "yasaka-shrine": "/images/spots/yasaka-shrine.jpg",
    ginkakuji: "/images/spots/ginkakuji.jpg",
    "nishiki-market": "/images/spots/nishiki-market.jpg",
    kinkakuji: "/images/spots/kinkakuji.jpg",
    "kyoto-tower": "/images/spots/kyoto-tower.jpg",
    "kyoto-station": "/images/spots/kyoto-station.jpg",
    "kyoto-aquarium": "/images/spots/kyoto-aquarium.jpg",
    "shimogamo-shrine": "/images/spots/shimogamo-shrine.jpg",
    "kyoto-imperial-palace": "/images/spots/kyoto-imperial-palace.jpg",
  };
  for (const spot of spots) {
    const priceInfo = spot.priceInfo ?? defaultPriceInfo[spot.category ?? "寺社・史跡"] ?? defaultPriceInfo["寺社・史跡"];
    const saved = await prisma.spot.upsert({
      where: { regionId_slug: { regionId: region.id, slug: spot.slug } },
      update: { ...spot, priceInfo, categoryId: spot.category === "寺社・史跡" ? templeCategory.id : spot.category === "食事" ? foodCategory.id : null, isPublished: true },
      create: { ...spot, priceInfo, category: spot.category ?? "寺社・史跡", categoryId: spot.category === "寺社・史跡" || !spot.category ? templeCategory.id : spot.category === "食事" ? foodCategory.id : null, regionId: region.id, isPublished: true },
    });
    if (localImages[spot.slug]) {
      await prisma.spotImage.deleteMany({ where: { spotId: saved.id } });
      await prisma.spotImage.create({
        data: { spotId: saved.id, url: localImages[spot.slug], altText: spot.name, sortOrder: 0 },
      });
    }
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
