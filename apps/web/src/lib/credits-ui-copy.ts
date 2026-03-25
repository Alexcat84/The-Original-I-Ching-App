/** User-facing copy when monthly consultation credits are exhausted (marketing tone, Spanish). */

export type BillingTier = "free" | "seeker" | "practitioner" | "master" | "oracle";

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
): { title: string; body: string; resetLine: string; primaryCta: string } {
  const reset = formatResetDate(cycleEndsAt);
  const resetLine = reset
    ? `Tu ciclo actual termina el ${reset}. Entonces vuelven a cargarse tus consultas del mes.`
    : "Cada mes se renueva tu cupo de consultas según tu plan.";

  switch (tier) {
    case "free":
      return {
        title: "Llegaste al límite del plan gratuito",
        body: `Este mes ya usaste las ${limit} consultas incluidas. Si quieres seguir consultando sin esperar, puedes pasar a un plan con más lecturas y funciones.`,
        resetLine,
        primaryCta: "Ver planes y ampliar",
      };
    case "seeker":
      return {
        title: "Consultas del mes agotadas",
        body: `Has usado las ${limit} consultas de tu plan Seeker. Puedes subir de plan para más cupo o esperar a que se renueve el ciclo.`,
        resetLine,
        primaryCta: "Explorar planes superiores",
      };
    case "practitioner":
      return {
        title: "Cupo mensual completado",
        body: `Tu plan Practitioner ya alcanzó las ${limit} consultas de este ciclo. Un plan superior te da más margen si lo necesitas ahora.`,
        resetLine,
        primaryCta: "Ver opciones de upgrade",
      };
    case "master":
      return {
        title: "Límite mensual alcanzado",
        body: `En este ciclo usaste las ${limit} consultas del plan Master. Si quieres aún más volumen, revisa el plan Oracle.`,
        resetLine,
        primaryCta: "Conocer plan Oracle",
      };
    case "oracle":
      return {
        title: "Consultas del período agotadas",
        body: `Has utilizado las ${limit} consultas de tu plan en este ciclo. Si necesitas ampliar el cupo, contacta soporte o revisa opciones comerciales.`,
        resetLine,
        primaryCta: "Más información",
      };
  }
}
