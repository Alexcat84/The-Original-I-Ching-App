export type SessionSelectorEntry = {
  localId: string;
  sessionId?: string | null;
  messageCount: number;
};

export function mergeHydratedWithLocalDrafts<T extends SessionSelectorEntry>(params: {
  previous: T[];
  hydrated: T[];
}): T[] {
  const { previous, hydrated } = params;
  const localDrafts = previous.filter(
    (session) =>
      session.messageCount === 0 &&
      !hydrated.some(
        (merged) =>
          merged.localId === session.localId ||
          (Boolean(merged.sessionId) && Boolean(session.sessionId) && merged.sessionId === session.sessionId),
      ),
  );
  return [...localDrafts, ...hydrated];
}

export function pickPreferredSessionLocalId(params: {
  sessions: SessionSelectorEntry[];
  pinnedLocalId: string | null;
  activeLocalId: string | null;
}): string | null {
  const { sessions, pinnedLocalId, activeLocalId } = params;
  if (sessions.length === 0) return null;
  if (pinnedLocalId && sessions.some((s) => s.localId === pinnedLocalId)) return pinnedLocalId;
  if (activeLocalId && sessions.some((s) => s.localId === activeLocalId)) return activeLocalId;
  return sessions[0]?.localId ?? null;
}
