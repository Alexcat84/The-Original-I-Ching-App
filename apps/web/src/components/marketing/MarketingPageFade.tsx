"use client";

import { usePathname } from "next/navigation";

/**
 * Per-navigation fade-in for marketing pages. The marketing site has no shared
 * route-group layout, so each page mounts its own `.mk-root`; without this the
 * new page would pop in after the (now dark) loading hold. Keying the wrapper on
 * the pathname forces a fresh mount on every client navigation — including
 * doc→doc, where `MarketingDocShell` is otherwise reused — so the CSS fade
 * replays each time. Opacity-only (no transform/filter) to keep the sticky nav
 * intact; the animation is disabled inside the APK WebView via CSS
 * (`html.iching-rn-webview .mk-page-fade`), where doc pages load by full reload.
 */
export function MarketingPageFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="mk-page-fade">
      {children}
    </div>
  );
}
