import { NextResponse } from "next/server";

import { listPublishedSpots } from "@/services/spot-service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordSearchHistory } from "@/services/search-history-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const session = await getServerSession(authOptions);
  const query = searchParams.get("q") ?? "";
  if (session?.user?.id && query.trim()) await recordSearchHistory(session.user.id, query);
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("pageSize") ?? "20");

  if (!Number.isInteger(page) || !Number.isInteger(pageSize)) {
    return NextResponse.json({ error: "page and pageSize must be integers." }, { status: 400 });
  }

  const result = await listPublishedSpots({
    regionId: searchParams.get("regionId") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    language: searchParams.get("language") ?? undefined,
    query: query || undefined,
    page,
    pageSize,
  });

  return NextResponse.json(result);
}
