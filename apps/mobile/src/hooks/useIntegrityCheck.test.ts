/**
 * QA code: TS-MOB-001 integrity-check-hook · v1.0.0
 * Area: apps/mobile/src/hooks/useIntegrityCheck
 * Family: MOB
 */

/**
 * Cobertura exigida por la auditoría externa del 2026-08-24 (T-04, bloqueante de
 * T-05) sobre la lógica que va en el próximo release de Play:
 *
 *   1. Backoff acotado tras un fallo, que PARA en vez de hacer polling.
 *   2. Guarda de concurrencia: refrescos simultáneos se colapsan en uno.
 *   3. Limpieza de timers: nada puede dispararse después de desmontar.
 *
 * Estas tres cosas se escribieron sin cobertura automatizada y su reversión, una
 * vez publicadas en Play, es cara. De ahí que la auditoría subiera este ticket de
 * recomendación a requisito.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "../test/render-hook";

// ── Mocks de los módulos nativos ─────────────────────────────────────────────
// Se declaran con `vi.hoisted` porque `vi.mock` se eleva por encima de los imports.

const mocks = vi.hoisted(() => ({
  getItemAsync: vi.fn(),
  attestKey: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock("expo-secure-store", () => ({
  getItemAsync: mocks.getItemAsync,
}));

vi.mock("expo-app-integrity", () => ({
  attestKey: mocks.attestKey,
}));

vi.mock("@sentry/react-native", () => ({
  captureMessage: mocks.captureMessage,
}));

vi.mock("expo-constants", () => ({
  default: { expoConfig: { extra: { apiUrl: "https://example.test" } } },
}));

import { useIntegrityCheck, createIntegrityTraceId } from "./useIntegrityCheck";

// ── Utilidades ───────────────────────────────────────────────────────────────

const CHALLENGE = "/api/integrity/challenge";
const CLIENT_EVENT = "/api/integrity/client-event";

/** Peticiones al endpoint de challenge, ignorando las de telemetría. */
function challengeCalls(fetchMock: ReturnType<typeof vi.fn>): unknown[] {
  return fetchMock.mock.calls.filter((c) => String(c[0]).includes(CHALLENGE));
}

/** Respuesta de challenge correcta. */
function okChallenge() {
  return {
    ok: true,
    status: 200,
    json: async () => ({ challenge: "nonce-abc", nonceFp: "fp0123456789" }),
  };
}

/** Respuesta de challenge rechazada (el caso real observado en producción). */
function denied(status = 401) {
  return { ok: false, status, json: async () => ({ error: "auth_required" }) };
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  mocks.getItemAsync.mockReset().mockResolvedValue("bearer-token");
  mocks.attestKey.mockReset().mockResolvedValue("attestation-token");
  mocks.captureMessage.mockReset();

  fetchMock = vi.fn(async (url: string) => {
    if (String(url).includes(CLIENT_EVENT)) return { ok: true, status: 200 };
    return okChallenge();
  });
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

// ── 1. Backoff acotado ───────────────────────────────────────────────────────

describe("backoff tras un fallo de challenge", () => {
  it("reintenta con la escalera 30s, 2min, 5min y despues PARA", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes(CLIENT_EVENT)) return { ok: true, status: 200 };
      return denied();
    });

    renderHook(() => useIntegrityCheck(true));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(challengeCalls(fetchMock)).toHaveLength(1); // intento inicial

    await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
    expect(challengeCalls(fetchMock)).toHaveLength(2); // reintento 1

    await act(async () => { await vi.advanceTimersByTimeAsync(120_000); });
    expect(challengeCalls(fetchMock)).toHaveLength(3); // reintento 2

    await act(async () => { await vi.advanceTimersByTimeAsync(300_000); });
    expect(challengeCalls(fetchMock)).toHaveLength(4); // reintento 3

    // Lo que de verdad importa: agotado el backoff, no sigue haciendo polling.
    await act(async () => { await vi.advanceTimersByTimeAsync(60 * 60_000); });
    expect(challengeCalls(fetchMock)).toHaveLength(4);
  });

  it("no reintenta antes de que venza el primer tramo", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes(CLIENT_EVENT)) return { ok: true, status: 200 };
      return denied();
    });

    renderHook(() => useIntegrityCheck(true));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    await act(async () => { await vi.advanceTimersByTimeAsync(29_000); });

    expect(challengeCalls(fetchMock)).toHaveLength(1);
  });

  it("un exito posterior reinicia el contador de fallos", async () => {
    let falla = true;
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes(CLIENT_EVENT)) return { ok: true, status: 200 };
      return falla ? denied() : okChallenge();
    });

    renderHook(() => useIntegrityCheck(true));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(challengeCalls(fetchMock)).toHaveLength(1);

    // El primer reintento ya encuentra el servidor sano.
    falla = false;
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
    expect(challengeCalls(fetchMock)).toHaveLength(2);

    // Tras el exito se arma el refresco periodico (240s), no un reintento.
    await act(async () => { await vi.advanceTimersByTimeAsync(239_000); });
    expect(challengeCalls(fetchMock)).toHaveLength(2);
    await act(async () => { await vi.advanceTimersByTimeAsync(2_000); });
    expect(challengeCalls(fetchMock)).toHaveLength(3);
  });

  it("sin token guardado no pide challenge ni programa reintento", async () => {
    mocks.getItemAsync.mockResolvedValue(null);

    renderHook(() => useIntegrityCheck(true));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(challengeCalls(fetchMock)).toHaveLength(0);

    await act(async () => { await vi.advanceTimersByTimeAsync(10 * 60_000); });
    expect(challengeCalls(fetchMock)).toHaveLength(0);
  });
});

// ── 2. Guarda de concurrencia ────────────────────────────────────────────────

describe("guarda de concurrencia", () => {
  it("colapsa refrescos simultaneos en un solo challenge", async () => {
    const { result } = renderHook(() => useIntegrityCheck(true));

    // El efecto de auth ya disparo uno. El puente WebView pide otro en paralelo,
    // que es exactamente el doble disparo observado el 2026-08-18.
    await act(async () => {
      void result.current.refreshToken(createIntegrityTraceId());
      void result.current.refreshToken(createIntegrityTraceId());
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(challengeCalls(fetchMock)).toHaveLength(1);
  });

  it("los que se unen reciben el mismo token que el refresco en curso", async () => {
    const { result } = renderHook(() => useIntegrityCheck(true));

    let a: string | null = "no-resuelto";
    let b: string | null = "no-resuelto";
    await act(async () => {
      const pa = result.current.refreshToken();
      const pb = result.current.refreshToken();
      a = await pa;
      b = await pb;
    });

    expect(a).toBe("attestation-token");
    expect(b).toBe(a);
  });

  it("permite un refresco nuevo una vez que el anterior termino", async () => {
    const { result } = renderHook(() => useIntegrityCheck(true));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    const antes = challengeCalls(fetchMock).length;

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(challengeCalls(fetchMock).length).toBe(antes + 1);
  });
});

// ── 3. Limpieza de timers ────────────────────────────────────────────────────

describe("limpieza de timers", () => {
  it("desmontar cancela el reintento pendiente", async () => {
    fetchMock.mockImplementation(async (url: string) => {
      if (String(url).includes(CLIENT_EVENT)) return { ok: true, status: 200 };
      return denied();
    });

    const { unmount } = renderHook(() => useIntegrityCheck(true));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    const antes = challengeCalls(fetchMock).length;

    unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(30 * 60_000); });

    expect(challengeCalls(fetchMock).length).toBe(antes);
  });

  it("desmontar cancela el refresco periodico", async () => {
    const { unmount } = renderHook(() => useIntegrityCheck(true));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    const antes = challengeCalls(fetchMock).length;

    unmount();
    await act(async () => { await vi.advanceTimersByTimeAsync(30 * 60_000); });

    expect(challengeCalls(fetchMock).length).toBe(antes);
  });

  it("cerrar sesion detiene los refrescos y limpia el token en memoria", async () => {
    const { result, rerender } = renderHook(
      ({ auth }: { auth: boolean }) => useIntegrityCheck(auth),
      { initialProps: { auth: true } },
    );
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(result.current.currentTokenRef.current).toBe("attestation-token");
    const antes = challengeCalls(fetchMock).length;

    rerender({ auth: false });
    await act(async () => { await vi.advanceTimersByTimeAsync(30 * 60_000); });

    expect(result.current.currentTokenRef.current).toBeNull();
    expect(challengeCalls(fetchMock).length).toBe(antes);
  });
});

// ── Correlación ──────────────────────────────────────────────────────────────

describe("trace id", () => {
  it("genera ids unicos con el prefijo esperado", () => {
    const a = createIntegrityTraceId();
    const b = createIntegrityTraceId();
    expect(a).toMatch(/^itr_\d+_[a-z0-9]+$/);
    expect(a).not.toBe(b);
  });

  it("expone el trace id del refresco que efectivamente corrio", async () => {
    const { result } = renderHook(() => useIntegrityCheck(true));
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });

    expect(result.current.currentTraceIdRef.current).toMatch(/^itr_/);
  });
});
