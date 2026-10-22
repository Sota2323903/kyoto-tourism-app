import { NextResponse } from "next/server";

import type { AiBudgetLevel, AiLanguage, AiPlanResponse } from "@/lib/ai/interface";
import { BedrockProvider } from "@/lib/ai/bedrockProvider";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const languages = new Set<AiLanguage>(["ja", "en", "zh", "ko"]);
const budgets = new Set<AiBudgetLevel>(["low", "medium", "high"]);
const planCache = new Map<string, { expiresAt: number; plan: Awaited<ReturnType<BedrockProvider["generateTouristPlan"]>> }>();
const cacheTtlMs = 5 * 60 * 1000;
let bedrockQuotaBlockedUntil = 0;
const maxInterests = 10;
const maxInterestLength = 100;
const maxTotalInterestLength = 500;
const maxStartingLocationLength = 200;

function createFallbackPlan(
  language: AiLanguage,
  durationDays: number,
  interests: string[],
  spots: Array<{ id: string; name: string; category: string; address: string }>,
): AiPlanResponse {
  const labels = {
    ja: { title: "京都おすすめプラン", summary: "AIサービスが利用できないため、登録スポットから自動作成したプランです。", description: "登録スポットを順番に巡る、基本の観光プランです。" },
    en: { title: "Kyoto suggested itinerary", summary: "AI is unavailable, so this itinerary was created from registered spots.", description: "A basic itinerary visiting the registered spots in order." },
    zh: { title: "京都推荐行程", summary: "由于 AI 服务暂时无法使用，此行程根据已登记的景点自动生成。", description: "按顺序游览已登记景点的基础行程。" },
    ko: { title: "교토 추천 일정", summary: "AI 서비스를 사용할 수 없어 등록된 명소로 자동 생성한 일정입니다.", description: "등록된 명소를 순서대로 둘러보는 기본 일정입니다." },
  }[language];
  const selectedSpots = spots.filter((spot) => interests.some((interest) => `${spot.name} ${spot.category}`.toLowerCase().includes(interest.toLowerCase()))).concat(
    spots.filter((spot) => !interests.some((interest) => `${spot.name} ${spot.category}`.toLowerCase().includes(interest.toLowerCase()))),
  ).slice(0, Math.max(1, durationDays * 3));
  return {
    title: labels.title,
    summary: labels.summary,
    generatedByAi: false,
    factChecked: false,
    disclaimer: "このプランは登録スポット情報をもとにした参考案です。営業時間・料金・交通情報は公式情報をご確認ください。",
    itinerary: Array.from({ length: durationDays }, (_, index) => ({
      day: index + 1,
      slots: selectedSpots.slice(index * 3, index * 3 + 3).map((spot, slotIndex) => ({
        time: ["09:00", "13:00", "17:00"][slotIndex],
        spotId: spot.id,
        title: spot.name,
        description: labels.description,
      })),
    })),
  };
}

function isQuotaErrorMessage(message: string) {
  return /(?:\b429\b|quota|resource_exhausted|free_tier)/i.test(message);
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be an object." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const language = input.language ?? "ja";
  const durationDays = input.durationDays ?? 1;
  const interests = input.interests ?? [];
  if (
    typeof language !== "string" ||
    !languages.has(language as AiLanguage) ||
    typeof durationDays !== "number" ||
    !Number.isInteger(durationDays) ||
    durationDays < 1 ||
    durationDays > 7 ||
    !Array.isArray(interests) ||
    interests.length > maxInterests ||
    !interests.every((interest) => typeof interest === "string" && interest.trim().length > 0 && interest.length <= maxInterestLength) ||
    interests.reduce((total, interest) => total + (typeof interest === "string" ? interest.length : 0), 0) > maxTotalInterestLength
  ) {
    return NextResponse.json({ error: "Invalid language, interests, or durationDays." }, { status: 400 });
  }
  const budgetLevel = input.budgetLevel;
  if (budgetLevel !== undefined && (typeof budgetLevel !== "string" || !budgets.has(budgetLevel as AiBudgetLevel))) {
    return NextResponse.json({ error: "Invalid budgetLevel." }, { status: 400 });
  }
  const startingLocation = input.startingLocation;
  if (startingLocation !== undefined && (typeof startingLocation !== "string" || startingLocation.length > maxStartingLocationLength)) {
    return NextResponse.json({ error: "Invalid startingLocation." }, { status: 400 });
  }

  let availableSpots: Array<{ id: string; name: string; category: string; address: string }> = [];
  let cacheKey = "";
  try {
    const spots = await prisma.spot.findMany({
      where: { isPublished: true },
      take: 30,
      select: {
        id: true,
        name: true,
        category: true,
        address: true,
        translations: { where: { language }, take: 1, select: { name: true } },
      },
    });
    availableSpots = spots.map((spot) => ({
      id: spot.id,
      name: spot.translations[0]?.name ?? spot.name,
      category: spot.category,
      address: spot.address ?? "",
    }));
    cacheKey = JSON.stringify({
      language,
      interests,
      durationDays,
      budgetLevel,
      startingLocation,
      spotIds: availableSpots.map((spot) => spot.id),
    });
    const cached = planCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return NextResponse.json(cached.plan);

    if (bedrockQuotaBlockedUntil > Date.now()) {
      const fallbackPlan = createFallbackPlan(
        language as AiLanguage,
        durationDays as number,
        (interests as string[]).map((interest) => interest.trim()),
        availableSpots,
      );
      return NextResponse.json({ ...fallbackPlan, fallback: true });
    }

    const plan = await new BedrockProvider().generateTouristPlan({
      language: language as AiLanguage,
      userPreferences: {
        interests: (interests as string[]).map((interest) => interest.trim()),
        durationDays: durationDays as number,
        budgetLevel: budgetLevel as AiBudgetLevel | undefined,
        startingLocation: typeof startingLocation === "string" ? startingLocation.trim() : undefined,
      },
      availableSpots,
    });
    const ids = new Set(availableSpots.map((spot) => spot.id));
    if (plan.itinerary.some((day) => day.day < 1 || day.day > (durationDays as number) ||
      day.slots.some((slot) => slot.spotId !== undefined && !ids.has(slot.spotId)))) {
      return NextResponse.json({ error: "AI returned an unavailable spot." }, { status: 502 });
    }
    const safePlan = {
      ...plan,
      generatedByAi: true,
      factChecked: false,
      disclaimer: "AIによる参考提案です。営業時間・料金・交通情報などは必ず公式情報をご確認ください。",
    };
    planCache.set(cacheKey, { plan: safePlan, expiresAt: Date.now() + cacheTtlMs });
    if (planCache.size > 100) planCache.delete(planCache.keys().next().value as string);
    return NextResponse.json(safePlan);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const quotaExceeded = isQuotaErrorMessage(message);
    if (quotaExceeded) {
      const retryDelayMatch = message.match(/retryDelay["']?\s*[:=]\s*["']?(\d+(?:\.\d+)?)s/i) ??
        message.match(/retry in (\d+(?:\.\d+)?)(?:s| seconds?)/i);
      const retryDelayMs = retryDelayMatch ? Number(retryDelayMatch[1]) * 1000 : 60 * 60 * 1000;
      bedrockQuotaBlockedUntil = Date.now() + retryDelayMs;
      console.warn(`Bedrock quota exceeded; using local itinerary fallback for approximately ${Math.ceil(retryDelayMs / 60000)} minutes.`);
      const fallbackPlan = createFallbackPlan(
        language as AiLanguage,
        durationDays as number,
        (interests as string[]).map((interest) => interest.trim()),
        availableSpots,
      );
      planCache.set(cacheKey, { plan: fallbackPlan, expiresAt: Date.now() + cacheTtlMs });
      return NextResponse.json({ ...fallbackPlan, fallback: true });
    }
    console.error("Failed to generate AI tourist plan.", error);
    const temporarilyUnavailable = /(?:\b429\b|\b500\b|\b503\b|high demand|temporarily unavailable|unavailable)/i.test(message);
    return NextResponse.json(
      { error: temporarilyUnavailable ? "AIサービスが混雑しています。しばらくしてからもう一度お試しください。" : "Failed to generate tourist plan." },
      { status: temporarilyUnavailable ? 503 : 502, headers: temporarilyUnavailable ? { "Retry-After": "5" } : undefined },
    );
  }
}
