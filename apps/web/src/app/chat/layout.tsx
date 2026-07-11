import type { Metadata } from "next";

/**
 * /chat is the app surface (the oracle chat, formerly served at "/").
 * The marketing site at "/" is the indexable entry — the chat itself is
 * intentionally excluded from search results.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
