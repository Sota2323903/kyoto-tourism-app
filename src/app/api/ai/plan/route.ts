import { NextResponse } from "next/server";

import type { AiBudgetLevel, AiLanguage } from "@/lib/ai/interface";
import { GeminiProvider } from "@/lib/ai/geminiProvider";
import { prisma } from "@/lib/prisma";

const languages = new Set<AiLanguage>(["ja", "en", "zh", "ko"]);
const budgets = new Set<AiBudgetLevel>(["low", "medium", "high"]);
const planCache = new Map<string, { expiresAt: number; plan: Awaited<ReturnType<GeminiProvider["generateTouristPlan"]>> }>();
const cacheTtlMs = 5 * 60 * 1000;

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
    interests.length > 10 ||
    !interests.every((interest) => typeof interest === "string" && interest.trim().length > 0)
  ) {
    return NextResponse.json({ error: "Invalid language, interests, or durationDays." }, { status: 400 });
  }
  const budgetLevel = input.budgetLevel;
  if (budgetLevel !== undefined && (typeof budgetLevel !== "string" || !budgets.has(budgetLevel as AiBudgetLevel))) {
    return NextResponse.json({ error: "Invalid budgetLevel." }, { status: 400 });
  }
  const startingLocation = input.startingLocation;
  if (startingLocation !== undefined && (typeof startingLocation !== "string" || startingLocation.length > 200)) {
    return NextResponse.json({ error: "Invalid startingLocation." }, { status: 400 });
  }

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
    const availableSpots = spots.map((spot) => ({
      id: spot.id,
      name: spot.translations[0]?.name ?? spot.name,
      category: spot.category,
      address: spot.address ?? "",
    }));
    const cacheKey = JSON.stringify({
      language,
      interests,
      durationDays,
      budgetLevel,
      startingLocation,
      spotIds: availableSpots.map((spot) => spot.id),
    });
    const cached = planCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return NextResponse.json(cached.plan);

    const plan = await new GeminiProvider().generateTouristPlan({
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
    planCache.set(cacheKey, { plan, expiresAt: Date.now() + cacheTtlMs });
    if (planCache.size > 100) planCache.delete(planCache.keys().next().value as string);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Failed to generate AI tourist plan.", error);
    return NextResponse.json({ error: "Failed to generate tourist plan." }, { status: 502 });
  }
}
