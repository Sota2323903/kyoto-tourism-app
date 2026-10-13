import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const spots = await prisma.spot.findMany({ orderBy: { name: "asc" } });
  const header = "regionId,slug,category,latitude,longitude,address,name_ja,description_ja,instagramUrl,xUrl,officialUrl";
  const rows = spots.map((spot) =>
    [spot.regionId, spot.slug, spot.category, spot.latitude, spot.longitude, spot.address, spot.name, spot.description, spot.instagramUrl, spot.xUrl, spot.officialUrl]
      .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
      .join(","),
  );
  return new NextResponse([header, ...rows].join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="spots.csv"' },
  });
}
