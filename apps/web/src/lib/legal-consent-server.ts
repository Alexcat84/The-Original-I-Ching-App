import { PENDING_EMAIL_LEGAL_METADATA_KEY, type LegalConsentPayload } from "@/lib/legal-consent";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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

export async function clearPendingEmailLegalConsentMetadata(userId: string): Promise<void> {
  const admin = getSupabaseAdmin();
  if (!admin) return;
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data?.user?.user_metadata) return;
  const meta = { ...data.user.user_metadata } as Record<string, unknown>;
  if (!(PENDING_EMAIL_LEGAL_METADATA_KEY in meta)) return;
  delete meta[PENDING_EMAIL_LEGAL_METADATA_KEY];
  await admin.auth.admin.updateUserById(userId, { user_metadata: meta });
}
