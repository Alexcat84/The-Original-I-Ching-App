import * as AppleAuthentication from "expo-apple-authentication";

export class AppleSignInError extends Error {
  readonly code: string | undefined;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AppleSignInError";
    this.code = code;
  }
}

export type AppleSupabaseSession = {
  access_token: string;
  refresh_token: string;
  email: string | null;
};

export async function isAppleSignInAvailable(): Promise<boolean> {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

export async function signInWithAppleSupabase(params: {
  supabaseUrl: string;
  supabaseAnonKey: string;
}): Promise<AppleSupabaseSession> {
  let credential: AppleAuthentication.AppleAuthenticationCredential;
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: string }).code === "ERR_REQUEST_CANCELED"
    ) {
      throw new AppleSignInError("cancelled", "ERR_REQUEST_CANCELED");
    }
    throw err;
  }

  if (!credential.identityToken) {
    throw new AppleSignInError("No identity token from Apple");
  }

  const res = await fetch(`${params.supabaseUrl}/auth/v1/token?grant_type=id_token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: params.supabaseAnonKey,
      Authorization: `Bearer ${params.supabaseAnonKey}`,
    },
    body: JSON.stringify({
      provider: "apple",
      id_token: credential.identityToken,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new AppleSignInError(
      `Supabase Apple auth failed (${res.status})`,
      body.slice(0, 120) || undefined,
    );
  }

  const data = (await res.json()) as {
    access_token?: string;
    refresh_token?: string;
    user?: { email?: string };
  };

  if (!data.access_token) {
    throw new AppleSignInError("No access_token in Supabase response");
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? "",
    email: data.user?.email ?? null,
  };
}
