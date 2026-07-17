/**
 * QA code: TS-WEB-016 rls-cross-user-isolation · v1.0.0
 * Area: apps/web (RLS Supabase, 9 tablas user-scoped)
 * Family: WEB
 */
/**
 * Cross-user RLS isolation (Ticket B, 20260716-PLAN-SEC-01; closes the P1-2 of
 * EXT-SEC-02 §3: "RLS activo" is not the same as "RLS correcto").
 *
 * For EVERY user-scoped table, with a row seeded as property of user A
 * (via service role, bypassing RLS):
 *   1. Positive control: A reads their own row (policy not over-restrictive).
 *   2. READ isolation (the critical one): B SELECTing A's rows gets an EMPTY
 *      result — not an error. RLS filters silently; a test that expects a
 *      throw here would pass without proving anything.
 *   3. WRITE isolation: B's UPDATE and DELETE against A's row affect 0 rows,
 *      and the row is verified intact afterwards via service role.
 *   4. No session: the anon client sees no rows.
 *
 * Load-bearing cases (money and private oracle content) are explicit:
 * query_credits, consultations, consultation_notes.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createRlsHarness, type RlsHarness } from "./harness";

let h: RlsHarness;

/** Per-table seed + a benign column for the UPDATE probe. */
interface TableCase {
  table: string;
  scopeCol: string; // column that the policy compares against auth.uid()
  seed: (ownerId: string) => Promise<Record<string, unknown>>;
  updatePatch: Record<string, unknown>;
}

const CASES: TableCase[] = [
  {
    table: "users",
    scopeCol: "id",
    // Row already seeded by the harness (public.users for A).
    seed: async (ownerId) => ({ id: ownerId }),
    updatePatch: { display_name: "rls-probe" },
  },
  {
    table: "consultation_sessions",
    scopeCol: "user_id",
    seed: async (ownerId) => {
      const { data, error } = await h.admin
        .from("consultation_sessions")
        .insert({ user_id: ownerId })
        .select()
        .single();
      if (error) throw new Error(`seed consultation_sessions: ${error.message}`);
      return data;
    },
    updatePatch: { theme_category: "rls-probe" },
  },
  {
    table: "consultations",
    scopeCol: "user_id",
    seed: async (ownerId) => {
      const { data: session, error: sErr } = await h.admin
        .from("consultation_sessions")
        .insert({ user_id: ownerId })
        .select()
        .single();
      if (sErr) throw new Error(`seed session for consultations: ${sErr.message}`);
      const { data, error } = await h.admin
        .from("consultations")
        .insert({
          user_id: ownerId,
          session_id: session.id,
          question: "rls seed question",
          lines: [7, 8, 7, 8, 7, 8],
          primary_hexagram_number: 1,
          primary_hexagram_name: "Khien",
          primary_hexagram_chinese: "乾",
          changing_lines: [],
          mutation_rule: "none",
          interpretation: "rls seed interpretation",
        })
        .select()
        .single();
      if (error) throw new Error(`seed consultations: ${error.message}`);
      return data;
    },
    updatePatch: { category: "rls-probe" },
  },
  {
    table: "consultation_notes",
    scopeCol: "user_id",
    seed: async (ownerId) => {
      const { data: session } = await h.admin
        .from("consultation_sessions")
        .insert({ user_id: ownerId })
        .select()
        .single();
      const { data: consultation, error: cErr } = await h.admin
        .from("consultations")
        .insert({
          user_id: ownerId,
          session_id: session!.id,
          question: "rls note seed",
          lines: [7, 8, 7, 8, 7, 8],
          primary_hexagram_number: 2,
          primary_hexagram_name: "Khwan",
          primary_hexagram_chinese: "坤",
          changing_lines: [],
          mutation_rule: "none",
          interpretation: "seed",
        })
        .select()
        .single();
      if (cErr) throw new Error(`seed consultation for notes: ${cErr.message}`);
      const { data, error } = await h.admin
        .from("consultation_notes")
        .insert({ user_id: ownerId, consultation_id: consultation.id, note: "private note" })
        .select()
        .single();
      if (error) throw new Error(`seed consultation_notes: ${error.message}`);
      return data;
    },
    updatePatch: { note: "rls-probe" },
  },
  {
    table: "pattern_analyses",
    scopeCol: "user_id",
    seed: async (ownerId) => {
      const { data, error } = await h.admin
        .from("pattern_analyses")
        .insert({ user_id: ownerId, analysis_text: "seed", consultations_analyzed: 1 })
        .select()
        .single();
      if (error) throw new Error(`seed pattern_analyses: ${error.message}`);
      return data;
    },
    updatePatch: { analysis_text: "rls-probe" },
  },
  {
    table: "query_credits",
    scopeCol: "user_id",
    // Row is auto-created by the REAL pipeline: handle_new_auth_user ->
    // init_free_user seeds the free-tier credits on signup. Verify it exists
    // instead of inserting (a hand insert would collide with the PK).
    seed: async (ownerId) => {
      const { data, error } = await h.admin
        .from("query_credits")
        .select("*")
        .eq("user_id", ownerId)
        .single();
      if (error || !data) {
        throw new Error(`query_credits not auto-seeded by init_free_user: ${error?.message}`);
      }
      return data;
    },
    updatePatch: { credits_total: 999999 }, // the attack that matters: minting tokens
  },
  {
    table: "two_factor_recovery_codes",
    scopeCol: "user_id",
    seed: async (ownerId) => {
      const { data, error } = await h.admin
        .from("two_factor_recovery_codes")
        .insert({ user_id: ownerId, code_hash: "seed-hash" })
        .select()
        .single();
      if (error) throw new Error(`seed two_factor_recovery_codes: ${error.message}`);
      return data;
    },
    updatePatch: { code_hash: "rls-probe" },
  },
  {
    table: "two_factor_attempts",
    scopeCol: "user_id",
    seed: async (ownerId) => {
      const { data, error } = await h.admin
        .from("two_factor_attempts")
        .insert({ user_id: ownerId, ip_address: "127.0.0.1", success: false })
        .select()
        .single();
      if (error) throw new Error(`seed two_factor_attempts: ${error.message}`);
      return data;
    },
    updatePatch: { success: true },
  },
  {
    table: "two_factor_email_codes",
    scopeCol: "user_id",
    seed: async (ownerId) => {
      const { data, error } = await h.admin
        .from("two_factor_email_codes")
        .insert({
          user_id: ownerId,
          code_hash: "seed-hash",
          expires_at: new Date(Date.now() + 600_000).toISOString(),
        })
        .select()
        .single();
      if (error) throw new Error(`seed two_factor_email_codes: ${error.message}`);
      return data;
    },
    updatePatch: { code_hash: "rls-probe" },
  },
];

beforeAll(async () => {
  h = await createRlsHarness();
});

afterAll(async () => {
  await h?.cleanup();
});

describe.each(CASES)("RLS isolation: $table", ({ table, scopeCol, seed, updatePatch }) => {
  it("enforces cross-user isolation (A owns, B and anon denied)", async () => {
    await seed(h.userA.id);

    // 1) Positive control: A reads their own row(s).
    const own = await h.asA.from(table).select("*").eq(scopeCol, h.userA.id);
    expect(own.error, `A reading own ${table}: ${own.error?.message}`).toBeNull();
    expect(own.data?.length ?? 0, `positive control failed: A cannot read own ${table}`).toBeGreaterThan(0);

    // 2) READ isolation: B selecting A's rows gets EMPTY (no error, no rows).
    const cross = await h.asB.from(table).select("*").eq(scopeCol, h.userA.id);
    expect(cross.error, `B reading A's ${table} must not error: ${cross.error?.message}`).toBeNull();
    expect(cross.data, `B must receive an empty result for A's ${table}`).toEqual([]);

    // 3) WRITE isolation: B's UPDATE affects 0 rows...
    const upd = await h.asB.from(table).update(updatePatch).eq(scopeCol, h.userA.id).select();
    expect(upd.data ?? [], `B's UPDATE on A's ${table} must affect 0 rows`).toEqual([]);

    // ...B's DELETE affects 0 rows...
    const del = await h.asB.from(table).delete().eq(scopeCol, h.userA.id).select();
    expect(del.data ?? [], `B's DELETE on A's ${table} must affect 0 rows`).toEqual([]);

    // ...and A's row is verified intact via service role.
    const intact = await h.admin.from(table).select("*").eq(scopeCol, h.userA.id);
    expect(intact.error).toBeNull();
    expect(intact.data?.length ?? 0, `${table} row vanished or was mutated cross-user`).toBeGreaterThan(0);
    for (const [k, v] of Object.entries(updatePatch)) {
      const touched = (intact.data ?? []).some((row: Record<string, unknown>) => row[k] === v);
      expect(touched, `B's update leaked into A's ${table}.${k}`).toBe(false);
    }

    // 4) No session: anon sees nothing (empty result or auth error, never rows).
    const anon = await h.anon.from(table).select("*").eq(scopeCol, h.userA.id);
    expect(anon.data?.length ?? 0, `anon client can read ${table}`).toBe(0);
  });
});
