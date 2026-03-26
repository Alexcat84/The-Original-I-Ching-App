import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Liveness check for load balancers / monitoring. No auth, no secrets.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
  });
}
