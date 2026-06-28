"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type GateState = "checking" | "allowed" | "denied";

interface Props {
  children: React.ReactNode;
}

/**
 * Dual-tier gate: ?cid= → auth + ownership (free OK); manual → Seeker+.
 */
export function MutationExplorerAccessGate({ children }: Props) {
  const [state, setState] = useState<GateState>("checking");
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkedRef = useRef(false);
  const cid = searchParams.get("cid");

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    async function check() {
      try {
        const supabase = getSupabaseBrowser();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          router.replace("/");
          return;
        }

        if (cid) {
          const res = await fetch(
            `/api/mutation-explorer/consultation?cid=${encodeURIComponent(cid)}`,
            {
              headers: { Authorization: `Bearer ${session.access_token}` },
              cache: "no-store",
            },
          );
          if (res.ok) {
            setState("allowed");
          } else {
            setState("denied");
            router.replace("/");
          }
          return;
        }

        const res = await fetch("/api/library/access", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });

        if (res.ok) {
          setState("allowed");
        } else {
          setState("denied");
          router.replace("/");
        }
      } catch {
        setState("denied");
        router.replace("/");
      }
    }

    void check();
  }, [router, cid]);

  if (state === "checking") {
    return (
      <div className="library-access-gate--checking" aria-busy="true" aria-live="polite">
        <div className="library-access-gate__spinner" />
      </div>
    );
  }

  if (state === "denied") return null;

  return <>{children}</>;
}
