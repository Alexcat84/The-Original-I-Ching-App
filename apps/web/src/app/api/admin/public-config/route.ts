import { NextResponse } from "next/server";
import { getAdminConfig } from "@/lib/admin-config";

export const runtime = "nodejs";

export async function GET() {
  const config = await getAdminConfig();
  return NextResponse.json({
    ok: true,
    config: {
      imageProviderDefault: config.imageProviderDefault,
      responseModeDefault: config.responseModeDefault,
      insightsDefault: config.insightsDefault,
    },
  });
}

