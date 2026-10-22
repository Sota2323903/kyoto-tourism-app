export const supportedLanguages = ["ja", "en", "zh", "ko"] as const;
export type Language = (typeof supportedLanguages)[number];

const messages = {
  ja: {
    appName: "Traveria", mainNav: "メインナビゲーション", heroImageCaption: "自分だけの物語を見つける", heroTitleLine1: "京都の旅を、", heroTitleLine2: "もっと自由に。", heroCardTitle: "旅の余白まで、\n京都。", recommendationLabel: "今日のおすすめ", categories: ["寺社・史跡", "食事", "文化施設", "自然・公園"], highlights: [{ number: "01", title: "気になる場所を探す", text: "寺社、食事、文化施設など、京都の見どころを地図から見つけられます。" }, { number: "02", title: "自分だけの旅をつくる", text: "行きたい場所を保存して、あなたのペースに合った旅の候補をまとめます。" }, { number: "03", title: "旅先で迷わない", text: "天候や交通の情報も確認しながら、京都での一日を楽しめます。" }], explore: "スポットを探す", map: "地図・AI", home: "ホーム", signIn: "サインイン", guest: "ゲストとして利用", discover: "京都を見つける",
    about: "使い方を見る", searchTitle: "京都のスポットを探す", searchPlaceholder: "スポット名やキーワードで検索",
    search: "検索", noResults: "該当するスポットがありません。", back: "一覧へ戻る", details: "詳細を見る",
    mapTitle: "京都のスポットを地図で探す", address: "住所", information: "基本情報", region: "地域",
    latitude: "緯度", longitude: "経度", official: "公式サイト ↗", instagram: "Instagram ↗", x: "X ↗",
    hours: "営業時間", price: "料金", admin: "スポット管理", export: "CSVエクスポート", add: "新規追加",
    name: "名前", category: "カテゴリ", published: "公開", unpublished: "非公開", updated: "更新日",
    newSpot: "スポットを追加", editSpot: "スポットを編集", importTitle: "CSVインポート",
    csvHelp: "CSVヘッダーはREADMEの形式に合わせてください。", import: "インポート", save: "保存",
    saved: "保存しました。", saveFailed: "保存に失敗しました。", imported: (ok: number, ng: number) => `成功: ${ok}件 / 失敗: ${ng}件`,
    importFailed: "インポートに失敗しました。", publish: "公開する", defaultDescription: "京都のおすすめスポットです。",
    favorites: "お気に入り", noFavorites: "お気に入りはまだありません。", signOut: "サインアウト", officialSite: "公式サイト ↗", officialSocial: "公式SNS", socialNotRegistered: "未登録", departureTime: "出発時刻", routePreference: "ルートの優先条件", avoidCongestion: "混雑を避ける", shortestRoute: "最短ルート", routeEstimateHint: "時間帯に応じた混雑を考慮して推定します。", allPopularity: "すべての飲食店", allCategories: "すべてのカテゴリー", localFavorite: "地元で人気", majorSpot: "定番のお店", priceGuide: "料金目安", viewOnMap: "地図で見る →", heroKicker: "あなたの京都、あなたのペースで", heroText: "有名な場所だけではない、あなたのための京都へ。街を歩き、味わい、知るための旅のコンパスです。", startExploring: "京都を探す", findToday: "今日は、何を見つける？", exploreHint: "気分や興味から、京都で過ごす場所を探してみましょう。", tryFind: "探してみる →", aboutEyebrow: "もっとやさしい旅のかたち", aboutTitle: "予定を詰めすぎない、京都の歩き方。", discoverEyebrow: "京都を探す", footer: "京都を知る、旅をつくる。", currentLocation: "現在地を取得", congestionArea: "混雑エリア", selectArea: "選択してください", destinations: "目的地（複数選択可）", travelMode: "移動方法で絞り込む", showRoute: "ルートを表示", showCongestion: "選択エリアの混雑を表示", aiPlan: "AIのおすすめプランを作成", searchHistory: "検索履歴", clearHistory: "履歴を削除", searchResults: "検索結果", mapLabel: "地図", nearbyTitle: "現在地から探す", nearbyHint: "近くのスポットを距離で絞り込めます。",                         favoriteSignIn: "お気に入りを使うにはサインインしてください。", locationUnsupported: "このブラウザでは現在地を取得できません。", locationDenied: "現在地の取得が許可されませんでした。", mapMode: "地図表示モード", favoriteFailed: "お気に入りを更新できませんでした。", favoriteAdded: "お気に入りに追加済み", favoriteAdd: "お気に入りに追加", routeInputRequired: "現在地を取得し、目的地を1件以上選択してください。", routeFailed: "ルートを取得できませんでした。", routeShown: "ルートを表示しました。", interestRequired: "興味のあることを1つ以上入力してください。", aiLoading: "AIがおすすめプランを作成しています...", aiFailed: "AIプランを取得できませんでした。", aiShown: "AIおすすめプランを表示しました。", aiFallback: "AIが利用できないため、登録スポットからプランを作成しました。", areaRequired: "混雑状況を表示するエリアを先に選択してください。",
    congestionLow: "空いている", congestionNormal: "通常", congestionHigh: "混雑", congestionVeryHigh: "非常に混雑", outsideHours: "営業時間外", temporarilyClosed: "臨時休業中", congestionTime: "現在の時間帯", night: "夜間", morning: "朝", lateMorning: "午前", lunch: "昼", afternoon: "午後", evening: "夕方", congestionLegend: "混雑状況の凡例", congestionNearby: "周辺の混雑目安", congestionDescription: (count: number) => `${count}件のスポットを中心に、周囲を色付けしています。色が濃く重なる場所ほど混雑度が高い目安です。`, congestionEstimate: "時間帯別の推定値です。登録されたスポット別の混雑度を周辺へ広げています", sourceResas: "出典・参考: RESAS ↗", aiQuestion: "どんな京都旅行にしたいですか？", aiInterests: "行きたい場所・興味", aiInterestsPlaceholder: "例：寺社、食べ歩き、紅葉", aiDays: "日数", dayUnit: "日", aiBudget: "予算", budgetLow: "節約", budgetMedium: "標準", budgetHigh: "ゆったり", createPlan: "この条件でプランを作る", destinationStatus: "目的地の現在状況", routeSummary: "ルート概要", duration: "所要時間", fare: "料金", walking: "徒歩", selectedCount: "目的地", selectedSummary: (count: number) => `${count}件選択中（最大10件）`, regionalStats: "地域統計", unavailable: "取得できません", notConfigured: "未設定", markerNote: "混雑マーカーは選択エリア内のスポット登録値を時間帯補正して表示しています。", dayNumber: (day: number) => `${day}日目`,
  },
  en: {
    appName: "Traveria", mainNav: "Main navigation", heroImageCaption: "FIND YOUR OWN STORY", heroTitleLine1: "Your Kyoto journey,", heroTitleLine2: "at your own pace.", heroCardTitle: "Make room for wonder.\nDiscover Kyoto.", recommendationLabel: "Today's recommendation", categories: ["Temples & heritage", "Food & drink", "Culture", "Nature & parks"], highlights: [{ number: "01", title: "Find places that spark curiosity", text: "Discover temples, food, culture, and hidden gems on the map." }, { number: "02", title: "Build your own journey", text: "Save the places you want to visit and shape a route at your pace." }, { number: "03", title: "Travel with confidence", text: "Check local conditions and transport information as you explore." }], explore: "Explore spots", map: "Map & AI", home: "Home", signIn: "Sign in", guest: "Continue as guest", discover: "Discover Kyoto", about: "How it works",
    searchTitle: "Find Kyoto spots", searchPlaceholder: "Search by name or keyword", search: "Search",
    noResults: "No spots found.", back: "Back to list", details: "View details", mapTitle: "Explore Kyoto on the map",
    address: "Address", information: "Information", region: "Region", latitude: "Latitude", longitude: "Longitude",
    official: "Official site ↗", instagram: "Instagram ↗", x: "X ↗", hours: "Opening hours", price: "Price",
    admin: "Spot management", export: "Export CSV", add: "Add new", name: "Name", category: "Category",
    published: "Published", unpublished: "Draft", updated: "Updated", newSpot: "Add spot", editSpot: "Edit spot",
    importTitle: "CSV import", csvHelp: "Use the CSV headers described in the README.", import: "Import", save: "Save",
    saved: "Saved.", saveFailed: "Failed to save.", imported: (ok: number, ng: number) => `Success: ${ok} / Failed: ${ng}`,
    importFailed: "Import failed.", publish: "Publish", defaultDescription: "A recommended spot in Kyoto.",
    favorites: "Favorites", noFavorites: "You have no favorites yet.", signOut: "Sign out", officialSite: "Official site ↗", officialSocial: "Official social media", socialNotRegistered: "Not registered", departureTime: "Departure time", routePreference: "Route preference", avoidCongestion: "Avoid congestion", shortestRoute: "Shortest route", routeEstimateHint: "Traffic is estimated by time of day.", allPopularity: "All restaurants", allCategories: "All categories", localFavorite: "Local favorites", majorSpot: "Popular spots", priceGuide: "Price guide", viewOnMap: "View on map →", heroKicker: "Your Kyoto, your pace", heroText: "Go beyond the famous places. A compass for walking, tasting, and discovering Kyoto at your own pace.", startExploring: "Explore Kyoto", findToday: "What will you discover today?", exploreHint: "Find a place in Kyoto based on your mood or interests.", tryFind: "Explore →", aboutEyebrow: "A gentler way to travel", aboutTitle: "A slower way to experience Kyoto.", discoverEyebrow: "Start exploring", footer: "Discover Kyoto, create your journey.", currentLocation: "Get location", congestionArea: "Congestion area", selectArea: "Select an area", destinations: "Destinations", travelMode: "Filter by travel mode", showRoute: "Show route", showCongestion: "Show congestion for selected area", aiPlan: "Create AI plan", searchHistory: "Search history", clearHistory: "Clear history", searchResults: "Search results", mapLabel: "Map", nearbyTitle: "Find near me", nearbyHint: "Filter nearby spots by distance.",                         favoriteSignIn: "Sign in to use favorites.", locationUnsupported: "This browser cannot access your location.", locationDenied: "Location permission was denied.", mapMode: "Map display mode", favoriteFailed: "Could not update favorites.", favoriteAdded: "Added to favorites", favoriteAdd: "Add to favorites", routeInputRequired: "Get your location and select at least one destination.", routeFailed: "Could not get the route.", routeShown: "Route displayed.", interestRequired: "Enter at least one interest.", aiLoading: "Creating your AI plan...", aiFailed: "Could not get an AI plan.", aiShown: "AI plan displayed.", aiFallback: "AI plan created from registered spots.", areaRequired: "Select an area before showing congestion.",
    congestionLow: "Low", congestionNormal: "Normal", congestionHigh: "Busy", congestionVeryHigh: "Very busy", outsideHours: "Outside opening hours", temporarilyClosed: "Temporarily closed", congestionTime: "Current time period", night: "Night", morning: "Morning", lateMorning: "Late morning", lunch: "Lunch", afternoon: "Afternoon", evening: "Evening", congestionLegend: "Congestion legend", congestionNearby: "Estimated nearby congestion", congestionDescription: (count: number) => `Color is spread around ${count} spots. Darker overlapping areas indicate higher congestion.`, congestionEstimate: "Estimated by time period from registered spot levels", sourceResas: "Source / reference: RESAS ↗", aiQuestion: "What kind of Kyoto trip would you like?", aiInterests: "Places and interests", aiInterestsPlaceholder: "e.g. temples, food, autumn leaves", aiDays: "Days", dayUnit: " day(s)", aiBudget: "Budget", budgetLow: "Economy", budgetMedium: "Standard", budgetHigh: "Relaxed", createPlan: "Create a plan with these preferences", destinationStatus: "Current destination status", routeSummary: "Route summary", duration: "Duration", fare: "Fare", walking: "Walking", selectedCount: "Destinations", selectedSummary: (count: number) => `${count} selected (max 10)`, regionalStats: "Regional statistics", unavailable: "Unavailable", notConfigured: "Not configured", markerNote: "Markers show registered spot levels adjusted for the current time period.", dayNumber: (day: number) => `Day ${day}`,
  },
  zh: {
    appName: "Traveria", mainNav: "主导航", heroImageCaption: "寻找属于自己的故事", heroTitleLine1: "探索京都之旅，", heroTitleLine2: "更加自由。", heroCardTitle: "为旅途留白，\n发现京都。", recommendationLabel: "今日推荐", categories: ["寺庙・历史遗迹", "美食", "文化设施", "自然・公园"], highlights: [{ number: "01", title: "寻找心动的地方", text: "在地图上发现寺庙、美食、文化设施和隐藏景点。" }, { number: "02", title: "创造专属旅程", text: "收藏想去的地方，按照自己的节奏整理旅行计划。" }, { number: "03", title: "安心享受旅途", text: "探索京都时随时查看当地情况和交通信息。" }], explore: "探索景点", map: "地图・AI", home: "首页", signIn: "登录", guest: "以访客身份使用", discover: "发现京都", about: "使用方法",
    searchTitle: "寻找京都景点", searchPlaceholder: "按名称或关键词搜索", search: "搜索", noResults: "没有找到景点。",
    back: "返回列表", details: "查看详情", mapTitle: "在地图上探索京都", address: "地址", information: "基本信息",
    region: "地区", latitude: "纬度", longitude: "经度", official: "官方网站 ↗", instagram: "Instagram ↗", x: "X ↗",
    hours: "营业时间", price: "价格", admin: "景点管理", export: "导出CSV", add: "新增", name: "名称",
    category: "类别", published: "已发布", unpublished: "未发布", updated: "更新时间", newSpot: "新增景点",
    editSpot: "编辑景点", importTitle: "CSV导入", csvHelp: "请使用README中说明的CSV表头。", import: "导入", save: "保存",
    saved: "已保存。", saveFailed: "保存失败。", imported: (ok: number, ng: number) => `成功: ${ok}条 / 失败: ${ng}条`,
    importFailed: "导入失败。", publish: "发布", defaultDescription: "京都推荐景点。",
    favorites: "收藏", noFavorites: "还没有收藏的景点。", signOut: "退出登录", officialSite: "官方网站 ↗", officialSocial: "官方社交媒体", socialNotRegistered: "未登记", departureTime: "出发时间", routePreference: "路线偏好", avoidCongestion: "避开拥挤", shortestRoute: "最短路线", routeEstimateHint: "根据时间段估算交通状况。", allPopularity: "所有餐饮店", allCategories: "所有类别", localFavorite: "当地人气", majorSpot: "热门店铺", priceGuide: "价格参考", viewOnMap: "在地图上查看 →", heroKicker: "你的京都，你的节奏", heroText: "探索不只有名胜的京都，在城市中漫步、品味和发现属于你的旅程。", startExploring: "探索京都", findToday: "今天想发现什么？", exploreHint: "按心情和兴趣寻找京都的去处。", tryFind: "开始寻找 →", aboutEyebrow: "更从容的旅行方式", aboutTitle: "不赶行程，慢慢走京都。", discoverEyebrow: "开始探索", footer: "了解京都，创造旅程。", currentLocation: "获取当前位置", congestionArea: "拥挤区域", selectArea: "请选择区域", destinations: "目的地", travelMode: "按出行方式筛选", showRoute: "显示路线", showCongestion: "显示所选区域拥挤情况", aiPlan: "创建 AI 行程", searchHistory: "搜索历史", clearHistory: "清除历史", searchResults: "搜索结果", mapLabel: "地图", nearbyTitle: "查找附近景点", nearbyHint: "按距离筛选附近景点。",                         favoriteSignIn: "请登录后使用收藏功能。", locationUnsupported: "此浏览器无法获取当前位置。", locationDenied: "未获准获取当前位置。", mapMode: "地图显示模式", favoriteFailed: "无法更新收藏。", favoriteAdded: "已添加到收藏", favoriteAdd: "添加到收藏", routeInputRequired: "请获取当前位置并至少选择一个目的地。", routeFailed: "无法获取路线。", routeShown: "已显示路线。", interestRequired: "请输入至少一个兴趣。", aiLoading: "正在创建 AI 行程……", aiFailed: "无法获取 AI 行程。", aiShown: "已显示 AI 行程。", aiFallback: "由于 AI 无法使用，因此根据已登记的景点创建了行程。", areaRequired: "显示拥挤情况前，请先选择区域。",
    congestionLow: "空闲", congestionNormal: "一般", congestionHigh: "拥挤", congestionVeryHigh: "非常拥挤", outsideHours: "营业时间外", temporarilyClosed: "临时休业", congestionTime: "当前时间段", night: "夜间", morning: "早晨", lateMorning: "上午", lunch: "中午", afternoon: "下午", evening: "傍晚", congestionLegend: "拥挤情况图例", congestionNearby: "周边拥挤参考", congestionDescription: (count: number) => `以${count}个景点为中心向周边着色，颜色重叠越深表示越拥挤。`, congestionEstimate: "根据时间段和已登记的景点拥挤度推算", sourceResas: "来源/参考：RESAS ↗", aiQuestion: "您想要怎样的京都旅行？", aiInterests: "想去的地方・兴趣", aiInterestsPlaceholder: "例：寺社、美食、红叶", aiDays: "天数", dayUnit: "天", aiBudget: "预算", budgetLow: "节省", budgetMedium: "标准", budgetHigh: "悠闲", createPlan: "按此条件制定行程", destinationStatus: "目的地当前状况", routeSummary: "路线概要", duration: "所需时间", fare: "费用", walking: "步行", selectedCount: "目的地", selectedSummary: (count: number) => `已选择${count}个（最多10个）`, regionalStats: "地区统计", unavailable: "无法获取", notConfigured: "未设置", markerNote: "拥挤标记根据当前时间段调整已登记的景点拥挤度。", dayNumber: (day: number) => `第${day}天`,
  },
  ko: {
    appName: "Traveria", mainNav: "주요 탐색", heroImageCaption: "나만의 이야기를 찾아보세요", heroTitleLine1: "교토 여행을", heroTitleLine2: "더 자유롭게.", heroCardTitle: "여행의 여백까지,\n교토.", recommendationLabel: "오늘의 추천", categories: ["사찰・역사 유적", "맛집", "문화 시설", "자연・공원"], highlights: [{ number: "01", title: "마음이 끌리는 곳 찾기", text: "지도에서 사찰, 맛집, 문화 시설과 숨은 명소를 발견하세요." }, { number: "02", title: "나만의 여행 만들기", text: "가고 싶은 곳을 저장하고 나만의 속도로 여행 후보를 정리하세요." }, { number: "03", title: "안심하고 여행하기", text: "교토를 탐색하며 현지 상황과 교통 정보를 확인하세요." }], explore: "명소 찾기", map: "지도・AI", home: "홈", signIn: "로그인", guest: "게스트로 이용", discover: "교토 발견하기", about: "이용 방법",
    searchTitle: "교토 명소 찾기", searchPlaceholder: "이름 또는 키워드로 검색", search: "검색", noResults: "명소가 없습니다.",
    back: "목록으로", details: "상세 보기", mapTitle: "지도에서 교토 탐색", address: "주소", information: "기본 정보",
    region: "지역", latitude: "위도", longitude: "경도", official: "공식 사이트 ↗", instagram: "Instagram ↗", x: "X ↗",
    hours: "영업시간", price: "요금", admin: "명소 관리", export: "CSV 내보내기", add: "새로 추가", name: "이름",
    category: "카테고리", published: "공개", unpublished: "비공개", updated: "수정일", newSpot: "명소 추가",
    editSpot: "명소 편집", importTitle: "CSV 가져오기", csvHelp: "README에 설명된 CSV 헤더를 사용하세요.", import: "가져오기",
    save: "저장", saved: "저장되었습니다.", saveFailed: "저장하지 못했습니다.", imported: (ok: number, ng: number) => `성공: ${ok}건 / 실패: ${ng}건`,
    importFailed: "가져오기에 실패했습니다.", publish: "공개", defaultDescription: "교토 추천 명소입니다.",
    favorites: "즐겨찾기", noFavorites: "아직 즐겨찾기가 없습니다.", signOut: "로그아웃", officialSite: "공식 사이트 ↗", officialSocial: "공식 SNS", socialNotRegistered: "미등록", departureTime: "출발 시간", routePreference: "경로 우선 조건", avoidCongestion: "혼잡 피하기", shortestRoute: "최단 경로", routeEstimateHint: "시간대별 교통을 고려해 추정합니다.", allPopularity: "모든 음식점", allCategories: "모든 카테고리", localFavorite: "현지 인기", majorSpot: "인기 명소", priceGuide: "요금 안내", viewOnMap: "지도에서 보기 →", heroKicker: "나만의 교토, 나만의 속도", heroText: "유명한 곳만이 아닌 나만의 교토를 만나보세요. 걷고, 맛보고, 발견하는 여행의 나침반입니다.", startExploring: "교토 탐색", findToday: "오늘은 무엇을 발견할까요?", exploreHint: "기분과 관심사에 맞는 교토의 장소를 찾아보세요.", tryFind: "찾아보기 →", aboutEyebrow: "더 여유로운 여행", aboutTitle: "일정을 채우지 않고 걷는 교토.", discoverEyebrow: "탐색 시작", footer: "교토를 알고, 여행을 만드세요.", currentLocation: "현재 위치 가져오기", congestionArea: "혼잡 지역", selectArea: "지역을 선택하세요", destinations: "목적지", travelMode: "이동 수단으로 필터링", showRoute: "경로 표시", showCongestion: "선택 지역 혼잡 표시", aiPlan: "AI 일정 만들기", searchHistory: "검색 기록", clearHistory: "기록 삭제", searchResults: "검색 결과", mapLabel: "지도", nearbyTitle: "현재 위치 주변 찾기", nearbyHint: "거리로 주변 명소를 필터링하세요.",                         favoriteSignIn: "즐겨찾기를 사용하려면 로그인하세요.", locationUnsupported: "이 브라우저에서는 현재 위치를 가져올 수 없습니다.", locationDenied: "현재 위치 권한이 거부되었습니다.", mapMode: "지도 표시 모드", favoriteFailed: "즐겨찾기를 업데이트하지 못했습니다.", favoriteAdded: "즐겨찾기에 추가됨", favoriteAdd: "즐겨찾기에 추가", routeInputRequired: "현재 위치를 가져오고 목적지를 하나 이상 선택하세요.", routeFailed: "경로를 가져오지 못했습니다.", routeShown: "경로가 표시되었습니다.", interestRequired: "관심사를 하나 이상 입력하세요.", aiLoading: "AI 일정을 만드는 중입니다...", aiFailed: "AI 일정을 가져오지 못했습니다.", aiShown: "AI 일정이 표시되었습니다.", aiFallback: "AI서비스를 사용할 수 없어 등록된 명소로 일정을 만들었습니다.", areaRequired: "혼잡도를 표시하기 전에 지역을 선택하세요.",
    congestionLow: "한산함", congestionNormal: "보통", congestionHigh: "혼잡", congestionVeryHigh: "매우 혼잡", outsideHours: "영업시간 외", temporarilyClosed: "임시 휴업", congestionTime: "현재 시간대", night: "야간", morning: "아침", lateMorning: "오전", lunch: "점심", afternoon: "오후", evening: "저녁", congestionLegend: "혼잡 범례", congestionNearby: "주변 혼잡 예상", congestionDescription: (count: number) => `${count}개 명소를 중심으로 주변을 색칠합니다. 색이 겹치고 진할수록 혼잡도가 높습니다.`, congestionEstimate: "등록된 명소 혼잡도와 시간대에 따른 추정치", sourceResas: "출처/참고: RESAS ↗", aiQuestion: "어떤 교토 여행을 원하시나요?", aiInterests: "가고 싶은 곳・관심사", aiInterestsPlaceholder: "예: 사찰, 먹방, 단풍", aiDays: "일수", dayUnit: "일", aiBudget: "예산", budgetLow: "절약", budgetMedium: "표준", budgetHigh: "여유롭게", createPlan: "이 조건으로 일정 만들기", destinationStatus: "목적지 현재 상태", routeSummary: "경로 요약", duration: "소요 시간", fare: "요금", walking: "도보", selectedCount: "목적지", selectedSummary: (count: number) => `${count}개 선택 (최대 10개)`, regionalStats: "지역 통계", unavailable: "가져올 수 없음", notConfigured: "미설정", markerNote: "혼잡 마커는 현재 시간대에 맞춰 등록된 명소 혼잡도를 표시합니다.", dayNumber: (day: number) => `${day}일차`,
  },
} as const;

export function normalizeLanguage(value?: string): Language {
  return supportedLanguages.includes(value as Language) ? (value as Language) : "ja";
}

export function getMessages(language?: string) {
  return messages[normalizeLanguage(language)];
}

const localizedSpotNames: Record<string, { zh: string; ko: string }> = {
  "sanjusangen-do": { zh: "三十三间堂", ko: "산주산겐도" },
  "sanjosaka-station": { zh: "三条京阪站", ko: "산조 게이한역" },
  "nijo-castle": { zh: "二条城", ko: "니조성" },
  "kyoto-tower": { zh: "京都塔", ko: "교토 타워" },
  "kyoto-imperial-palace": { zh: "京都御所", ko: "교토고쇼" },
  "kyoto-aquarium": { zh: "京都水族馆", ko: "교토 수족관" },
  "kyoto-kawaramachi-station": { zh: "京都河原町站", ko: "교토 가와라마치역" },
  "kyoto-station": { zh: "京都站", ko: "교토역" },
  "fushimi-inari": { zh: "伏见稻荷大社", ko: "후시미 이나리 신사" },
  "yasaka-shrine": { zh: "八坂神社", ko: "야사카 신사" },
  "arashiyama-bamboo-grove": { zh: "岚山竹林", ko: "아라시야마 대나무숲" },
  "saga-arashiyama-station": { zh: "嵯峨岚山站", ko: "사가 아라시야마역" },
  "heian-jingu": { zh: "平安神宫", ko: "헤이안 신궁" },
  tofukuji: { zh: "东福寺", ko: "도후쿠지" },
  "kiyomizu-dera": { zh: "清水寺", ko: "기요미즈데라" },
  "togetsukyo-bridge": { zh: "渡月桥", ko: "도게쓰교" },
  "karasuma-station": { zh: "乌丸站", ko: "가라스마역" },
  "gion-shijo-station": { zh: "祇园四条站", ko: "기온시조역" },
  "inari-station": { zh: "稻荷站", ko: "이나리역" },
  kinkakuji: { zh: "金阁寺", ko: "금각사" },
  ginkakuji: { zh: "银阁寺", ko: "은각사" },
  "nishiki-market": { zh: "锦市场", ko: "니시키 시장" },
  ryoanji: { zh: "龙安寺", ko: "료안지" },
};

const localizedCategoryNames: Record<string, Partial<Record<Language, string>>> = {
  "寺社・史跡": { en: "Temples & heritage", zh: "寺社与史迹", ko: "사찰 및 유적" },
  食事: { en: "Food & drink", zh: "餐饮", ko: "음식" },
  "文化施設": { en: "Culture", zh: "文化设施", ko: "문화 시설" },
  "自然・公園": { en: "Nature & parks", zh: "自然与公园", ko: "자연 및 공원" },
  駅: { en: "Stations", zh: "车站", ko: "역" },
  病院: { en: "Hospital", zh: "医院", ko: "병원" },
};

export function getLocalizedCategory(category: string, language?: string) {
  const normalized = normalizeLanguage(language);
  return normalized === "ja" ? category : localizedCategoryNames[category]?.[normalized] ?? category;
}

export function getLocalizedSpotName(slug: string, fallback: string, language?: string) {
  const normalized = normalizeLanguage(language);
  return normalized === "ja" || normalized === "en" ? fallback : localizedSpotNames[slug]?.[normalized] ?? fallback;
}
