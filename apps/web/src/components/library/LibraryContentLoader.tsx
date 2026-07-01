"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { HexagramTabs, type ResolvedLineLabels } from "@/components/library/HexagramTabs";
import type { LibraryPageUiSerialized } from "@iching-oracle/i18n";
import type { LibraryDetailCommentary, LibraryDetailRecords } from "@/lib/library/library-data";
import type { TranslatorId } from "@iching-oracle/iching-data";

interface MutationEntry {
  position: number;
  toNumber: number;
  toGlyph: string;
  toChineseName: string;
  toPinyin: string;
  toEnglishName: string;
  label: string;
}

interface SourceMeta {
  edition: string;
  sourceUrl: string;
}

interface Props {
  hexagramNumber: number;
  messages: LibraryPageUiSerialized;
  lineLabels: ResolvedLineLabels;
  mutationsHeading: string;
  mutationsIntro: string;
  /** Pre-computed mutation labels from the server (UI strings, not translations). */
  resolvedMutations: MutationEntry[];
}

type LoadState = "loading" | "ready" | "denied";

interface DetailPayload {
  records: LibraryDetailRecords;
  commentary: LibraryDetailCommentary;
  sources: Record<TranslatorId, SourceMeta>;
}

/**
 * Fetches hexagram translations from /api/library/[number] with Bearer auth.
 * Translations are NEVER in the server-rendered RSC payload — they only arrive
 * after this component confirms the user is authenticated and Seeker+.
 * Mutation labels are pre-computed server-side (UI strings, not premium content).
 */
export function LibraryContentLoader({
  hexagramNumber,
  messages,
  lineLabels,
  mutationsHeading,
  mutationsIntro,
  resolvedMutations,
}: Props) {
  const [state, setState] = useState<LoadState>("loading");
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const router = useRouter();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function load() {
      try {
        const supabase = getSupabaseBrowser();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          router.replace("/");
          return;
        }

        const res = await fetch(`/api/library/${hexagramNumber}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          setState("denied");
          router.replace("/");
          return;
        }

        const data = (await res.json()) as DetailPayload & { summary: unknown; mutations: unknown };
        setDetail({ records: data.records, commentary: data.commentary, sources: data.sources });
        setState("ready");
      } catch {
        setState("denied");
        router.replace("/");
      }
    }

    void load();
  }, [hexagramNumber, router]);

  if (state === "loading") {
    return (
      <div className="library-access-gate--checking" aria-busy="true" aria-live="polite">
        <div className="library-access-gate__spinner" />
      </div>
    );
  }

  if (state === "denied" || !detail) return null;

  return (
    <>
      <h2 className="library-translations-heading">{messages.translationsHeading}</h2>
      <HexagramTabs
        records={detail.records}
        commentary={detail.commentary}
        sources={detail.sources}
        messages={messages}
        lineLabels={lineLabels}
      />

      <section className="library-mutations">
        <h2>{mutationsHeading}</h2>
        <p className="library-mutations-intro">{mutationsIntro}</p>
        <ul className="library-mutations-list">
          {resolvedMutations.map((m) => (
            <li key={m.position} className="library-mutation">
              <Link href={`/library/${m.toNumber}`} className="library-mutation__link">
                <span className="library-mutation__glyph" aria-hidden="true">
                  {m.toGlyph}
                </span>
                <span className="library-mutation__body">
                  <span className="library-mutation__line">{m.label}</span>
                  <span className="library-mutation__name" lang="zh-Hant">
                    {m.toNumber}. {m.toChineseName} · {m.toPinyin}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
