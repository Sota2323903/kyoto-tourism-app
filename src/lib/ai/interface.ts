export type AiLanguage = "ja" | "en" | "zh" | "ko";
export type AiBudgetLevel = "low" | "medium" | "high";

export interface AiPlanRequest {
  language: AiLanguage;
  userPreferences: {
    interests: string[];
    durationDays: number;
    budgetLevel?: AiBudgetLevel;
    startingLocation?: string;
  };
  availableSpots: {
    id: string;
    name: string;
    category: string;
    address: string;
  }[];
}

export interface AiPlanResponse {
  title: string;
  summary: string;
  generatedByAi?: boolean;
  factChecked?: boolean;
  disclaimer?: string;
  itinerary: {
    day: number;
    slots: {
      time: string;
      spotId?: string;
      title: string;
      description: string;
    }[];
  }[];
}

export interface AIProvider {
  generateTouristPlan(request: AiPlanRequest): Promise<AiPlanResponse>;
}
