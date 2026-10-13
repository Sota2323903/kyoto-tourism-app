import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { getSearchHistory, recordSearchHistory } from "@/services/search-history-service";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await getSearchHistory(session.user.id));
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  const query = body && typeof body === "object" && !Array.isArray(body)
    ? (body as Record<string, unknown>).query
    : undefined;
  if (typeof query !== "string" || !query.trim() || query.length > 200) {
    return NextResponse.json({ error: "A query between 1 and 200 characters is required." }, { status: 400 });
  }
  return NextResponse.json(await recordSearchHistory(session.user.id, query), { status: 201 });
}
