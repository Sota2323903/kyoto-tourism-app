import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { deleteSpot, updateSpot } from "@/services/admin-spot-service";
import { prisma } from "@/lib/prisma";

function allowed(role?: string) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!allowed(session?.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await context.params;
  const spot = await prisma.spot.findUnique({ where: { id }, include: { translations: true, images: { orderBy: { sortOrder: "asc" } } } });
  return spot ? NextResponse.json(spot) : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!allowed(session?.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await context.params;
    return NextResponse.json(await updateSpot(id, await request.json(), session.user.id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request." }, { status: 400 });
  }
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!allowed(session?.user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const { id } = await context.params;
    await deleteSpot(id, session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete failed." }, { status: 400 });
  }
}
