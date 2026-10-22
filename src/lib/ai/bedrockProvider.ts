import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

import type { AIProvider, AiPlanRequest, AiPlanResponse } from "./interface";

const modelId = process.env.BEDROCK_MODEL_ID;
const maxAttempts = 3;
const requestTimeoutMs = 15_000;
const maxOutputTokens = 1_200;
const maxSpotsPromptLength = 12_000;

function isTransientModelError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    $metadata?: { httpStatusCode?: number };
    name?: string;
    message?: string;
  };
  const status = candidate.$metadata?.httpStatusCode;
  return status === 429 || status === 500 || status === 503 ||
    /(?:\b429\b|\b500\b|\b503\b|throttl|serviceunavailable|temporarily unavailable|unavailable)/i.test(
      `${candidate.name ?? ""} ${candidate.message ?? ""}`,
    );
}

function isQuotaError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as {
    $metadata?: { httpStatusCode?: number };
    name?: string;
    message?: string;
  };
  return candidate.$metadata?.httpStatusCode === 429 ||
    /(?:quota|throttl|resource.?exhausted|too many requests)/i.test(
      `${candidate.name ?? ""} ${candidate.message ?? ""}`,
    );
}

function isPlanResponse(value: unknown): value is AiPlanResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const plan = value as Record<string, unknown>;
  if (typeof plan.title !== "string" || plan.title.length > 200 ||
    typeof plan.summary !== "string" || plan.summary.length > 2_000 ||
    !Array.isArray(plan.itinerary) || plan.itinerary.length > 7) {
    return false;
  }
  return plan.itinerary.every((day) => {
    if (!day || typeof day !== "object" || Array.isArray(day)) return false;
    const item = day as Record<string, unknown>;
    return Number.isInteger(item.day) && Array.isArray(item.slots) && item.slots.length <= 10 &&
      item.slots.every((slot) => {
        if (!slot || typeof slot !== "object" || Array.isArray(slot)) return false;
        const entry = slot as Record<string, unknown>;
        return typeof entry.time === "string" && entry.time.length <= 50 &&
          typeof entry.title === "string" && entry.title.length <= 200 &&
          typeof entry.description === "string" && entry.description.length <= 1_000 &&
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
    const firstObject = normalized.indexOf("{");
    const lastObject = normalized.lastIndexOf("}");
    if (firstObject < 0 || lastObject <= firstObject) throw new Error("Bedrock returned invalid JSON.");
    try {
      parsed = JSON.parse(normalized.slice(firstObject, lastObject + 1));
    } catch {
      throw new Error("Bedrock returned invalid JSON.");
    }
  }
  if (!isPlanResponse(parsed)) throw new Error("Bedrock returned an invalid plan structure.");
  return parsed;
}

export class BedrockProvider implements AIProvider {
  private readonly client: BedrockRuntimeClient;

  constructor() {
    if (!modelId) throw new Error("BEDROCK_MODEL_ID is not configured.");
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION,
    });
  }

  async generateTouristPlan(request: AiPlanRequest): Promise<AiPlanResponse> {
    const availableSpots = request.availableSpots.map((spot) => ({
      id: spot.id.slice(0, 100),
      name: spot.name.slice(0, 200),
      category: spot.category.slice(0, 100),
      address: spot.address.slice(0, 300),
    }));
    const boundedSpots: typeof availableSpots = [];
    for (const spot of availableSpots) {
      const candidate = JSON.stringify([...boundedSpots, spot]);
      if (candidate.length > maxSpotsPromptLength) break;
      boundedSpots.push(spot);
    }
    const prompt = [
      "Create a Kyoto tourist itinerary using only the supplied spots.",
      "Do not provide disaster, weather, evacuation, or other safety alerts; those come from official sources.",
      "Return JSON only, with no Markdown.",
      `Language: ${request.language}`,
      `Interests: ${request.userPreferences.interests.join(", ") || "general sightseeing"}`,
      `Duration: ${request.userPreferences.durationDays} day(s)`,
      `Budget: ${request.userPreferences.budgetLevel ?? "medium"}`,
      `Starting location: ${request.userPreferences.startingLocation ?? "not specified"}`,
      `Available spots: ${JSON.stringify(boundedSpots)}`,
      'Schema: {"title":string,"summary":string,"itinerary":[{"day":number,"slots":[{"time":string,"spotId":string optional,"title":string,"description":string}]}]}',
    ].join("\n");

    let lastError: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        const response = await this.client.send(new ConverseCommand({
          modelId,
          messages: [{ role: "user", content: [{ text: prompt }] }],
          inferenceConfig: { maxTokens: maxOutputTokens },
          additionalModelRequestFields: {
            thinking: { type: "disabled" },
          },
        }), { abortSignal: AbortSignal.timeout(requestTimeoutMs) });
        const text = response.output?.message?.content?.find((content) => content.text)?.text;
        if (!text) throw new Error("Bedrock returned an empty response.");
        return parseResponse(text);
      } catch (error) {
        lastError = error;
        if (isQuotaError(error) || !isTransientModelError(error) || attempt === maxAttempts - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
    throw lastError instanceof Error ? lastError : new Error("Bedrock request failed.");
  }
}
