import type { ImageProvider } from "@/lib/image-provider";

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

export function getAdminConfig(): AdminConfig {
  return { ...inMemoryConfig };
}

export function updateAdminConfig(next: Partial<AdminConfig>): AdminConfig {
  const safePatch: Partial<AdminConfig> = {};
  if (
    next.imageProviderDefault === "auto" ||
    next.imageProviderDefault === "mock" ||
    next.imageProviderDefault === "pollinations" ||
    next.imageProviderDefault === "fal" ||
    next.imageProviderDefault === "gpt-image" ||
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
  inMemoryConfig = {
    ...inMemoryConfig,
    ...safePatch,
  };
  return { ...inMemoryConfig };
}

