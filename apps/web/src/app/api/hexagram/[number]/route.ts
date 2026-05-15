import { NextResponse } from "next/server";
import { getHexagramRecordByNumber } from "@iching-oracle/iching-data";

export const dynamic = "force-static";

export function generateStaticParams() {
  return Array.from({ length: 64 }, (_, i) => ({ number: String(i + 1) }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ number: string }> }
) {
  const resolvedParams = await params;
  const number = parseInt(resolvedParams.number, 10);
  if (isNaN(number) || number < 1 || number > 64) {
    return NextResponse.json({ error: "Invalid hexagram number" }, { status: 400 });
  }

  try {
    const hexagram = getHexagramRecordByNumber(number);
    return NextResponse.json(hexagram, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Hexagram not found" }, { status: 404 });
  }
}
