import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type RevenueCatAliasGraph = {
  canonicalAppUserId: string;
  allAppUserIds: string[];
};

function cleanId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const s = value.trim();
  return s.length > 0 ? s : null;
}

function uniq(ids: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const id of ids) {
    const s = cleanId(id);
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export function canonicalFromAliasGraph(input: {
  appUserId?: unknown;
  originalAppUserId?: unknown;
  aliases?: unknown;
}): RevenueCatAliasGraph | null {
  const appUserId = cleanId(input.appUserId);
  const originalAppUserId = cleanId(input.originalAppUserId);
  const aliasList = Array.isArray(input.aliases)
    ? input.aliases
        .map((v) => cleanId(v))
        .filter((v): v is string => Boolean(v))
    : [];
  const all = uniq([appUserId, originalAppUserId, ...aliasList]);
  if (all.length === 0) return null;

  const anon =
    all.find((id) => id.startsWith("$RCAnonymousID:")) ??
    (appUserId?.startsWith("$RCAnonymousID:") ? appUserId : null) ??
    (originalAppUserId?.startsWith("$RCAnonymousID:") ? originalAppUserId : null);
  const canonical = anon ?? originalAppUserId ?? appUserId ?? all[0];
  if (!canonical) return null;
  return { canonicalAppUserId: canonical, allAppUserIds: all };
}

export async function upsertRevenueCatAliasGraph(graph: RevenueCatAliasGraph): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const from = supabase.from("revenuecat_customer_aliases") as unknown as {
    upsert?: (rows: unknown, options?: { onConflict?: string }) => Promise<{ error?: { message?: string } | null }>;
  };
  if (typeof from.upsert !== "function") {
    return;
  }
  const now = new Date().toISOString();
  const rows = graph.allAppUserIds.map((id) => ({
    app_user_id: id,
    canonical_app_user_id: graph.canonicalAppUserId,
    source: "webhook",
    updated_at: now,
  }));
  const { error } = await from.upsert(rows, { onConflict: "app_user_id" });
  if (error) {
    console.warn("[revenuecat-alias-map] upsert failed", error.message);
  }
}

export async function lookupCanonicalRevenueCatAppUserId(appUserId: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const id = cleanId(appUserId);
  if (!id) return null;
  const from = supabase.from("revenuecat_customer_aliases") as unknown as {
    select?: (columns: string) => {
      eq: (column: string, value: string) => { maybeSingle: () => Promise<{ data?: unknown; error?: { message?: string } | null }> };
    };
  };
  if (typeof from.select !== "function") {
    return null;
  }
  const { data, error } = await from
    .select("canonical_app_user_id")
    .eq("app_user_id", id)
    .maybeSingle();
  if (error) {
    console.warn("[revenuecat-alias-map] lookup failed", error.message);
    return null;
  }
  return cleanId((data as { canonical_app_user_id?: unknown } | null)?.canonical_app_user_id);
}

