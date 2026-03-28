import { redirect } from "next/navigation";

export default function PricingPage() {
  const plansUrl = process.env.NEXT_PUBLIC_PLANS_URL?.trim() ?? "";
  const safeExternal =
    plansUrl.length > 0 &&
    plansUrl !== "/pricing" &&
    plansUrl !== "pricing" &&
    !plansUrl.startsWith("/pricing?");

  redirect(safeExternal ? plansUrl : "/guia#planes");
}
