import { redirect } from "next/navigation";

export default function PricingPage() {
  const plansUrl = process.env.NEXT_PUBLIC_PLANS_URL?.trim() ?? "";
  let loopsToPricing = false;
  if (plansUrl.length > 0) {
    if (plansUrl === "/pricing" || plansUrl === "pricing" || plansUrl.startsWith("/pricing?")) {
      loopsToPricing = true;
    } else {
      try {
        const parsed = new URL(plansUrl);
        const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
        loopsToPricing = pathname === "/pricing";
      } catch {
        loopsToPricing = false;
      }
    }
  }

  const safeExternal = plansUrl.length > 0 && !loopsToPricing;

  redirect(safeExternal ? plansUrl : "/guia#planes");
}
