import type { ImageProvider } from "@/lib/image-provider";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type { ImageProvider };

export type DefaultResponseMode = "directo" | "ritual" | "profundizar";

export interface AdminConfig {
  imageProviderDefault: ImageProvider;
  responseModeDefault: DefaultResponseMode;
  insightsDefault: boolean;
}

const DEFAULT_CONFIG: AdminConfig = {
  imageProviderDefault: "auto",
  responseModeDefault: "ritual",
  insightsDefault: true,
};

let inMemoryConfig: AdminConfig = { ...DEFAULT_CONFIG };
const ADMIN_CONFIG_ROW_ID = "default";

function applySafePatch(base: AdminConfig, next: Partial<AdminConfig>): AdminConfig {
  const safePatch: Partial<AdminConfig> = {};
  // "pollinations" and "gpt-image" are no longer accepted: their generation
  // paths were removed, so storing them as the default would leave the app
  // pointing at a provider that cannot produce an image.
  if (
    next.imageProviderDefault === "auto" ||
    next.imageProviderDefault === "mock" ||
    next.imageProviderDefault === "fal" ||
    next.imageProviderDefault === "together"
  ) {
    safePatch.imageProviderDefault = next.imageProviderDefault;
  }
  if (
    next.responseModeDefault === "directo" ||
    next.responseModeDefault === "ritual" ||
    next.responseModeDefault === "profundizar"
  ) {
    safePatch.responseModeDefault = next.responseModeDefault;
  }
  if (typeof next.insightsDefault === "boolean") {
    safePatch.insightsDefault = next.insightsDefault;
  }
  return { ...base, ...safePatch };
}

export async function getAdminConfig(): Promise<AdminConfig> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ...inMemoryConfig };

  const { data } = await supabase
    .from("admin_runtime_config")
    .select("image_provider_default, response_mode_default, insights_default")
    .eq("id", ADMIN_CONFIG_ROW_ID)
    .maybeSingle();

  if (!data) {
    return { ...inMemoryConfig };
  }

  inMemoryConfig = applySafePatch(inMemoryConfig, {
    imageProviderDefault: data.image_provider_default as ImageProvider | undefined,
    responseModeDefault: data.response_mode_default as DefaultResponseMode | undefined,
    insightsDefault: typeof data.insights_default === "boolean" ? data.insights_default : undefined,
  });
  return { ...inMemoryConfig };
}

export async function updateAdminConfig(next: Partial<AdminConfig>): Promise<AdminConfig> {
  inMemoryConfig = applySafePatch(inMemoryConfig, next);

  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from("admin_runtime_config").upsert(
      {
        id: ADMIN_CONFIG_ROW_ID,
        image_provider_default: inMemoryConfig.imageProviderDefault,
        response_mode_default: inMemoryConfig.responseModeDefault,
        insights_default: inMemoryConfig.insightsDefault,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  }

  return { ...inMemoryConfig };
}

