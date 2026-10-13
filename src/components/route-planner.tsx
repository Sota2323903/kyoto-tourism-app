"use client";

import { useMemo, useState } from "react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { SpotMapLoader } from "@/components/map/SpotMapLoader";
import type { MapDisplayMode, MapSpot } from "@/components/map/SpotMap";
import { getMessages } from "@/lib/i18n";
import { getCongestionTimeSlot, getTimeAdjustedCongestionLevel } from "@/lib/congestion";

type PlannerSpot = MapSpot & { category: string; address: string | null; openingHours?: unknown; statusOverride?: { congestionLevel: number; isTemporarilyClosed: boolean; noticeMessage: string | null } | null };

const congestionAreas: { value: string; label: string; slugs: string[] }[] = [
  { value: "gion", label: "祇園・東山", slugs: ["kiyomizu-dera", "yasaka-shrine", "heian-jingu", "tofukuji", "sanjusangen-do", "gion-shijo-station", "sanjosaka-station"] },
  { value: "kyoto-station", label: "京都駅・梅小路", slugs: ["kyoto-station", "kyoto-aquarium", "kyoto-tower"] },
  { value: "arashiyama", label: "嵐山", slugs: ["arashiyama-bamboo-grove", "togetsukyo-bridge", "saga-arashiyama-station"] },
  { value: "north", label: "金閣寺・北山", slugs: ["kinkakuji", "ginkakuji", "ryoanji"] },
  { value: "central", label: "河原町・御所", slugs: ["nishiki-market", "kyoto-kawaramachi-station", "karasuma-station", "nijo-castle", "kyoto-imperial-palace"] },
] ;

type CongestionArea = (typeof congestionAreas)[number];

function isInArea(spot: PlannerSpot, area: CongestionArea) {
  return area.slugs.includes(spot.slug);
}

const transportModes = ["WALK", "TRAIN", "BUS", "BICYCLE", "CAR", "MIXED"] as const;

function getRouteOverview(mode: string, walkingDistanceMeters: number, transfers: number, destinationTitles: string[], language: string) {
  const walkingMinutes = Math.max(1, Math.ceil(walkingDistanceMeters / 80));
  const destinations = destinationTitles.length ? destinationTitles.map((title) => `「${title}」`) : ["目的地"];
  const destination = destinations[0];
  const labels = language === "en"
    ? { destination: "destination", stationWalk: "Walk to the nearest station", train: "Take the train", stationExit: "Get off at the nearest station", afterWalk: (minutes: number) => `Then walk about ${minutes} minutes to ${destination}`, arrive: (from: string, to: string) => `After arriving at ${from}, travel to ${to}`, nextStation: "Get off at the nearest station", walkTo: (title: string) => `Then walk to ${title}`, busWalk: "Walk to the bus stop", takeBus: "Take the bus", busExit: "Get off at the nearest bus stop", walkToDestination: (minutes: number) => `Then walk about ${minutes} minutes to ${destination}`, nextBus: "Then travel to the next bus stop", walkBus: "Take the bus from the bus stop", busTo: (title: string) => `Get off at the nearest bus stop and walk to ${title}`, walk: (title: string, minutes: number) => `Walk to ${title} (about ${minutes} minutes)`, walkAfter: (title: string) => `Then walk to ${title}`, bicycle: (title: string) => `Cycle to ${title}`, bicycleAfter: (title: string) => `Then cycle to ${title}`, car: (title: string) => `Drive to ${title}`, carAfter: (title: string) => `Then drive to ${title}`, public: "Travel to public transportation", takePublic: "Take public transportation", afterExit: (minutes: number) => `After getting off, walk about ${minutes} minutes to ${destination}`, publicAfter: (title: string) => `Then walk to ${title}` }
    : language === "zh"
      ? { destination: "目的地", stationWalk: "步行前往最近的车站", train: "乘坐电车", stationExit: "在目的地最近的车站下车", afterWalk: (minutes: number) => `然后步行约${minutes}分钟到达${destination}`, arrive: (from: string, to: string) => `到达${from}后前往${to}`, nextStation: "在下一个目的地最近的车站下车", walkTo: (title: string) => `然后步行前往${title}`, busWalk: "步行前往公交车站", takeBus: "乘坐公交车", busExit: "在目的地最近的公交车站下车", walkToDestination: (minutes: number) => `然后步行约${minutes}分钟到达${destination}`, nextBus: "然后前往下一个公交车站", walkBus: "从公交车站乘坐公交车", busTo: (title: string) => `在目的地最近的公交车站下车后步行前往${title}`, walk: (title: string, minutes: number) => `步行前往${title}（约${minutes}分钟）`, walkAfter: (title: string) => `然后步行前往${title}`, bicycle: (title: string) => `骑自行车前往${title}`, bicycleAfter: (title: string) => `然后骑自行车前往${title}`, car: (title: string) => `驾车前往${title}`, carAfter: (title: string) => `然后驾车前往${title}`, public: "从出发地前往公共交通", takePublic: "乘坐公共交通", afterExit: (minutes: number) => `下车后步行约${minutes}分钟到达${destination}`, publicAfter: (title: string) => `然后步行前往${title}` }
      : language === "ko"
        ? { destination: "목적지", stationWalk: "가까운 역까지 도보 이동", train: "전철 탑승", stationExit: "목적지와 가까운 역에서 하차", afterWalk: (minutes: number) => `그 후 약 ${minutes}분 걸어서 ${destination}으로 이동`, arrive: (from: string, to: string) => `${from}에 도착한 후 ${to}(으)로 이동`, nextStation: "다음 목적지와 가까운 역에서 하차", walkTo: (title: string) => `그 후 ${title}(으)로 도보 이동`, busWalk: "버스 정류장까지 도보 이동", takeBus: "버스 탑승", busExit: "목적지와 가까운 버스 정류장에서 하차", walkToDestination: (minutes: number) => `그 후 약 ${minutes}분 걸어서 ${destination}(으)로 이동`, nextBus: "그 후 다음 버스 정류장으로 이동", walkBus: "버스 정류장에서 버스 탑승", busTo: (title: string) => `가까운 버스 정류장에서 하차 후 ${title}(으)로 도보 이동`, walk: (title: string, minutes: number) => `도보로 ${title}까지 이동（약 ${minutes}분）`, walkAfter: (title: string) => `그 후 ${title}(으)로 도보 이동`, bicycle: (title: string) => `자전거로 ${title}까지 이동`, bicycleAfter: (title: string) => `그 후 자전거로 ${title}(으)로 이동`, car: (title: string) => `자동차로 ${title}까지 이동`, carAfter: (title: string) => `그 후 자동차로 ${title}(으)로 이동`, public: "출발지에서 대중교통까지 이동", takePublic: "대중교통 탑승", afterExit: (minutes: number) => `하차 후 약 ${minutes}분 걸어서 ${destination}(으)로 이동`, publicAfter: (title: string) => `그 후 ${title}(으)로 도보 이동` }
        : { destination: "目的地", stationWalk: "最寄りの駅まで徒歩で移動", train: "電車に乗車", stationExit: "目的地の最寄り駅で下車", afterWalk: (minutes: number) => `そののち徒歩約${minutes}分で${destination}`, arrive: (from: string, to: string) => `${from}に着いたのち、${to}へ移動`, nextStation: "次の目的地の最寄り駅で下車", walkTo: (title: string) => `そののち徒歩で${title}へ`, busWalk: "乗車するバス停まで徒歩で移動", takeBus: "乗車するバス停からバスに乗車", busExit: "目的地の最寄りのバス停で下車", walkToDestination: (minutes: number) => `そののち徒歩約${minutes}分で${destination}`, nextBus: "次のバス停へ移動", walkBus: "乗車するバス停からバスに乗車", busTo: (title: string) => `目的地の最寄りのバス停で下車し、徒歩で${title}へ`, walk: (title: string, minutes: number) => `徒歩で${title}まで移動（約${minutes}分）`, walkAfter: (title: string) => `${title}に着いたのち、徒歩で${title}へ移動`, bicycle: (title: string) => `自転車で${title}まで移動`, bicycleAfter: (title: string) => `そののち自転車で${title}へ移動`, car: (title: string) => `車で${title}まで移動`, carAfter: (title: string) => `そののち車で${title}へ移動`, public: "出発地点から公共交通機関まで移動", takePublic: "公共交通機関に乗車", afterExit: (minutes: number) => `下車後、徒歩約${minutes}分で${destination}`, publicAfter: (title: string) => `そののち徒歩で${title}へ移動` };

  if (mode === "TRAIN") {
    const steps = [
      labels.stationWalk, `${labels.train}${transfers > 0 ? ` (${transfers} transfers)` : ""}`, labels.stationExit, labels.afterWalk(walkingMinutes),
    ];
    for (let index = 1; index < destinations.length; index += 1) {
      steps.push(
        labels.arrive(destinations[index - 1], destinations[index]), labels.nextStation, labels.walkTo(destinations[index]),
      );
    }
    return steps;
  }
  if (mode === "BUS") {
    const steps = [
      labels.busWalk, `${labels.takeBus}${transfers > 0 ? ` (${transfers} transfers)` : ""}`, labels.busExit, labels.walkToDestination(walkingMinutes),
    ];
    for (let index = 1; index < destinations.length; index += 1) {
      steps.push(
        labels.arrive(destinations[index - 1], destinations[index]), labels.nextBus, labels.busTo(destinations[index]),
      );
    }
    return steps;
  }
  if (mode === "WALK") {
    return destinations.map((title, index) =>
      index === 0
        ? labels.walk(title, walkingMinutes)
        : labels.walkAfter(title),
    );
  }
  if (mode === "BICYCLE") {
    return destinations.map((title, index) =>
      index === 0 ? labels.bicycle(title) : labels.bicycleAfter(title),
    );
  }
  if (mode === "CAR") {
    return destinations.map((title, index) =>
      index === 0 ? labels.car(title) : labels.carAfter(title),
    );
  }
  const steps = [
    labels.public, `${labels.takePublic}${transfers > 0 ? ` (${transfers} transfers)` : ""}`, labels.afterExit(walkingMinutes),
  ];
  for (let index = 1; index < destinations.length; index += 1) {
    steps.push(labels.publicAfter(destinations[index]));
  }
  return steps;
}

export function RoutePlanner({ spots, selectedSpotId, language }: { spots: PlannerSpot[]; selectedSpotId?: string; language: string }) {
  const t = getMessages(language);
  const areaLabels = language === "en"
    ? ["Gion / Higashiyama", "Kyoto Station / Umekoji", "Arashiyama", "Kinkakuji / Kitayama", "Kawaramachi / Gosho"]
    : language === "zh"
      ? ["祗园・东山", "京都站・梅小路", "岚山", "金阁寺・北山", "河原町・御所"]
      : language === "ko"
        ? ["기온・히가시야마", "교토역・우메코지", "아라시야마", "킨카쿠지・기타야마", "가와라마치・교토고쇼"]
        : congestionAreas.map((area) => area.label);
  const transportLabels = language === "en"
    ? ["Walk", "Train", "Bus", "Bicycle", "Car", "Mixed"]
    : language === "zh"
      ? ["步行", "电车", "公交车", "自行车", "汽车", "组合"]
      : language === "ko"
        ? ["도보", "전철", "버스", "자전거", "자동차", "복합"]
        : ["徒歩", "電車", "バス", "自転車", "車", "複合"];
  const congestionLabels = [t.congestionLow, t.congestionNormal, t.congestionHigh, t.congestionVeryHigh];
  const [destinationIds, setDestinationIds] = useState<string[]>(selectedSpotId ? [selectedSpotId] : spots[0]?.id ? [spots[0].id] : []);
  const [mode, setMode] = useState("WALK");
  const [route, setRoute] = useState<{ durationMinutes: number; costYen: number; walkingDistanceMeters: number; transfers: number; steps: { instruction: string; distanceMeters: number }[]; geometry: [number, number][] } | null>(null);
  const [aiPlan, setAiPlan] = useState<{ title: string; summary: string; itinerary: { day: number; slots: { time: string; title: string; description: string }[] }[] } | null>(null);
  const [showAiForm, setShowAiForm] = useState(false);
  const [aiInterests, setAiInterests] = useState(language === "en" ? "temples, history" : language === "zh" ? "寺庙、历史" : language === "ko" ? "사찰, 역사" : "寺社・歴史");
  const [aiDurationDays, setAiDurationDays] = useState(1);
  const [aiBudget, setAiBudget] = useState<"low" | "medium" | "high">("medium");
  const [message, setMessage] = useState("");
  const [displayMode, setDisplayMode] = useState<MapDisplayMode>("route");
  const [selectedArea, setSelectedArea] = useState<CongestionArea["value"] | "">("");
  const { location, error, loading, getCurrentLocation } = useGeolocation(language);
  const destinations = spots.filter((spot) => destinationIds.includes(spot.id));
  const activeArea = congestionAreas.find((area) => area.value === selectedArea);
  const areaSpots = useMemo(
    () => activeArea ? spots.filter((spot) => isInArea(spot, activeArea)) : [],
    [activeArea, spots],
  );
  const mapSpots = useMemo(() => {
    const visibleSpots = displayMode === "congestion" ? areaSpots : spots;
    return visibleSpots.map((spot) => ({
      ...spot,
      congestionLevel: spot.statusOverride?.congestionLevel,
      isTemporarilyClosed: spot.statusOverride?.isTemporarilyClosed,
    }));
  }, [areaSpots, displayMode, spots]);
  async function searchRoute() {
    if (!location || !destinations.length) return setMessage(t.routeInputRequired);
    const response = await fetch("/api/routes/search", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ originLat: location.latitude, originLng: location.longitude, destinations: destinations.map((destination) => ({ latitude: destination.latitude, longitude: destination.longitude })), mode, condition: "FASTEST" }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? t.routeFailed);
    setRoute(data);
    setMessage(t.routeShown);
  }

  async function getAiPlan() {
    const interests = aiInterests.split(/[、,，\s]+/).map((interest) => interest.trim()).filter(Boolean).slice(0, 10);
    if (!interests.length) {
      setMessage(t.interestRequired);
      return;
    }
    setMessage(t.aiLoading);
    const response = await fetch("/api/ai/plan", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ language, interests, durationDays: aiDurationDays, budgetLevel: aiBudget, startingLocation: location ? `${location.latitude},${location.longitude}` : undefined }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error ?? t.aiFailed);
    setAiPlan(data);
    setShowAiForm(false);
    setMessage(t.aiShown);
  }
  return <section className="space-y-4">
    <div className="space-y-3 rounded-2xl border border-ink/10 bg-white p-4">
      <div className="mx-auto flex max-w-xl gap-1 rounded-full bg-sand p-1" role="group" aria-label={t.mapMode}>
        <button type="button" onClick={() => setDisplayMode("route")} className={`flex-1 rounded-full px-3 py-1.5 text-sm ${displayMode === "route" ? "bg-ink text-white" : "text-ink/60"}`}>{t.showRoute}</button>
        <button type="button" onClick={() => {
          if (!selectedArea) {
            setMessage(t.areaRequired);
            return;
          }
          setDisplayMode("congestion");
        }} className={`flex-1 rounded-full px-3 py-1.5 text-sm ${displayMode === "congestion" ? "bg-ink text-white" : "text-ink/60"}`}>{t.showCongestion}</button>
      </div>
      <div className="grid items-start gap-3 md:grid-cols-[auto_minmax(0,1fr)_180px_auto]">
        <button type="button" onClick={getCurrentLocation} className="h-10 whitespace-nowrap rounded-full bg-ink px-4 text-sm text-white">{loading ? "..." : t.currentLocation}</button>
        <label className="flex h-10 items-center gap-2 rounded-full border border-ink/15 px-4 text-sm">
          <span className="whitespace-nowrap font-semibold">{t.congestionArea}</span>
          <select value={selectedArea} onChange={(event) => {
            const nextArea = congestionAreas.find((area) => area.value === event.target.value);
            setSelectedArea(nextArea?.value ?? "");
            if (nextArea) {
              setDestinationIds(spots.filter((spot) => isInArea(spot, nextArea)).slice(0, 10).map((spot) => spot.id));
            } else {
              setDestinationIds([]);
              setDisplayMode("route");
            }
          }} className="min-w-0 flex-1 bg-transparent outline-none">
            <option value="">{t.selectArea}</option>
            {congestionAreas.map((area, index) => <option key={area.value} value={area.value}>{areaLabels[index]}</option>)}
          </select>
        </label>
        <fieldset className="rounded-xl border border-ink/15 px-3 pb-2 pt-1"><legend className="px-1 text-xs font-semibold">{t.destinations}</legend><div className="flex max-h-24 flex-wrap gap-x-4 gap-y-1 overflow-y-auto">{spots.map((spot) => <label key={spot.id} className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={destinationIds.includes(spot.id)} onChange={(event) => setDestinationIds((current) => event.target.checked ? [...current, spot.id].slice(0, 10) : current.filter((id) => id !== spot.id))} /><span>{spot.title}{spot.statusOverride?.isTemporarilyClosed ? ` (${t.temporarilyClosed})` : ""}</span></label>)}</div><p className="mt-1 text-xs text-ink/50">{t.selectedSummary(destinationIds.length)}</p></fieldset>
        <fieldset className="rounded-xl border border-ink/15 px-3 pb-2 pt-1 md:col-span-2">
          <legend className="px-1 text-xs font-semibold">{t.travelMode}</legend>
          <div className="flex flex-wrap gap-2">
            {transportModes.map((item, index) => (
              <label key={item} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors ${mode === item ? "border-ink bg-ink text-white" : "border-ink/15 text-ink/70 hover:border-ink/40"}`}>
                <input className="sr-only" type="radio" name="transport-mode" value={item} checked={mode === item} onChange={() => setMode(item)} />
                {transportLabels[index]}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="button" onClick={searchRoute} className="h-10 whitespace-nowrap rounded-full bg-vermilion px-4 text-sm text-white">{t.showRoute}</button>
      </div>
      <button type="button" onClick={() => setShowAiForm((current) => !current)} className="h-9 w-full rounded-full border border-vermilion px-4 text-sm text-vermilion">{t.aiPlan}</button>
      {showAiForm && <div className="rounded-2xl border border-vermilion/20 bg-orange-50 p-4">
        <h2 className="font-semibold text-ink">{t.aiQuestion}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <label className="sm:col-span-2"><span className="mb-1 block text-xs font-semibold">{t.aiInterests}</span><input value={aiInterests} onChange={(event) => setAiInterests(event.target.value)} placeholder={t.aiInterestsPlaceholder} className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm" /></label>
          <label><span className="mb-1 block text-xs font-semibold">{t.aiDays}</span><select value={aiDurationDays} onChange={(event) => setAiDurationDays(Number(event.target.value))} className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm">{[1, 2, 3, 4, 5, 6, 7].map((day) => <option key={day} value={day}>{day}{t.dayUnit}</option>)}</select></label>
          <label><span className="mb-1 block text-xs font-semibold">{t.aiBudget}</span><select value={aiBudget} onChange={(event) => setAiBudget(event.target.value as typeof aiBudget)} className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm"><option value="low">{t.budgetLow}</option><option value="medium">{t.budgetMedium}</option><option value="high">{t.budgetHigh}</option></select></label>
        </div>
        <button type="button" onClick={getAiPlan} className="mt-3 w-full rounded-full bg-vermilion px-4 py-2 text-sm font-semibold text-white">{t.createPlan}</button>
      </div>}
      {(error || message) && <p className="text-sm text-ink/60">{error || message}</p>}
    </div>
    <div className="relative">
      <SpotMapLoader spots={mapSpots} selectedSpotId={destinationIds[0]} route={route?.geometry} currentLocation={location ? [location.latitude, location.longitude] : undefined} currentLocationAccuracy={location?.accuracy} displayMode={displayMode} language={language} />
      {displayMode === "congestion" && <div className="absolute bottom-4 left-4 z-[1000] rounded-xl bg-white/95 p-3 text-xs shadow-md" aria-label={t.congestionLegend}>
        <p className="mb-2 font-semibold text-ink">{t.congestionNearby}</p>
        {["#22c55e", "#facc15", "#f97316", "#dc2626", "#9ca3af"].map((color, index) => <div key={color} className="flex items-center gap-2 leading-5"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />{[t.congestionLow, t.congestionNormal, t.congestionHigh, t.congestionVeryHigh, t.outsideHours][index]}</div>)}
      </div>}
    </div>
    {displayMode === "congestion" && activeArea && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm"><p className="font-semibold">{areaLabels[congestionAreas.findIndex((area) => area.value === activeArea.value)]}{t.congestionNearby}</p><p className="mt-1">{t.congestionDescription(areaSpots.length)}</p><p className="mt-1 text-ink/60">{t.congestionEstimate}（{t[getCongestionTimeSlot()] }）</p><a className="mt-1 inline-block underline" href="https://resas.go.jp/" target="_blank" rel="noreferrer">{t.sourceResas}</a></div>}
    {destinations.length > 0 && <div className="rounded-2xl border border-ink/10 bg-white p-5"><h2 className="font-serif text-2xl">{t.destinationStatus}</h2>{destinations.map((destination) => destination.statusOverride && <div key={destination.id} className="mt-2"><strong>{destination.title}</strong><p className="text-sm">{t.congestionArea}: {congestionLabels[getTimeAdjustedCongestionLevel(destination.statusOverride.congestionLevel, destination.slug) - 1]}</p>{destination.statusOverride.isTemporarilyClosed && <p className="text-sm font-semibold text-vermilion">{t.temporarilyClosed}</p>}{destination.statusOverride.noticeMessage && <p className="text-sm text-ink/70">{destination.statusOverride.noticeMessage}</p>}</div>)}</div>}
    {route && <div className="rounded-2xl border border-ink/10 bg-white p-5"><h2 className="font-serif text-2xl">{t.routeSummary}</h2><ol className="mt-3 space-y-2 text-sm leading-6">{getRouteOverview(mode, route.walkingDistanceMeters, route.transfers, destinations.map((destination) => destination.title), language).map((step, index) => <li key={`${step}-${index}`} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sand text-xs font-semibold text-ink">{index + 1}</span><span>{step}</span></li>)}</ol><div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-ink/10 pt-3 text-xs text-ink/60"><span>{t.duration} {route.durationMinutes}{language === "en" ? " min" : "分"}</span><span>{t.fare} {route.costYen}{language === "en" ? " yen" : "円"}</span><span>{t.walking} {route.walkingDistanceMeters}m</span><span>{t.selectedCount} {destinations.length}</span></div></div>}
    {aiPlan && <div className="rounded-2xl border border-vermilion/20 bg-orange-50 p-5"><h2 className="font-serif text-2xl">{aiPlan.title}</h2><p className="mt-2 text-sm">{aiPlan.summary}</p>{aiPlan.itinerary.map((day) => <div key={day.day} className="mt-3"><strong>{t.dayNumber(day.day)}</strong>{day.slots.map((slot) => <p key={`${slot.time}-${slot.title}`} className="mt-1 text-sm">{slot.time} {slot.title}：{slot.description}</p>)}</div>)}</div>}
  </section>;
}
