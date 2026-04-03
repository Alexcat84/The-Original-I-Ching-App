import { FREE_SESSION_LIMIT, getSessionLimit } from "@/lib/token-packs";

export type BillingTier = "free" | "seeker" | "practitioner" | "master";
export type CreditsNoticeReason = "credits_depleted" | "free_lifetime_depleted" | "billing_unavailable";

export type CreditsNoticeAction = "open_plans" | "sync-billing" | "mailto";
export type CreditsNoticeCta = { label: string; action: CreditsNoticeAction; href?: string };
export type CreditsNoticeCopy = {
  title: string;
  body: string;
  resetLine: string;
  primaryCta: CreditsNoticeCta;
  secondaryCta?: CreditsNoticeCta;
};

export function tierToBillingTierCopy(tier: string): BillingTier {
  if (tier === "tokens_seeker_20" || tier === "seeker") return "seeker";
  if (tier === "tokens_practitioner_40" || tier === "practitioner") return "practitioner";
  if (tier === "tokens_master_100" || tier === "master") return "master";
  return "free";
}

export function creditsExhaustedBlock(tier: BillingTier, reason: CreditsNoticeReason): CreditsNoticeCopy {
  if (reason === "billing_unavailable") {
    return {
      title: "No pudimos validar tu saldo de tokens",
      body: "Hubo un problema temporal al sincronizar tu estado de cuenta.",
      resetLine: "Actualiza estado y vuelve a intentar en unos segundos.",
      primaryCta: { label: "Actualizar estado", action: "sync-billing" },
    };
  }

  if (reason === "credits_depleted") {
    return {
      title: "Has agotado todos tus tokens",
      body: "Te invitamos a recargar para seguir disfrutando de los beneficios del oráculo.",
      resetLine: `Límite por hilo actual: ${getSessionLimit(
        tier === "master"
          ? "tokens_master_100"
          : tier === "practitioner"
            ? "tokens_practitioner_40"
            : tier === "seeker"
              ? "tokens_seeker_20"
              : "free",
      )} ${tier === "free" ? "pregunta" : "preguntas"}.`,
      primaryCta: { label: "Comprar tokens", action: "open_plans" },
    };
  }

  switch (tier) {
    case "free":
      return {
        title: "Has usado tus consultas gratuitas",
        body: "Tus 2 consultas gratuitas de por vida ya fueron usadas.",
        resetLine: `Límite por hilo en free: ${FREE_SESSION_LIMIT} pregunta.`,
        primaryCta: { label: "Comprar tokens", action: "open_plans" },
      };
    case "seeker":
      return {
        title: "Has usado tus tokens disponibles",
        body: "Tu saldo actual no alcanza para otra consulta.",
        resetLine: `Límite por hilo con Seeker Pack: ${getSessionLimit("tokens_seeker_20")} preguntas.`,
        primaryCta: { label: "Comprar más tokens", action: "open_plans" },
      };
    case "practitioner":
      return {
        title: "Has usado tus tokens disponibles",
        body: "Tu saldo actual no alcanza para otra consulta.",
        resetLine: `Límite por hilo con Practitioner Pack: ${getSessionLimit("tokens_practitioner_40")} preguntas.`,
        primaryCta: { label: "Comprar más tokens", action: "open_plans" },
      };
    case "master":
      return {
        title: "Has usado tus tokens disponibles",
        body: "Tu saldo actual no alcanza para otra consulta.",
        resetLine: `Límite por hilo con Master Pack: ${getSessionLimit("tokens_master_100")} preguntas.`,
        primaryCta: { label: "Comprar más tokens", action: "open_plans" },
      };
  }
}
