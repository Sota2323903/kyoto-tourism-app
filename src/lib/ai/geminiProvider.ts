import { GoogleGenAI } from "@google/genai";

import type { AIProvider, AiPlanRequest, AiPlanResponse } from "./interface";

const model = "gemini-3.8-flash";

function isPlanResponse(value: unknown): value is AiPlanResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const plan = value as Record<string, unknown>;
  if (typeof plan.title !== "string" || typeof plan.summary !== "string" || !Array.isArray(plan.itinerary)) {
    return false;
  }
  return plan.itinerary.every((day) => {
    if (!day || typeof day !== "object" || Array.isArray(day)) return false;
    const item = day as Record<string, unknown>;
    return Number.isInteger(item.day) && Array.isArray(item.slots) &&
      item.slots.every((slot) => {
        if (!slot || typeof slot !== "object" || Array.isArray(slot)) return false;
        const entry = slot as Record<string, unknown>;
        return typeof entry.time === "string" &&
          typeof entry.title === "string" &&
          typeof entry.description === "string" &&
          (entry.spotId === undefined || typeof entry.spotId === "string");
      });
  });
}

function parseResponse(text: string): AiPlanResponse {
  const normalized = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(normalized);
  } catch {
    throw new Error("Gemini returned invalid JSON.");
  }
  if (!isPlanResponse(parsed)) throw new Error("Gemini returned an invalid plan structure.");
  return parsed;
}

export class GeminiProvider implements AIProvider {
  private readonly ai: GoogleGenAI;

  constructor(apiKey = process.env.GEMINI_API_KEY) {
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async generateTouristPlan(request: AiPlanRequest): Promise<AiPlanResponse> {
    const prompt = [
      "Create a Kyoto tourist itinerary using only the supplied spots.",
      "Do not provide disaster, weather, evacuation, or other safety alerts; those come from official sources.",
      "Return JSON only, with no Markdown.",
      `Language: ${request.language}`,
      `Interests: ${request.userPreferences.interests.join(", ") || "general sightseeing"}`,
      `Duration: ${request.userPreferences.durationDays} day(s)`,
      `Budget: ${request.userPreferences.budgetLevel ?? "medium"}`,
      `Starting location: ${request.userPreferences.startingLocation ?? "not specified"}`,
      `Available spots: ${JSON.stringify(request.availableSpots)}`,
      'Schema: {"title":string,"summary":string,"itinerary":[{"day":number,"slots":[{"time":string,"spotId":string optional,"title":string,"description":string}]}]}',
    ].join("\n");

    const response = await this.ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });
    const text = response.text;
    if (!text) throw new Error("Gemini returned an empty response.");
    return parseResponse(text);
  }
}
