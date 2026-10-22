import { NextResponse } from "next/server";

type IpLocationResponse = {
  success?: boolean;
  latitude?: number;
  longitude?: number;
};

export async function GET(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip")?.trim();
  const endpoint = clientIp
    ? `https://ipwho.is/${encodeURIComponent(clientIp)}`
    : "https://ipwho.is/";

  try {
    const response = await fetch(endpoint, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!response.ok) {
      return NextResponse.json({ error: "Approximate location is unavailable." }, { status: 502 });
    }
    const data = await response.json() as IpLocationResponse;
    if (data.success === false || typeof data.latitude !== "number" || typeof data.longitude !== "number") {
      return NextResponse.json({ error: "Approximate location is unavailable." }, { status: 502 });
    }
    return NextResponse.json({ latitude: data.latitude, longitude: data.longitude, accuracy: 10000 });
  } catch (error) {
    console.error("Failed to resolve approximate location.", error);
    return NextResponse.json({ error: "Approximate location is unavailable." }, { status: 502 });
  }
}
