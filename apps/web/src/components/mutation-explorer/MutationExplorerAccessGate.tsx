"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type GateState = "checking" | "allowed" | "denied";

interface Props {
  children: React.ReactNode;
}

/**
 * Seeker+ gate (same as library). With ?cid=, also verifies consultation ownership.
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
          router.replace("/chat");
          return;
        }

        const authHeaders = {
          Authorization: `Bearer ${session.access_token}`,
        };

        const accessRes = await fetch("/api/library/access", {
          headers: authHeaders,
          cache: "no-store",
        });
        if (!accessRes.ok) {
          setState("denied");
          router.replace("/chat");
          return;
        }

        if (cid) {
          const res = await fetch(
            `/api/mutation-explorer/consultation?cid=${encodeURIComponent(cid)}`,
            { headers: authHeaders, cache: "no-store" },
          );
          if (res.ok) {
            setState("allowed");
          } else {
            setState("denied");
            router.replace("/chat");
          }
          return;
        }

        setState("allowed");
      } catch {
        setState("denied");
        router.replace("/chat");
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
