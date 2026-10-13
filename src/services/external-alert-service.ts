import { NotificationType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const defaultWarningUrl = "https://www.jma.go.jp/bosai/warning/data/warning/260000.json";

type JmaWarning = {
  code?: string;
  status?: string;
};

type JmaResponse = {
  reportDatetime?: string;
  areaTypes?: Array<{ areas?: Array<{ code?: string; warnings?: JmaWarning[] }> }>;
};

const warningNames: Record<string, string> = {
  "10": "大雨警報", "12": "洪水警報", "13": "暴風警報", "14": "暴風雪警報", "15": "大雪警報",
  "21": "大雨注意報", "22": "洪水注意報", "23": "風雪注意報", "24": "雷注意報", "25": "強風注意報",
  "26": "波浪注意報", "27": "融雪注意報", "28": "洪水注意報", "29": "濃霧注意報", "30": "乾燥注意報",
  "31": "なだれ注意報", "32": "低温注意報", "33": "霜注意報", "34": "着雪注意報",
};

export interface OfficialAlert {
  sourceId: string;
  type: NotificationType;
  titleJa: string;
  contentJa: string;
  titleEn: string;
  contentEn: string;
}

function isActiveWarning(warning: JmaWarning) {
  return warning.status === "発表" || warning.status === "継続";
}

function warningName(code?: string) {
  return (code && warningNames[code]) ?? `気象警報・注意報（コード${code ?? "不明"}）`;
}

export async function fetchOfficialWeatherAndDisasterAlerts(): Promise<OfficialAlert[]> {
  const endpoint = process.env.JMA_WARNING_URL ?? defaultWarningUrl;
  const response = await fetch(endpoint, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: 300 },
  });
  if (!response.ok) throw new Error(`Official alert request failed with status ${response.status}.`);

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as JmaResponse).areaTypes)) {
    throw new Error("Official alert response has an unexpected format.");
  }
  const jmaResponse = payload as JmaResponse;
  const warnings = (jmaResponse.areaTypes ?? []).flatMap((areaType) =>
    (areaType.areas ?? []).flatMap((area) =>
      (area.warnings ?? []).map((warning) => ({ areaCode: area.code, warning })),
    ),
  );

  return warnings.filter(({ warning }) => isActiveWarning(warning)).map(({ areaCode, warning }) => {
      const name = warningName(warning.code);
      const area = "京都府";
      const sourceId = `jma-warning:${areaCode ?? "unknown"}:${warning.code ?? "unknown"}`;
      return {
        sourceId,
        type: NotificationType.WEATHER,
        titleJa: `${area}に${name}が発表されています`,
        contentJa: `気象庁の公式防災情報です（発表時刻: ${jmaResponse.reportDatetime ?? "不明"}）。最新情報を確認し、安全を優先して行動してください。`,
        titleEn: `${name} issued for ${area}`,
        contentEn: "This is official information from the Japan Meteorological Agency. Check the latest updates and put safety first.",
      };
    });
}

export async function syncOfficialAlertsToNotifications() {
  const alerts = await fetchOfficialWeatherAndDisasterAlerts();
  const results = [];

  for (const alert of alerts) {
    const translations = [
      { language: "ja", title: alert.titleJa, content: alert.contentJa },
      { language: "en", title: alert.titleEn, content: alert.contentEn },
    ];
    const existing = await prisma.notification.findUnique({ where: { sourceId: alert.sourceId } });
    if (existing) {
      results.push(
        await prisma.$transaction([
          prisma.notification.update({ where: { id: existing.id }, data: { type: alert.type } }),
          ...translations.map((translation) =>
            prisma.notificationTranslation.upsert({
              where: { notificationId_language: { notificationId: existing.id, language: translation.language } },
              create: {
                ...translation,
                notification: { connect: { id: existing.id } },
              },
              update: { title: translation.title, content: translation.content },
            }),
          ),
        ]),
      );
      continue;
    }
    results.push(
      await prisma.notification.create({
        data: {
          sourceId: alert.sourceId,
          type: alert.type,
          translations: { create: translations },
        },
      }),
    );
  }

  return results;
}

export async function upsertSpotStatus(input: {
  spotId: string;
  isTemporarilyClosed: boolean;
  congestionLevel: number;
  noticeMessage?: string;
}) {
  if (!Number.isInteger(input.congestionLevel) || input.congestionLevel < 1 || input.congestionLevel > 4) {
    throw new Error("congestionLevel must be an integer between 1 and 4.");
  }
  return prisma.spotStatusOverride.upsert({
    where: { spotId: input.spotId },
    create: input,
    update: input,
  });
}
