/**
 * Controladora de atestación Play Integrity, sin React.
 *
 * POR QUÉ EXISTE (refactor humble-object, auditoría externa 2026-08-26):
 * toda esta lógica vivía dentro de `useIntegrityCheck`, y probarla exigía montar
 * el hook. Montar un hook exige un reconciliador, y el único disponible era
 * react-dom, que en este monorepo está fijado a 18.2.0 por un override global
 * deliberado. Añadirlo como dependencia de apps/mobile rompió el install limpio
 * de Vercel con ERESOLVE.
 *
 * La salida no es pelear con el árbol de dependencias: es que la lógica no
 * necesite React para probarse. Timers, backoff y guarda de concurrencia viven
 * aquí, en una clase plana con dependencias inyectables. El hook queda como un
 * envoltorio delgado cuyo cleanup llama a `dispose()`.
 *
 * Este refactor es PRESERVADOR DE CONDUCTA: es código móvil de producción recién
 * liberado. Los valores, el orden de las llamadas y los efectos observables son
 * los mismos que tenía el hook; solo cambió dónde viven.
 */

const SECURE_TOKEN_KEY = "supabase_access_token";
const INTEGRITY_TRACE_HEADER = "x-integrity-trace-id";

const REFRESH_MARGIN_MS = 5 * 60 * 1000;
const CHALLENGE_TTL_S = 600;

/**
 * Debe quedar bastante por debajo de la espera de 15s del puente WebView, porque
 * un POST de consulta se retiene hasta que este viaje responde. Medido sobre 30
 * días de producción, el ciclo completo (challenge más atestación) da p50 2.2s,
 * p95 4.6s y máximo 8.5s, y el tramo del challenge es el rápido, muy por debajo
 * de un segundo. Ocho segundos está holgadamente por encima de cualquier ciclo
 * sano y aun así deja al puente margen para responder con el token anterior en
 * vez de hacer esperar al usuario su propio timeout.
 */
export const CHALLENGE_FETCH_TIMEOUT_MS = 8_000;

/**
 * Backoff acotado tras un refresco fallido. Antes de que existiera, un solo
 * fallo dejaba al shell sin atestación hasta que otra cosa disparara un
 * refresco: el timer periódico solo se arma en el camino de éxito, así que nada
 * reintentaba. Pasada la última entrada PARA en vez de hacer polling, porque una
 * sesión todavía rechazada a los ~7 minutos necesita un cambio real de auth, no
 * más peticiones.
 */
export const RETRY_BACKOFF_MS = [30_000, 120_000, 300_000];

/**
 * Cuán viejo puede ser un refresco en curso para que un nuevo llamador se una en
 * vez de arrancar el suyo. Deliberadamente estrecho: un POST de consulta se
 * bloquea en esto, así que nunca debe quedar aparcado detrás de un refresco ya
 * atascado. El máximo medido de un ciclo sano es 8.5s, así que cualquier cosa
 * más vieja que esto no va a terminar.
 */
export const IN_FLIGHT_JOIN_WINDOW_MS = 10_000;

export interface IntegrityTokenState {
  token: string;
  expiresAt: number;
  traceId: string | null;
}

export interface IntegrityClientEvent {
  traceId: string;
  phase: string;
  ok: boolean;
  reason?: string;
  detail?: string;
  nonceFp?: string;
  tokenLen?: number;
}

/** Todo lo que la controladora necesita del mundo exterior, inyectable. */
export interface IntegrityDeps {
  baseUrl: string;
  cloudProjectNumber: number;
  getBearerToken: () => Promise<string | null>;
  attest: (challenge: string, cloudProjectNumber: number) => Promise<string>;
  reportEvent: (bearerToken: string, payload: IntegrityClientEvent) => void;
  fetch: typeof fetch;
}

export function createIntegrityTraceId(): string {
  return `itr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Igual que en el servicio de sync: abortar una petición que nunca vuelve. */
function fetchWithTimeout(
  fetchImpl: typeof fetch,
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetchImpl(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timer),
  );
}

export class IntegrityController {
  /** Objetos ref planos: el hook los devuelve tal cual, así `.current` no cambia de forma. */
  readonly tokenRef: { current: string | null } = { current: null };
  readonly traceIdRef: { current: string | null } = { current: null };

  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private inFlight: { promise: Promise<string | null>; startedAt: number } | null = null;
  private failureCount = 0;
  /**
   * Falso hasta activar y de nuevo tras `dispose`, para que un timer pendiente
   * nunca dispare sobre una controladora ya desmontada. Sigue en verdadero con
   * la sesión cerrada a propósito: el puente WebView todavía puede pedir un
   * token, y ese camino debe poder armar el refresco periódico si tiene éxito.
   */
  private active = false;

  constructor(
    private readonly deps: IntegrityDeps,
    private readonly onTokenState: (state: IntegrityTokenState | null) => void,
  ) {}

  activate(): void {
    this.active = true;
  }

  /** Sesión cerrada: olvidar el token y detener los refrescos, sin desactivar. */
  clearSession(): void {
    this.tokenRef.current = null;
    this.traceIdRef.current = null;
    this.onTokenState(null);
    this.failureCount = 0;
    this.clearTimers();
  }

  /** Sesión abierta: contador de fallos a cero y primer refresco. */
  start(): void {
    this.failureCount = 0;
    void this.refresh();
  }

  /** Desmontaje: nada puede volver a dispararse. */
  dispose(): void {
    this.active = false;
    this.clearTimers();
  }

  /**
   * Colapsa refrescos concurrentes en uno. El shell puede pedir token desde dos
   * sitios a la vez (el efecto de auth en arranque en frío y el puente WebView),
   * lo que antes disparaba dos challenges con milisegundos de diferencia y
   * quemaba dos ranuras del rate limit para un solo token.
   */
  refresh(traceId?: string): Promise<string | null> {
    const inFlight = this.inFlight;
    if (inFlight && Date.now() - inFlight.startedAt < IN_FLIGHT_JOIN_WINDOW_MS) {
      return inFlight.promise;
    }
    const startedAt = Date.now();
    const promise: Promise<string | null> = this.runRefresh(traceId).finally(() => {
      if (this.inFlight?.promise === promise) {
        this.inFlight = null;
      }
    });
    this.inFlight = { promise, startedAt };
    return promise;
  }

  private clearTimers(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private scheduleRetry(): void {
    if (!this.active) return;
    if (this.failureCount >= RETRY_BACKOFF_MS.length) return; // agotado: parar, no hacer polling
    const delay = RETRY_BACKOFF_MS[this.failureCount];
    this.failureCount += 1;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (!this.active) return;
      void this.refresh();
    }, delay);
  }

  private async runRefresh(traceId?: string): Promise<string | null> {
    const activeTraceId = traceId ?? createIntegrityTraceId();
    const attempt = this.failureCount + 1;
    let bearerToken: string | null = null;

    try {
      bearerToken = await this.deps.getBearerToken();
      if (!bearerToken) return null;

      this.deps.reportEvent(bearerToken, {
        traceId: activeTraceId,
        phase: "refresh_start",
        ok: true,
      });

      const res = await fetchWithTimeout(
        this.deps.fetch,
        `${this.deps.baseUrl}/api/integrity/challenge`,
        {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            [INTEGRITY_TRACE_HEADER]: activeTraceId,
          },
          cache: "no-store",
        },
        CHALLENGE_FETCH_TIMEOUT_MS,
      );

      if (!res.ok) {
        this.deps.reportEvent(bearerToken, {
          traceId: activeTraceId,
          phase: "challenge_http",
          ok: false,
          reason: `http_${res.status}`,
          detail: `attempt_${attempt}`,
        });
        this.scheduleRetry();
        return null;
      }

      const body = (await res.json()) as { challenge: string; nonceFp?: string };

      this.deps.reportEvent(bearerToken, {
        traceId: activeTraceId,
        phase: "challenge_ok",
        ok: true,
        nonceFp: body.nonceFp,
        detail: `len_${body.challenge.length}`,
      });

      const token = await this.deps.attest(body.challenge, this.deps.cloudProjectNumber);

      this.deps.reportEvent(bearerToken, {
        traceId: activeTraceId,
        phase: "attest_ok",
        ok: true,
        nonceFp: body.nonceFp,
        tokenLen: token.length,
      });

      const expiresAt = Date.now() + (CHALLENGE_TTL_S - 60) * 1000;
      this.tokenRef.current = token;
      this.traceIdRef.current = activeTraceId;
      this.onTokenState({ token, expiresAt, traceId: activeTraceId });

      this.failureCount = 0;
      this.clearTimers();
      const msUntilRefresh = Math.max(0, expiresAt - Date.now() - REFRESH_MARGIN_MS);
      this.refreshTimer = setTimeout(() => {
        this.refreshTimer = null;
        if (!this.active) return;
        void this.refresh();
      }, msUntilRefresh);

      return token;
    } catch (err) {
      const reportToken = bearerToken ?? (await this.deps.getBearerToken());
      if (reportToken) {
        this.deps.reportEvent(reportToken, {
          traceId: activeTraceId,
          phase: "attest_error",
          ok: false,
          reason: err instanceof Error ? err.message.slice(0, 120) : "unknown",
          detail: `attempt_${attempt}`,
        });
      }
      this.tokenRef.current = null;
      this.traceIdRef.current = null;
      this.scheduleRetry();
      return null;
    }
  }
}

export { SECURE_TOKEN_KEY, INTEGRITY_TRACE_HEADER };
