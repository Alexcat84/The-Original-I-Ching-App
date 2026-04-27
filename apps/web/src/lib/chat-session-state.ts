export type ChatSessionState<TThread = unknown> = {
  localId: string;
  title: string;
  sessionId: string | null;
  /** Last known public id for /s/… links (synced from API). */
  publicSessionId: string | null;
  thread: TThread[];
  /** Max chained readings for this thread; from API / DB `max_consultations`. */
  threadMaxDepth: number | null;
  messageCount: number;
  updatedAt: number;
  firstConsultationAt: number | null;
};
