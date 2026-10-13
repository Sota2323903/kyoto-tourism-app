import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toggleFavorite, getUserFavorites } from "@/services/favorite-service";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.spotId !== "string" || !body.spotId.trim()) {
    return NextResponse.json({ error: "Spot ID is required." }, { status: 400 });
  }
  return NextResponse.json(await toggleFavorite(session.user.id, body.spotId));
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const language = new URL(request.url).searchParams.get("language") ?? "ja";
  return NextResponse.json(await getUserFavorites(session.user.id, language));
}
