/** Postgres / Supabase uuid columns reject client-side ids like `local-*` or `sess-*`. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isPersistableUuid(id: string | null | undefined): id is string {
  return typeof id === "string" && UUID_RE.test(id);
}
