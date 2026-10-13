const congestionTimeAdjustments = [
  { start: 6, end: 9, adjustment: -1 },
  { start: 9, end: 12, adjustment: 0 },
  { start: 12, end: 15, adjustment: 1 },
  { start: 15, end: 18, adjustment: 1 },
  { start: 18, end: 21, adjustment: 0 },
] as const;

function stableVariation(slug: string, hour: number) {
  const hash = [...slug].reduce((value, character) => value + character.charCodeAt(0), hour);
  return (hash % 3) - 1;
}

export function getTimeAdjustedCongestionLevel(baseLevel = 2, slug = "", now = new Date()) {
  const hour = now.getHours();
  const period = congestionTimeAdjustments.find(({ start, end }) => hour >= start && hour < end);
  const adjustment = period?.adjustment ?? -1;
  return Math.min(4, Math.max(1, Math.round(baseLevel) + adjustment + stableVariation(slug, hour)));
}

export function getCongestionTimeSlot(now = new Date()) {
  const hour = now.getHours();
  if (hour < 6) return "night";
  if (hour < 9) return "morning";
  if (hour < 12) return "lateMorning";
  if (hour < 15) return "lunch";
  if (hour < 18) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}
