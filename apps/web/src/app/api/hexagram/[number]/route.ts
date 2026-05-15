import { NextResponse } from "next/server";
import { getHexagram } from "@iching-oracle/iching-engine";

export async function GET(
  request: Request,
  { params }: { params: { number: string } }
) {
  const number = parseInt(params.number, 10);
  if (isNaN(number) || number < 1 || number > 64) {
    return NextResponse.json({ error: "Invalid hexagram number" }, { status: 400 });
  }

  try {
    const hexagram = getHexagram(number);
    return NextResponse.json(hexagram, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Hexagram not found" }, { status: 404 });
  }
}
