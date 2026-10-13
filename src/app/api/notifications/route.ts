import { NextResponse } from "next/server";
import { getNotifications } from "@/services/notification-service";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const limit = Number(params.get("limit") ?? "10");
  if (!Number.isInteger(limit) || limit < 1) return NextResponse.json({ error: "limit must be a positive integer." }, { status: 400 });
  return NextResponse.json(await getNotifications(params.get("language") ?? "ja", limit));
}
