import { redirect } from "next/navigation";

export default function PricingPage() {
  const plansUrl = process.env.NEXT_PUBLIC_PLANS_URL?.trim();
  redirect(plansUrl || "/guia#planes");
}
