import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/**
 * Liveness check for load balancers / monitoring. No auth, no secrets.
 */
export async function GET() {
  const environment = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        environment,
        database: "not_configured",
      },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("users").select("id").limit(1);
  if (error) {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        environment,
        database: "unreachable",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment,
    database: "ok",
  });
}
