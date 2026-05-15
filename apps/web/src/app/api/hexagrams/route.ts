import { NextResponse } from "next/server";
import { getHexagram } from "@iching-oracle/iching-engine";

export const dynamic = "force-static";

export async function GET() {
  const hexagrams = [];
  for (let i = 1; i <= 64; i++) {
    hexagrams.push(getHexagram(i));
  }
  return NextResponse.json(hexagrams, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
