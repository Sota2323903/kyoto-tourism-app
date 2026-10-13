import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { importSpotsFromCsv, type CsvSpotRow } from "@/services/spot-import-service";

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const parseLine = (line: string) => {
    const values: string[] = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index++) {
      const char = line[index];
      if (char === '"' && line[index + 1] === '"') { value += '"'; index++; }
      else if (char === '"') quoted = !quoted;
      else if (char === "," && !quoted) { values.push(value); value = ""; }
      else value += char;
    }
    values.push(value);
    return values;
  };
  const headers = parseLine(lines[0]);
  return lines.slice(1).map((line) => Object.fromEntries(headers.map((header, index) => [header, parseLine(line)[index] ?? ""])));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user.role ?? "")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const rows = parseCsv(await request.text()) as unknown as CsvSpotRow[];
    return NextResponse.json(await importSpotsFromCsv(rows));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed." }, { status: 400 });
  }
}
