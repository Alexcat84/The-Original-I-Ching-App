import { NextResponse } from "next/server";

export const runtime = "nodejs";

function isAllowedR2Url(parsed: URL): boolean {
  if (parsed.protocol !== "https:") return false;
  const host = parsed.hostname.toLowerCase().replace(/\.$/, "");
  // Only exact r2.dev subdomains — prevents evil-r2.dev bypass
  return host === "r2.dev" || host.endsWith(".r2.dev");
}

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

  if (!isAllowedR2Url(parsed)) {
    return NextResponse.json({ error: "not_allowed" }, { status: 403 });
  }

  // Disable redirect following — a redirect to an internal IP would bypass the allowlist
  const upstream = await fetch(url, { cache: "no-store", redirect: "manual" });
  if (upstream.status >= 300) {
    return NextResponse.json({ error: "redirect_not_allowed" }, { status: 502 });
  }
  if (!upstream.ok) {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
  const buffer = await upstream.arrayBuffer();

  // Sanitize filename to prevent header injection
  const rawName = parsed.pathname.split("/").pop() ?? "image.jpg";
  const safeName = rawName.replace(/[^A-Za-z0-9._-]/g, "_").slice(0, 100) || "image.jpg";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
