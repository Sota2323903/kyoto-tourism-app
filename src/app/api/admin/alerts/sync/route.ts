import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { syncOfficialAlertsToNotifications } from "@/services/external-alert-service";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const notifications = await syncOfficialAlertsToNotifications();
    return NextResponse.json({ synced: notifications.length });
  } catch (error) {
    console.error("Failed to sync official alerts.", error);
    return NextResponse.json({ error: "Failed to sync official alerts." }, { status: 502 });
  }
}
