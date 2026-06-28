import { NextResponse, type NextRequest } from "next/server";
import {
  encodeCastIndex,
  maskFromChangingLines,
} from "@iching-oracle/iching-engine";
import { getAuthenticatedUser } from "@/lib/auth/bearer-user";
import { getSeekerPlusAccess } from "@/lib/auth/seeker-plus-access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { ConsultationExploreContext } from "@/lib/mutation-explorer/explore-mutation";

export const runtime = "nodejs";

type StoredLine = {
  position: number;
  value: number;
};

function parseLines(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice()
    .sort((a, b) => (a as StoredLine).position - (b as StoredLine).position)
    .map((l) => (l as StoredLine).value);
}

/**
 * GET /api/mutation-explorer/consultation?cid={uuid}
 * Seeker+ required (same gate as library) plus ownership check.
 */
export async function GET(req: NextRequest) {
  const authUser = await getAuthenticatedUser(req);
  if (!authUser) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

  const access = await getSeekerPlusAccess(authUser);
  if (!access.allowed) {
    const status = access.reason === "upgrade_required" ? 403 : 500;
    return NextResponse.json({ error: access.reason }, { status });
  }

  const cid = req.nextUrl.searchParams.get("cid");
  if (!cid) {
    return NextResponse.json({ error: "cid_required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("consultations")
    .select(
      "id, session_id, session_position, question, lines, primary_hexagram_number, transformed_hexagram_number, changing_lines, mutation_rule, line_reading_system, translator, created_at, user_id",
    )
    .eq("id", cid)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
  if (!data || data.user_id !== authUser.userId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const lineValues = parseLines(data.lines);
  const lineReadingSystem =
    data.line_reading_system === "zhuxi" ? "zhuxi" : "huang";
  const castIndex = encodeCastIndex(
    data.primary_hexagram_number,
    maskFromChangingLines(data.changing_lines ?? []),
  );

  const translatorRaw = data.translator ?? "wilhelm";
  const translator =
    translatorRaw === "legge" ||
    translatorRaw === "zhouyi" ||
    translatorRaw === "master_combined"
      ? translatorRaw
      : "wilhelm";

  const body: ConsultationExploreContext = {
    consultationId: data.id,
    sessionId: data.session_id ?? "",
    sessionPosition: data.session_position,
    question: data.question,
    primaryHexagram: data.primary_hexagram_number,
    transformedHexagram: data.transformed_hexagram_number,
    changingLines: data.changing_lines ?? [],
    lines: lineValues,
    mutationRule: data.mutation_rule,
    lineReadingSystem,
    translator,
    castIndex,
    createdAt: data.created_at ?? new Date().toISOString(),
  };

  return NextResponse.json(body);
}
