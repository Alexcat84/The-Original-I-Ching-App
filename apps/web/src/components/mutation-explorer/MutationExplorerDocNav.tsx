"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  backLabel: string;
};

/** Hide top oracle nav when verifying a saved consultation (?cid=). */
export function MutationExplorerDocNav({ backLabel }: Props) {
  const cid = useSearchParams().get("cid");
  if (cid) return null;

  return (
    <nav className="doc-nav">
      <Link href="/chat">{backLabel}</Link>
    </nav>
  );
}
