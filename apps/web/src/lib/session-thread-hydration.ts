/** Minimal shape for thread hydration checks (web chat session). */
export type ThreadHydrationEntry = {
  interpretation?: string;
  interpretationSummary?: string;
};

export type SessionThreadHydrationInput = {
  sessionId: string | null;
  messageCount: number;
  thread: ThreadHydrationEntry[];
};

const FULL_INTERPRETATION_MIN_LEN = 120;
const SUMMARY_PLACEHOLDER_MARGIN = 80;

/** True when thread rows look like full TOAST content, not meta placeholders. */
export function sessionHasFullThreadContent(session: SessionThreadHydrationInput): boolean {
  if (session.thread.length === 0) return false;
  if (session.thread.length < session.messageCount) return false;
  return session.thread.every((item) => {
    const interpretation = item.interpretation ?? "";
    if (interpretation.length < FULL_INTERPRETATION_MIN_LEN) return false;
    const summary = item.interpretationSummary ?? "";
    if (summary.length > 0 && interpretation.length <= summary.length + SUMMARY_PLACEHOLDER_MARGIN) {
      return false;
    }
    return true;
  });
}

/** True when a server thread=1 fetch is still needed. */
export function sessionNeedsThreadHydration(session: SessionThreadHydrationInput): boolean {
  if (!session.sessionId) return false;
  if (session.messageCount === 0) return false;
  if (session.thread.length < session.messageCount) return true;
  return !sessionHasFullThreadContent(session);
}

export function isPostgrestHydrationBusy(
  bootstrapInFlight: boolean,
  hydrationBusyCount: number,
  loadingSessionLocalId: string | null,
  threadLoadsInFlight: number,
): boolean {
  return (
    bootstrapInFlight ||
    hydrationBusyCount > 0 ||
    loadingSessionLocalId !== null ||
    threadLoadsInFlight > 0
  );
}

export type ActiveSessionGateInput = {
  localId: string;
  sessionId: string | null;
  messageCount: number;
  thread: ThreadHydrationEntry[];
};

/**
 * Returns true only when the *active* session's own thread is still loading,
 * blocking a new consultation on that specific thread. Sessions that are new
 * (no sessionId), already hydrated, or whose load belongs to a *different*
 * session never block the active one.
 */
export function isActiveSessionThreadHydrating(
  active: ActiveSessionGateInput | null,
  loadingSessionLocalId: string | null,
  threadLoadsBySession: Map<string, unknown>,
): boolean {
  if (!active) return false;
  const needsOwnThread = sessionNeedsThreadHydration({
    sessionId: active.sessionId,
    messageCount: active.messageCount,
    thread: active.thread,
  });
  if (!needsOwnThread) return false;
  return (
    loadingSessionLocalId === active.localId ||
    (active.sessionId !== null && threadLoadsBySession.has(active.sessionId))
  );
}
