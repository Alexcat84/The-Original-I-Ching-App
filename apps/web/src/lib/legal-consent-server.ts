import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { LegalConsentPayload } from "@/lib/legal-consent";

export async function recordUserLegalAcceptance(userId: string, payload: LegalConsentPayload): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("supabase_not_configured");
  }

  const { error } = await supabase.from("user_legal_acceptances").insert(
    {
      user_id: userId,
      terms_version: payload.termsVersion,
      privacy_version: payload.privacyVersion,
      accepted_at: payload.acceptedAt,
      accepted_via: payload.source,
    },
  );

  if (error?.code === "23505") return;
  if (error) {
    throw new Error(error.message);
  }
}
