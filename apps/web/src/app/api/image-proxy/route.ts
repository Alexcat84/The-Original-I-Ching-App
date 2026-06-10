import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_HOST = "r2.dev";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "missing_url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  // Only proxy from Cloudflare R2 public domain — prevents open-proxy abuse
  if (!parsed.hostname.endsWith(ALLOWED_HOST)) {
    return NextResponse.json({ error: "not_allowed" }, { status: 403 });
  }

  const filename = parsed.pathname.split("/").pop() ?? "image.jpg";

  const upstream = await fetch(url, { cache: "no-store" });
  if (!upstream.ok) {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
  const buffer = await upstream.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
