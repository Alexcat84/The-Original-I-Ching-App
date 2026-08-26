/**
 * QA code: TS-MOB-001 integrity-controller · v2.0.0
 * Area: apps/mobile/src/hooks/integrity-controller
 * Family: MOB
 */

/**
 * Cobertura exigida por la auditoría externa (T-04, bloqueante de T-05) sobre la
 * lógica que va en el próximo release de Play:
 *
 *   1. Backoff acotado tras un fallo, que PARA en vez de hacer polling.
 *   2. Guarda de concurrencia: refrescos simultáneos se colapsan en uno.
 *   3. Limpieza de timers: nada puede dispararse después de `dispose`.
 *
 * Se prueba la controladora plana, no el hook. El primer intento montaba el hook
 * con react-dom y rompió el install de Vercel: el override global fija react-dom
 * en 18.2.0 y choca con react 19 de mobile. Aquí no hay React, ni reconciliador,
 * ni una sola dependencia nueva; solo vitest y timers falsos.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  IntegrityController,
  createIntegrityTraceId,
  type IntegrityDeps,
} from "./integrity-controller";

const CHALLENGE = "/api/integrity/challenge";

function okChallenge() {
  return {
    ok: true,
    status: 200,
    json: async () => ({ challenge: "nonce-abc", nonceFp: "fp0123456789" }),
  } as unknown as Response;
}

/** El caso real observado en producción: sesión rotada a mitad de vuelo. */
function denied(status = 401) {
  return { ok: false, status, json: async () => ({ error: "auth_required" }) } as unknown as Response;
}

interface Harness {
  controller: IntegrityController;
  fetchMock: ReturnType<typeof vi.fn>;
  attest: ReturnType<typeof vi.fn>;
  getBearerToken: ReturnType<typeof vi.fn>;
  reportEvent: ReturnType<typeof vi.fn>;
  states: Array<unknown>;
  challengeCalls: () => unknown[];
}

function makeController(overrides: Partial<IntegrityDeps> = {}): Harness {
  // La firma con parámetros es necesaria: sin ella `mock.calls` es una tupla
  // vacía y `c[0]` no compila.
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => okChallenge());
  const attest = vi.fn(async () => "attestation-token");
  const getBearerToken = vi.fn(async () => "bearer-token" as string | null);
  const reportEvent = vi.fn();
  const states: Array<unknown> = [];

  const deps: IntegrityDeps = {
    baseUrl: "https://example.test",
    cloudProjectNumber: 1234,
    getBearerToken,
    attest,
    reportEvent,
    fetch: fetchMock as unknown as typeof fetch,
    ...overrides,
  };

  const controller = new IntegrityController(deps, (s) => states.push(s));
  controller.activate();

  return {
    controller,
    fetchMock,
    attest,
    getBearerToken,
    reportEvent,
    states,
    challengeCalls: () => fetchMock.mock.calls.filter((c) => String(c[0]).includes(CHALLENGE)),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ── 1. Backoff acotado ───────────────────────────────────────────────────────

describe("backoff tras un fallo de challenge", () => {
  it("reintenta con la escalera 30s, 2min, 5min y despues PARA", async () => {
    const h = makeController();
    h.fetchMock.mockImplementation(async () => denied());

    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.challengeCalls()).toHaveLength(1); // intento inicial

    await vi.advanceTimersByTimeAsync(30_000);
    expect(h.challengeCalls()).toHaveLength(2); // reintento 1

    await vi.advanceTimersByTimeAsync(120_000);
    expect(h.challengeCalls()).toHaveLength(3); // reintento 2

    await vi.advanceTimersByTimeAsync(300_000);
    expect(h.challengeCalls()).toHaveLength(4); // reintento 3

    // Lo que de verdad importa: agotado el backoff, no sigue haciendo polling.
    await vi.advanceTimersByTimeAsync(60 * 60_000);
    expect(h.challengeCalls()).toHaveLength(4);
  });

  it("no reintenta antes de que venza el primer tramo", async () => {
    const h = makeController();
    h.fetchMock.mockImplementation(async () => denied());

    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);
    await vi.advanceTimersByTimeAsync(29_000);

    expect(h.challengeCalls()).toHaveLength(1);
  });

  it("un exito posterior reinicia el contador de fallos", async () => {
    const h = makeController();
    let falla = true;
    h.fetchMock.mockImplementation(async () => (falla ? denied() : okChallenge()));

    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.challengeCalls()).toHaveLength(1);

    // El primer reintento ya encuentra el servidor sano.
    falla = false;
    await vi.advanceTimersByTimeAsync(30_000);
    expect(h.challengeCalls()).toHaveLength(2);

    // Tras el exito se arma el refresco periodico (240s), no un reintento.
    await vi.advanceTimersByTimeAsync(239_000);
    expect(h.challengeCalls()).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(2_000);
    expect(h.challengeCalls()).toHaveLength(3);
  });

  it("sin token guardado no pide challenge ni programa reintento", async () => {
    const h = makeController();
    h.getBearerToken.mockResolvedValue(null);

    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.challengeCalls()).toHaveLength(0);

    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(h.challengeCalls()).toHaveLength(0);
  });

  it("un fallo de la atestacion nativa tambien entra al backoff y limpia el token", async () => {
    const h = makeController();
    h.attest.mockRejectedValue(new Error("play services unavailable"));

    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.controller.tokenRef.current).toBeNull();

    await vi.advanceTimersByTimeAsync(30_000);
    expect(h.challengeCalls()).toHaveLength(2);
  });
});

// ── 2. Guarda de concurrencia ────────────────────────────────────────────────

describe("guarda de concurrencia", () => {
  it("colapsa refrescos simultaneos en un solo challenge", async () => {
    const h = makeController();

    // El doble disparo observado el 2026-08-18: el efecto de auth y el puente
    // WebView pidiendo token con milisegundos de diferencia.
    void h.controller.refresh(createIntegrityTraceId());
    void h.controller.refresh(createIntegrityTraceId());
    await vi.advanceTimersByTimeAsync(0);

    expect(h.challengeCalls()).toHaveLength(1);
  });

  it("los que se unen reciben el mismo token que el refresco en curso", async () => {
    const h = makeController();

    const pa = h.controller.refresh();
    const pb = h.controller.refresh();
    await vi.advanceTimersByTimeAsync(0);
    const [a, b] = await Promise.all([pa, pb]);

    expect(a).toBe("attestation-token");
    expect(b).toBe(a);
  });

  it("permite un refresco nuevo una vez que el anterior termino", async () => {
    const h = makeController();
    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);
    const antes = h.challengeCalls().length;

    await h.controller.refresh();
    await vi.advanceTimersByTimeAsync(0);

    expect(h.challengeCalls().length).toBe(antes + 1);
  });

  it("la valvula deja arrancar uno nuevo si el anterior quedo atascado", async () => {
    const h = makeController();
    // Un challenge que nunca resuelve: el refresco queda colgado.
    h.fetchMock.mockImplementation(() => new Promise<Response>(() => {}));

    void h.controller.refresh();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.challengeCalls()).toHaveLength(1);

    // Dentro de la ventana de union se une en vez de arrancar otro.
    void h.controller.refresh();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.challengeCalls()).toHaveLength(1);

    // Pasada la ventana (10s), un llamador nuevo no queda aparcado detras.
    await vi.advanceTimersByTimeAsync(10_001);
    void h.controller.refresh();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.challengeCalls()).toHaveLength(2);
  });
});

// ── 3. Limpieza de timers ────────────────────────────────────────────────────

describe("limpieza de timers", () => {
  it("dispose cancela el reintento pendiente", async () => {
    const h = makeController();
    h.fetchMock.mockImplementation(async () => denied());

    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);
    const antes = h.challengeCalls().length;

    h.controller.dispose();
    await vi.advanceTimersByTimeAsync(30 * 60_000);

    expect(h.challengeCalls().length).toBe(antes);
  });

  it("dispose cancela el refresco periodico", async () => {
    const h = makeController();

    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);
    const antes = h.challengeCalls().length;

    h.controller.dispose();
    await vi.advanceTimersByTimeAsync(30 * 60_000);

    expect(h.challengeCalls().length).toBe(antes);
  });

  it("clearSession detiene los refrescos y limpia el token en memoria", async () => {
    const h = makeController();

    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);
    expect(h.controller.tokenRef.current).toBe("attestation-token");
    const antes = h.challengeCalls().length;

    h.controller.clearSession();
    await vi.advanceTimersByTimeAsync(30 * 60_000);

    expect(h.controller.tokenRef.current).toBeNull();
    expect(h.challengeCalls().length).toBe(antes);
  });

  it("clearSession notifica estado nulo al consumidor", async () => {
    const h = makeController();
    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);

    h.controller.clearSession();

    expect(h.states.at(-1)).toBeNull();
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
    const h = makeController();
    h.controller.start();
    await vi.advanceTimersByTimeAsync(0);

    expect(h.controller.traceIdRef.current).toMatch(/^itr_/);
  });

  it("usa el trace id que le pasa el puente cuando se lo dan", async () => {
    const h = makeController();
    const mio = createIntegrityTraceId();

    await h.controller.refresh(mio);
    await vi.advanceTimersByTimeAsync(0);

    expect(h.controller.traceIdRef.current).toBe(mio);
  });
});
