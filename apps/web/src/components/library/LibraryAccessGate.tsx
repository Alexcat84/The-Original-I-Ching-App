"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

type GateState = "checking" | "allowed" | "denied";

interface Props {
  children: React.ReactNode;
}

/**
 * Client-side auth gate for library pages.
 * Calls /api/library/access with the stored Bearer token.
 * Shows a loading skeleton while checking; redirects to "/" if denied.
 * Content is only revealed after the server confirms Seeker+ access.
 */
export function LibraryAccessGate({ children }: Props) {
  const [state, setState] = useState<GateState>("checking");
  const router = useRouter();
  const checkedRef = useRef(false);

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

        const res = await fetch("/api/library/access", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });

        if (res.ok) {
          setState("allowed");
        } else {
          setState("denied");
          router.replace("/chat");
        }
      } catch {
        setState("denied");
        router.replace("/chat");
      }
    }

    void check();
  }, [router]);

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
