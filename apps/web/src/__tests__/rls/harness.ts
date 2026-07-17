/**
 * RLS integration-test harness (Ticket B, 20260716-PLAN-SEC-01).
 *
 * Creates two REAL auth users (A and B) against the local Supabase stack and
 * exposes three PostgREST clients:
 *   - asA / asB: anon-key clients authenticated as each user, so that
 *     `auth.uid()` resolves to two DIFFERENT ids (asserted below — a harness
 *     that authenticates both clients as the same user proves nothing).
 *   - anon: unauthenticated client.
 *
 * Keys come from the environment (from `supabase status`), NEVER hardcoded:
 *   SUPABASE_URL          default http://localhost:54321
 *   ANON_KEY / SUPABASE_ANON_KEY
 *   SERVICE_ROLE_KEY / SUPABASE_SERVICE_ROLE_KEY  (admin: seeding + cleanup only)
 *
 * Cleanup deletes both auth users; public.users rows are removed by the
 * on_auth_user_deleted trigger (migration 012) and scoped rows cascade via FK.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface RlsHarness {
  admin: SupabaseClient;
  asA: SupabaseClient;
  asB: SupabaseClient;
  anon: SupabaseClient;
  userA: { id: string; email: string };
  userB: { id: string; email: string };
  cleanup: () => Promise<void>;
}

function requireEnv(names: string[], fallback?: string): string {
  for (const n of names) {
    const v = process.env[n];
    // `supabase status -o env` quotes its values; strip defensively.
    if (v && v.trim()) return v.trim().replace(/^["']+|["']+$/g, "");
  }
  if (fallback !== undefined) return fallback;
  throw new Error(
    `RLS harness: missing env (${names.join(" | ")}). Run \`supabase status\` and export the keys — do not hardcode them.`,
  );
}

const bare = (u: string) => u.replace(/\/+$/, "");

export async function createRlsHarness(): Promise<RlsHarness> {
  const url = bare(requireEnv(["SUPABASE_URL", "RLS_SUPABASE_URL"], "http://localhost:54321"));
  const anonKey = requireEnv(["ANON_KEY", "SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
  const serviceKey = requireEnv(["SERVICE_ROLE_KEY", "SUPABASE_SERVICE_ROLE_KEY"]);

  const noPersist = { auth: { persistSession: false, autoRefreshToken: false } } as const;
  const admin = createClient(url, serviceKey, noPersist);

  const stamp = Date.now();
  const mkUser = async (label: string) => {
    const email = `rls-${label}-${stamp}@rls-test.local`;
    const password = `rls-${label}-${stamp}-Passw0rd!`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) throw new Error(`createUser ${label}: ${error?.message}`);
    return { id: data.user.id, email, password };
  };

  const a = await mkUser("a");
  const b = await mkUser("b");

  // public.users rows ARE auto-created: handle_new_auth_user (migration 029,
  // SECURITY DEFINER, trigger on auth.users) inserts public.users AND calls
  // init_free_user (which seeds query_credits). Relying on it exercises the
  // real production pipeline instead of a hand insert (which service_role's
  // PostgREST grants may not even allow). Verify both rows landed:
  const { data: seededUsers, error: usersErr } = await admin
    .from("users")
    .select("id")
    .in("id", [a.id, b.id]);
  if (usersErr) throw new Error(`verify public.users trigger seed: ${usersErr.message}`);
  if ((seededUsers?.length ?? 0) !== 2) {
    throw new Error(
      `handle_new_auth_user trigger did not seed public.users (found ${seededUsers?.length ?? 0}/2)`,
    );
  }

  const signIn = async (creds: { email: string; password: string }) => {
    const client = createClient(url, anonKey, noPersist);
    const { data, error } = await client.auth.signInWithPassword(creds);
    if (error || !data.session) throw new Error(`signIn ${creds.email}: ${error?.message}`);
    return client;
  };

  const asA = await signIn(a);
  const asB = await signIn(b);
  const anon = createClient(url, anonKey, noPersist);

  // Blind-spot guard: auth.uid() must resolve to two DIFFERENT users.
  const uidA = (await asA.auth.getUser()).data.user?.id;
  const uidB = (await asB.auth.getUser()).data.user?.id;
  if (!uidA || !uidB || uidA === uidB || uidA !== a.id || uidB !== b.id) {
    throw new Error(`harness sanity failed: uidA=${uidA} uidB=${uidB} (expected ${a.id} / ${b.id})`);
  }

  return {
    admin,
    asA,
    asB,
    anon,
    userA: { id: a.id, email: a.email },
    userB: { id: b.id, email: b.email },
    cleanup: async () => {
      await admin.auth.admin.deleteUser(a.id).catch(() => {});
      await admin.auth.admin.deleteUser(b.id).catch(() => {});
    },
  };
}
