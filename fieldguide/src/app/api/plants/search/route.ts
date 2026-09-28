import { NextRequest, NextResponse } from "next/server";
import { normalizePlant } from "@/lib/plants";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const apiKey = process.env.TREFLE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      plants: [],
      configured: false,
      message: "TREFLE_API_KEY is not configured.",
    });
  }

  if (!query) {
    return NextResponse.json({ plants: [], configured: true });
  }

  const url = new URL("https://trefle.io/api/v1/plants/search");
  url.searchParams.set("q", query);
  url.searchParams.set("token", apiKey);

  try {
    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { plants: [], configured: true, error: "Trefle request failed" },
        { status: response.status },
      );
    }

    const payload = await response.json();
    const plants = Array.isArray(payload?.data)
      ? payload.data.slice(0, 12).map(normalizePlant)
      : [];

    return NextResponse.json({ plants, configured: true });
  } catch (error) {
    return NextResponse.json(
      { plants: [], configured: true, error: "Unable to fetch from Trefle" },
      { status: 500 },
    );
  }
}
