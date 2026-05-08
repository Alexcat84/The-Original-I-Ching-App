"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ChatSessionState } from "@/lib/chat-session-state";

type GenericChatSession = ChatSessionState<unknown>;

type ChatSessionContextValue = {
  sessions: GenericChatSession[];
  setSessions: Dispatch<SetStateAction<GenericChatSession[]>>;
  activeSessionLocalId: string | null;
  setActiveSessionLocalId: Dispatch<SetStateAction<string | null>>;
  sessionsHydrated: boolean;
  setSessionsHydrated: Dispatch<SetStateAction<boolean>>;
  sessionsServerHydrated: boolean;
  setSessionsServerHydrated: Dispatch<SetStateAction<boolean>>;
  setPersistenceKeys: (summaryCacheKey: string | null, chatStateCacheKey: string | null) => void;
  hydrateFromStorage: (summaryCacheKey: string | null, chatStateCacheKey: string | null) => void;
};

const ChatSessionContext = createContext<ChatSessionContextValue | null>(null);

export function ChatSessionProvider({ children }: { children: unknown }) {
  const [sessions, setSessions] = useState<GenericChatSession[]>([]);
  const [activeSessionLocalId, setActiveSessionLocalId] = useState<string | null>(null);
  const [sessionsHydrated, setSessionsHydrated] = useState(false);
  const [sessionsServerHydrated, setSessionsServerHydrated] = useState(false);
  const [summaryCacheKey, setSummaryCacheKey] = useState<string | null>(null);
  const [chatStateCacheKey, setChatStateCacheKey] = useState<string | null>(null);

  const setPersistenceKeys = useCallback((nextSummaryKey: string | null, nextStateKey: string | null) => {
    setSummaryCacheKey(nextSummaryKey);
    setChatStateCacheKey(nextStateKey);
  }, []);

  const hydrateFromStorage = useCallback(
    (nextSummaryKey: string | null, nextStateKey: string | null) => {
      if (sessions.length > 0) return;
      if (nextStateKey) {
        try {
          const stateRaw = sessionStorage.getItem(nextStateKey);
          if (stateRaw) {
            const state = JSON.parse(stateRaw) as {
              sessions?: GenericChatSession[];
              activeSessionLocalId?: string | null;
            };
            if (Array.isArray(state.sessions) && state.sessions.length > 0) {
              setSessions(
                state.sessions.map((s) => ({
                  ...s,
                  threadMaxDepth: s.threadMaxDepth ?? null,
                })),
              );
              setActiveSessionLocalId(state.activeSessionLocalId ?? state.sessions[0]?.localId ?? null);
              return;
            }
          }
        } catch {
          // ignore chat state cache hydration errors
        }
      }
      if (nextSummaryKey) {
        try {
          const cachedRaw = sessionStorage.getItem(nextSummaryKey);
          if (cachedRaw) {
            const cached = JSON.parse(cachedRaw) as GenericChatSession[];
            if (Array.isArray(cached) && cached.length > 0) {
              setSessions(
                cached.map((s) => ({
                  ...s,
                  threadMaxDepth: s.threadMaxDepth ?? null,
                })),
              );
              setActiveSessionLocalId(cached[0]?.localId ?? null);
            }
          }
        } catch {
          // ignore summary cache hydration errors
        }
      }
    },
    [sessions.length],
  );

  useEffect(() => {
    if (!sessionsHydrated) return;
    if (!summaryCacheKey) return;
    const entries = sessions.filter((s) => s.messageCount > 0).map((s) => ({ ...s, thread: [] }));
    try {
      if (entries.length === 0) {
        sessionStorage.removeItem(summaryCacheKey);
      } else {
        sessionStorage.setItem(summaryCacheKey, JSON.stringify(entries));
      }
    } catch {
      // ignore summary cache persistence errors
    }
  }, [sessions, summaryCacheKey, sessionsHydrated]);

  useEffect(() => {
    if (!sessionsHydrated) return;
    if (!chatStateCacheKey) return;
    const entries = sessions.filter((s) => s.messageCount > 0);
    try {
      if (entries.length === 0) {
        sessionStorage.removeItem(chatStateCacheKey);
      } else {
        sessionStorage.setItem(
          chatStateCacheKey,
          JSON.stringify({
            sessions: entries,
            activeSessionLocalId,
          }),
        );
      }
    } catch {
      // ignore state cache persistence errors
    }
  }, [sessions, activeSessionLocalId, chatStateCacheKey, sessionsHydrated]);

  const value = useMemo<ChatSessionContextValue>(
    () => ({
      sessions,
      setSessions,
      activeSessionLocalId,
      setActiveSessionLocalId,
      sessionsHydrated,
      setSessionsHydrated,
      sessionsServerHydrated,
      setSessionsServerHydrated,
      setPersistenceKeys,
      hydrateFromStorage,
    }),
    [
      sessions,
      activeSessionLocalId,
      sessionsHydrated,
      sessionsServerHydrated,
      setPersistenceKeys,
      hydrateFromStorage,
    ],
  );

  return <ChatSessionContext.Provider value={value}>{children as never}</ChatSessionContext.Provider>;
}

export function useChatSessionState<TThread = unknown>() {
  const ctx = useContext(ChatSessionContext);
  if (!ctx) {
    throw new Error("useChatSessionState must be used within ChatSessionProvider");
  }
  return ctx as unknown as {
    sessions: ChatSessionState<TThread>[];
    setSessions: Dispatch<SetStateAction<ChatSessionState<TThread>[]>>;
    activeSessionLocalId: string | null;
    setActiveSessionLocalId: Dispatch<SetStateAction<string | null>>;
    sessionsHydrated: boolean;
    setSessionsHydrated: Dispatch<SetStateAction<boolean>>;
    sessionsServerHydrated: boolean;
    setSessionsServerHydrated: Dispatch<SetStateAction<boolean>>;
    setPersistenceKeys: (summaryCacheKey: string | null, chatStateCacheKey: string | null) => void;
    hydrateFromStorage: (summaryCacheKey: string | null, chatStateCacheKey: string | null) => void;
  };
}
