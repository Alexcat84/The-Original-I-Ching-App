/** User-facing copy when monthly consultation credits are exhausted (marketing tone, Spanish). */

export type BillingTier = "free" | "seeker" | "practitioner" | "master" | "oracle";
export type CreditsNoticeReason = "credits_depleted" | "period_expired" | "free_lifetime_depleted" | "billing_unavailable";

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
): { title: string; body: string; resetLine: string; primaryCta: string } {
  if (reason === "billing_unavailable") {
    return {
      title: "No pudimos validar tu estado de suscripción",
      body: "Hubo un problema temporal al sincronizar tu suscripción con billing.",
      resetLine: "Actualiza estado desde el Centro de suscripción y vuelve a intentar en unos segundos.",
      primaryCta: "Actualizar estado",
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
          primaryCta: "Ver planes y reactivar",
        };
      }
      return {
        title: "Llegaste al límite del plan gratuito",
        body: `Ya usaste tus ${limit} consultas de prueba (lifetime). Para seguir consultando, debes activar un plan premium.`,
        resetLine: "El plan Free no se reinicia por ciclo: las consultas de prueba son únicas.",
        primaryCta: "Ver planes y ampliar",
      };
    case "seeker":
      if (reason === "period_expired") {
        return {
          title: "Tu suscripción expiró",
          body: "Tu plan Seeker terminó al final del período y ya no está activo.",
          resetLine: "Para recuperar tus consultas mensuales, reactiva tu plan o elige uno superior.",
          primaryCta: "Reactivar plan",
        };
      }
      return {
        title: "Consultas del mes agotadas",
        body: `Has usado las ${limit} consultas de tu plan Seeker. Puedes subir de plan para más cupo o esperar a que se renueve el ciclo.`,
        resetLine,
        primaryCta: "Explorar planes superiores",
      };
    case "practitioner":
      if (reason === "period_expired") {
        return {
          title: "Tu suscripción expiró",
          body: "Tu plan Practitioner terminó al final del período y dejó de estar activo.",
          resetLine: "Reactiva el plan para recuperar el cupo mensual de consultas.",
          primaryCta: "Reactivar plan",
        };
      }
      return {
        title: "Cupo mensual completado",
        body: `Tu plan Practitioner ya alcanzó las ${limit} consultas de este ciclo. Un plan superior te da más margen si lo necesitas ahora.`,
        resetLine,
        primaryCta: "Ver opciones de upgrade",
      };
    case "master":
      if (reason === "period_expired") {
        return {
          title: "Tu suscripción expiró",
          body: "Tu plan Master ya no está activo porque llegó al final de su vigencia.",
          resetLine: "Reactívalo para volver a disponer del cupo mensual de consultas.",
          primaryCta: "Reactivar plan",
        };
      }
      return {
        title: "Límite mensual alcanzado",
        body: `En este ciclo usaste las ${limit} consultas del plan Master. Si quieres aún más volumen, revisa el plan Oracle.`,
        resetLine,
        primaryCta: "Conocer plan Oracle",
      };
    case "oracle":
      if (reason === "period_expired") {
        return {
          title: "Tu suscripción expiró",
          body: "Tu plan Oracle terminó al final del período y dejó de estar activo.",
          resetLine: "Renueva tu suscripción para recuperar el cupo de consultas.",
          primaryCta: "Renovar suscripción",
        };
      }
      return {
        title: "Consultas del período agotadas",
        body: `Has utilizado las ${limit} consultas de tu plan en este ciclo. Si necesitas ampliar el cupo, contacta soporte o revisa opciones comerciales.`,
        resetLine,
        primaryCta: "Más información",
      };
  }
}
