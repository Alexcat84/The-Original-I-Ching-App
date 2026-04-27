import { describe, expect, it } from "vitest";
import { mergeHydratedWithLocalDrafts, pickPreferredSessionLocalId, type SessionSelectorEntry } from "../chat-session-selection";

describe("mergeHydratedWithLocalDrafts", () => {
  it("keeps local draft session when hydration returns persisted chats", () => {
    const previous: SessionSelectorEntry[] = [
      { localId: "local-new", sessionId: "local-uuid", messageCount: 0 },
      { localId: "db-a", sessionId: "db-a", messageCount: 3 },
    ];
    const hydrated: SessionSelectorEntry[] = [{ localId: "db-a", sessionId: "db-a", messageCount: 3 }];

    const merged = mergeHydratedWithLocalDrafts({ previous, hydrated });

    expect(merged.map((s) => s.localId)).toEqual(["local-new", "db-a"]);
  });

  it("does not duplicate drafts when hydrated already contains same session/local id", () => {
    const previous: SessionSelectorEntry[] = [
      { localId: "local-new", sessionId: "same-id", messageCount: 0 },
      { localId: "db-a", sessionId: "db-a", messageCount: 3 },
    ];
    const hydrated: SessionSelectorEntry[] = [
      { localId: "db-a", sessionId: "db-a", messageCount: 3 },
      { localId: "db-same", sessionId: "same-id", messageCount: 2 },
    ];

    const merged = mergeHydratedWithLocalDrafts({ previous, hydrated });

    expect(merged.map((s) => s.localId)).toEqual(["db-a", "db-same"]);
  });
});

describe("pickPreferredSessionLocalId", () => {
  const sessions: SessionSelectorEntry[] = [
    { localId: "local-new", sessionId: "local-uuid", messageCount: 0 },
    { localId: "db-a", sessionId: "db-a", messageCount: 3 },
    { localId: "db-b", sessionId: "db-b", messageCount: 2 },
  ];

  it("prioritizes pinned local session for new-session flow", () => {
    const selected = pickPreferredSessionLocalId({
      sessions,
      pinnedLocalId: "local-new",
      activeLocalId: "db-a",
    });
    expect(selected).toBe("local-new");
  });

  it("falls back to active when pinned is not present", () => {
    const selected = pickPreferredSessionLocalId({
      sessions,
      pinnedLocalId: "missing",
      activeLocalId: "db-b",
    });
    expect(selected).toBe("db-b");
  });

  it("falls back to first session when both pinned and active are missing", () => {
    const selected = pickPreferredSessionLocalId({
      sessions,
      pinnedLocalId: "missing",
      activeLocalId: "also-missing",
    });
    expect(selected).toBe("local-new");
  });
});
