import { NextResponse } from "next/server";
import { getAllHexagramRecords } from "@iching-oracle/iching-data";

export const dynamic = "force-static";

export async function GET() {
  const hexagrams = getAllHexagramRecords();
  return NextResponse.json(hexagrams, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
    },
  });
}
