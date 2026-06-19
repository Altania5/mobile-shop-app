import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

const serverUrl = process.env.SERVER_URL ?? "http://localhost:5000";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const url = new URL("/api/booking-requests", serverUrl);
  if (status) url.searchParams.set("status", status);
  url.searchParams.set("limit", "100");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json({ error: body.msg ?? "Server error" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Cannot reach the booking server. Make sure the Express server is running on port 5000." },
      { status: 503 }
    );
  }
}
