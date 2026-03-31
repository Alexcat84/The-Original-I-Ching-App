/** User-facing copy when monthly consultation credits are exhausted (marketing tone, Spanish). */

export type BillingTier = "free" | "seeker" | "practitioner" | "master" | "oracle";
export type CreditsNoticeReason =
  | "credits_depleted"
  | "period_expired"
  | "free_lifetime_depleted"
  | "billing_unavailable"
  | "grace_exhausted";

export type CreditsNoticeAction = "open_plans" | "sync-billing" | "mailto";
export type CreditsNoticeCta = { label: string; action: CreditsNoticeAction; href?: string };
export type CreditsNoticeCopy = {
  title: string;
  body: string;
  resetLine: string;
  primaryCta: CreditsNoticeCta;
  secondaryCta?: CreditsNoticeCta;
};

/** Map stored billing tier (incl. Seeker variants) to copy bucket. */
export function tierToBillingTierCopy(tier: string): BillingTier {
  if (tier === "seeker_monthly" || tier === "seeker_annual" || tier === "seeker") return "seeker";
  if (tier === "practitioner" || tier === "master" || tier === "oracle" || tier === "free") return tier;
  return "free";
}

function formatResetDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" });
}

export function creditsExhaustedBlock(
  tier: BillingTier,
  limit: number,
  cycleEndsAt: string | null,
  reason: CreditsNoticeReason,
): CreditsNoticeCopy {
  if (reason === "grace_exhausted") {
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
    return {
      title: "Estamos trabajando en ello",
      body:
        "Estamos experimentando una falla técnica temporal al validar tu suscripción. No te preocupes — tus créditos y consultas están asegurados y no se han perdido. Por favor intenta de nuevo en unos minutos.",
      resetLine: "Si persiste, actualiza estado o contacta soporte.",
      primaryCta: { label: "Actualizar estado", action: "sync-billing" },
      secondaryCta: {
        label: "Contactar soporte",
        action: "mailto",
        href: supportEmail ? `mailto:${supportEmail}` : "mailto:support@theoriginaliching.com",
      },
    };
  }

  if (reason === "billing_unavailable") {
    return {
      title: "No pudimos validar tu estado de suscripción",
      body: "Hubo un problema temporal al sincronizar tu suscripción con billing.",
      resetLine: "Actualiza estado desde el Centro de suscripción y vuelve a intentar en unos segundos.",
      primaryCta: { label: "Actualizar estado", action: "sync-billing" },
    };
  }

  const reset = formatResetDate(cycleEndsAt);
  const resetLine = reset
    ? `Tu ciclo actual termina el ${reset}. Entonces vuelven a cargarse tus consultas del mes.`
    : "Cada mes se renueva tu cupo de consultas según tu plan.";

  switch (tier) {
    case "free":
      if (reason === "period_expired") {
        return {
          title: "Tu período de suscripción terminó",
          body: "Tu suscripción anterior expiró y tu cuenta volvió al plan Free.",
          resetLine: "El plan Free incluye un cupo de prueba lifetime. Para continuar sin límites de prueba, activa un plan.",
          primaryCta: { label: "Ver planes y reactivar", action: "open_plans" },
        };
      }
      return {
        title: "Llegaste al límite del plan gratuito",
        body: `Ya usaste tus ${limit} consultas de prueba (lifetime). Para seguir consultando, debes activar un plan premium.`,
        resetLine: "El plan Free no se reinicia por ciclo: las consultas de prueba son únicas.",
        primaryCta: { label: "Ver planes y ampliar", action: "open_plans" },
      };
    case "seeker":
      if (reason === "period_expired") {
        return {
          title: "Tu suscripción expiró",
          body: "Tu plan Seeker terminó al final del período y ya no está activo.",
          resetLine: "Para recuperar tus consultas mensuales, reactiva tu plan o elige uno superior.",
          primaryCta: { label: "Reactivar plan", action: "open_plans" },
        };
      }
      return {
        title: "Consultas del mes agotadas",
        body: `Has usado las ${limit} consultas de tu plan Seeker. Puedes subir de plan para más cupo o esperar a que se renueve el ciclo.`,
        resetLine,
        primaryCta: { label: "Explorar planes superiores", action: "open_plans" },
      };
    case "practitioner":
      if (reason === "period_expired") {
        return {
          title: "Tu suscripción expiró",
          body: "Tu plan Practitioner terminó al final del período y dejó de estar activo.",
          resetLine: "Reactiva el plan para recuperar el cupo mensual de consultas.",
          primaryCta: { label: "Reactivar plan", action: "open_plans" },
        };
      }
      return {
        title: "Cupo mensual completado",
        body: `Tu plan Practitioner ya alcanzó las ${limit} consultas de este ciclo. Un plan superior te da más margen si lo necesitas ahora.`,
        resetLine,
        primaryCta: { label: "Ver opciones de upgrade", action: "open_plans" },
      };
    case "master":
      if (reason === "period_expired") {
        return {
          title: "Tu suscripción expiró",
          body: "Tu plan Master ya no está activo porque llegó al final de su vigencia.",
          resetLine: "Reactívalo para volver a disponer del cupo mensual de consultas.",
          primaryCta: { label: "Reactivar plan", action: "open_plans" },
        };
      }
      return {
        title: "Límite mensual alcanzado",
        body: `En este ciclo usaste las ${limit} consultas del plan Master. Si quieres aún más volumen, revisa el plan Oracle.`,
        resetLine,
        primaryCta: { label: "Conocer plan Oracle", action: "open_plans" },
      };
    case "oracle":
      if (reason === "period_expired") {
        return {
          title: "Tu suscripción expiró",
          body: "Tu plan Oracle terminó al final del período y dejó de estar activo.",
          resetLine: "Renueva tu suscripción para recuperar el cupo de consultas.",
          primaryCta: { label: "Renovar suscripción", action: "open_plans" },
        };
      }
      return {
        title: "Consultas del período agotadas",
        body: `Has utilizado las ${limit} consultas de tu plan en este ciclo. Si necesitas ampliar el cupo, contacta soporte o revisa opciones comerciales.`,
        resetLine,
        primaryCta: { label: "Más información", action: "open_plans" },
      };
  }
}
