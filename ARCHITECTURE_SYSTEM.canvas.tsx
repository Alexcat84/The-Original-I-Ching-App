/**
 * ARCHITECTURE_SYSTEM.canvas.tsx
 * The Original I Ching App — mapa interactivo por módulos (VISTA de Cursor).
 *
 * CANONICAL SOURCE: docs/auditorias/00000000-RPT-ARCH-02-system-canvas.md
 *   That registered Mermaid doc is the project-owned, Cursor-independent source
 *   of truth (renders on GitHub / VS Code / any Markdown viewer). This .tsx is an
 *   OPTIONAL interactive mirror for Cursor; when the two differ, the .md wins, and
 *   any architecture change updates the .md in the same commit (QMS registered).
 *
 * AGENT INSTRUCTIONS (keep in sync with repo):
 * - Update CURRENT_RELEASE + the canonical .md when apps/mobile/app.config.js changes.
 * - Full release history: CHANGELOG.md at repo root (npm run changelog:update).
 * - Deep reference: docs/auditorias/00000000-RPT-ARCH-01-architecture-fullstack.md, CLAUDE.md.
 * - Do not add fetch() or external imports; only cursor/canvas.
 */
import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Select,
  Stack,
  Stat,
  Table,
  Text,
  TextArea,
  Toggle,
  computeDAGLayout,
  mergeStyle,
  useCanvasState,
  useHostTheme,
  type DAGLayoutResult,
} from "cursor/canvas";

// --- Release snapshot (update on each mobile bump) ---
const CURRENT_RELEASE = {
  versionName: "4.2.5",
  versionCode: 65,
  webHost: "https://theoriginaliching.com",
  stagingHost:
    "https://the-original-i-ching-app-git-staging-alexs-projects-e8bf95b4.vercel.app",
  updatedAt: "2026-07-17",
};

type ViewId =
  | "layers"
  | "consult"
  | "mobile"
  | "billing"
  | "modules"
  | "api"
  | "versions"
  | "agents";

type ModuleRow = {
  id: string;
  path: string;
  role: string;
  depends: string;
};

const MODULE_CATALOG: ModuleRow[] = [
  { id: "web", path: "apps/web", role: "Next.js UI + API Routes", depends: "packages/*, backend/claude, Supabase" },
  { id: "mobile", path: "apps/mobile", role: "Expo SDK 57 (RN 0.86, New Arch) WebView shell, SQLite, Play Billing, Play Integrity", depends: "web URL, @iching-oracle/i18n" },
  { id: "iching-engine", path: "packages/iching-engine", role: "Sorteo monedas/varas; reglas Huang/Zhu Xi", depends: "iching-data" },
  { id: "oracle-bones-engine", path: "packages/oracle-bones-engine", role: "Sorteo huesos Shang", depends: "—" },
  { id: "context-engine", path: "packages/context-engine", role: "Límites hilo, contexto sesión", depends: "i18n" },
  { id: "image-engine", path: "packages/image-engine", role: "Prompts FLUX + negativos", depends: "—" },
  { id: "i18n", path: "packages/i18n", role: "11 locales, getters UI", depends: "—" },
  { id: "claude", path: "backend/claude", role: "Anthropic interpretación", depends: "iching-engine, context-engine" },
  { id: "auth-be", path: "backend/auth", role: "2FA, bcrypt helpers", depends: "—" },
  { id: "db", path: "backend/db/migrations", role: "Postgres schema, RPC tokens", depends: "Supabase" },
  { id: "sharing", path: "packages/sharing", role: "URLs públicas lecturas", depends: "—" },
  { id: "iching-data", path: "packages/iching-data", role: "64 hexagramas estáticos", depends: "—" },
  { id: "ui", path: "packages/ui", role: "Componentes UI compartidos", depends: "—" },
  { id: "image-be", path: "backend/image", role: "Helpers de imagen backend", depends: "image-engine" },
];

const VERSION_ROWS = [
  { version: "4.2.5", vc: "65", date: "2026-07-17", stage: "Production", note: "Expo SDK 57 + RN 0.86 New Architecture, target API 36 (Android 16); fix descarga imagen (media-library/legacy); D9 granularPermissions photo; diagrama single-hex sin mutación" },
  { version: "4.2.4", vc: "64", date: "2026-07-16", stage: "Built, not published", note: "Primer SDK 57 (superseded por 4.2.5). New Arch, API 36, expo doctor 20/20, migración 075 replayable" },
  { version: "4.2.2", vc: "62", date: "2026-07-04", stage: "Production", note: "Último release pre-SDK-57. Security hardening (cuenta, sesión, integridad)" },
  { version: "4.2.0", vc: "60", date: "2026-06-25", stage: "Production", note: "Biblioteca hexagramas; auditorías page; RLS integration test (rls-test) + resolution-guard como gates" },
  { version: "4.1.7", vc: "57", date: "2026-06-21", stage: "Closed Testing", note: "Selector lectura líneas Huang/Zhu Xi (074); detect-input-language; legal re-accept header; SSE final_ready lineReadingSystem" },
  { version: "4.1.6", vc: "55", date: "2026-06-19", stage: "Closed Testing", note: "Legal consent bootstrap cache; Turnstile sign-in; RN WebView safe-area" },
  { version: "4.1.0", vc: "49", date: "2026-06-17", stage: "Production", note: "Expo SDK 53 + RN 0.79 Release A (16 KB); splash/icon; integrity Gradle 8; Sentry 6" },
  { version: "3.5.6", vc: "54", date: "2026-06-13", stage: "Local smoke test", note: "Phase 0-3 perf (streaming deltas, parallel image, prompt cache V2) + B1/B2/B3 + SEC-01 webhook gate" },
  { version: "3.5.5", vc: "53", date: "2026-06-12", stage: "Staging", note: "Phase 7+8: OOM crash fix + session recovery; audit remediation CRIT-01/02 (refund_token), MED-01 (iad1 pin)" },
  { version: "3.3.9", vc: "32", date: "2026-05-31", stage: "Closed Testing", note: "RC logIn before purchase; drawer safe area native inset" },
  { version: "3.3.6", vc: "29", date: "2026-05-31", stage: "Closed Testing", note: "Changelog system; billing/cache/drawer fixes" },
  { version: "3.3.1", vc: "24", date: "2026-05-29", stage: "Closed Testing", note: "i18n 11 locales merged" },
  { version: "3.3.0", vc: "23", date: "2026-05-25", stage: "Closed Testing", note: "Onboarding tour" },
  { version: "3.2.0", vc: "12", date: "2026-05-17", stage: "Internal Testing", note: "Production Play Store AAB" },
  { version: "2.0.0", vc: "2", date: "2026-04-20", stage: "Internal Testing", note: "First Play Console upload" },
];

const API_GROUPS: { group: string; routes: string }[] = [
  { group: "Oráculo", routes: "POST /api/consult (SSE stream_ritual + JSON manual) · GET /api/mutation-explorer/consultation · GET /api/image-proxy" },
  { group: "Cuenta", routes: "GET /api/account/bootstrap · GET/DELETE /api/account/chats · GET /api/account/sessions-only · GET /api/account/me · PUT /api/account/display-name · POST /api/account/delete · POST /api/account/tour-complete · GET /api/account/sync-billing · POST /api/account/create-portal-session" },
  { group: "Auth", routes: "/api/auth/register · legal-consent · change-password · sign-out · notify-password-changed · /api/auth/2fa/* (enroll·verify·disable·challenge·email) · POST /api/auth/verify-turnstile" },
  { group: "Integridad", routes: "POST /api/integrity/challenge · POST /api/integrity/client-event (Play Integrity attestation)" },
  { group: "Billing", routes: "POST /api/webhooks/revenuecat (fail-closed: rechaza sandbox/test salvo REVENUECAT_ALLOW_TEST_EVENTS)" },
  { group: "Biblioteca", routes: "GET /api/library/[n] (Bearer+Seeker+) · GET /api/library/access" },
  { group: "Ops", routes: "GET /api/health · POST /api/feedback · /api/admin/* · /api/ritual-debug" },
];

type DagSpec = { nodes: { id: string; label?: string }[]; edges: { from: string; to: string }[] };

const FLOW_LAYERS: DagSpec = {
  nodes: [
    { id: "browser", label: "Browser" },
    { id: "apk", label: "APK Android (SDK 57)" },
    { id: "web", label: "apps/web" },
    { id: "mobile", label: "apps/mobile" },
    { id: "api", label: "API Routes" },
    { id: "pkg", label: "packages/*" },
    { id: "claude", label: "backend/claude" },
    { id: "db", label: "Supabase" },
    { id: "sqlite", label: "SQLite" },
    { id: "anthropic", label: "Claude API" },
    { id: "fallback", label: "OpenRouter / Groq (fallback)" },
    { id: "together", label: "Together FLUX" },
    { id: "r2", label: "Cloudflare R2 (image store)" },
    { id: "rc", label: "RevenueCat" },
    { id: "redis", label: "Upstash Redis (rate limit)" },
    { id: "turnstile", label: "Turnstile (CAPTCHA)" },
    { id: "resend", label: "Resend (email 2FA)" },
    { id: "integrity", label: "Play Integrity" },
  ],
  edges: [
    { from: "browser", to: "web" },
    { from: "apk", to: "mobile" },
    { from: "mobile", to: "web" },
    { from: "mobile", to: "sqlite" },
    { from: "mobile", to: "integrity" },
    { from: "web", to: "api" },
    { from: "api", to: "pkg" },
    { from: "api", to: "claude" },
    { from: "api", to: "db" },
    { from: "api", to: "redis" },
    { from: "api", to: "turnstile" },
    { from: "api", to: "resend" },
    { from: "api", to: "integrity" },
    { from: "claude", to: "anthropic" },
    { from: "claude", to: "fallback" },
    { from: "api", to: "together" },
    { from: "together", to: "r2" },
    { from: "rc", to: "api" },
    { from: "mobile", to: "rc" },
  ],
};

const FLOW_CONSULT: DagSpec = {
  nodes: [
    { id: "ui", label: "page.tsx" },
    { id: "lang", label: "detect-input-language" },
    { id: "consult", label: "POST /api/consult" },
    { id: "auth", label: "auth + rate limit" },
    { id: "tokens", label: "consume_token" },
    { id: "cast", label: "iching-engine (LRS)" },
    { id: "ctx", label: "context-engine" },
    { id: "claude", label: "generateInterpretation" },
    { id: "delta", label: "oracle_delta (stream)" },
    { id: "img", label: "image-engine + provider" },
    { id: "persist", label: "session-store" },
    { id: "sse", label: "SSE final_ready (+lineReadingSystem)" },
  ],
  edges: [
    { from: "ui", to: "lang" },
    { from: "lang", to: "consult" },
    { from: "consult", to: "auth" },
    { from: "auth", to: "tokens" },
    { from: "consult", to: "cast" },
    { from: "cast", to: "sse" },
    { from: "consult", to: "ctx" },
    { from: "ctx", to: "claude" },
    { from: "claude", to: "delta" },
    { from: "delta", to: "sse" },
    { from: "delta", to: "img" },
    { from: "claude", to: "persist" },
    { from: "img", to: "persist" },
    { from: "persist", to: "sse" },
  ],
};

const FLOW_MOBILE: DagSpec = {
  nodes: [
    { id: "wv", label: "WebView" },
    { id: "inj", label: "INJECTED_JS" },
    { id: "bridge", label: "postMessage bridge" },
    { id: "sql", label: "chat-store SQLite" },
    { id: "sync", label: "sync-service" },
    { id: "api", label: "/api/account/chats" },
    { id: "cache", label: "__rnCachedChats" },
    { id: "rc", label: "RevenueCat SDK" },
  ],
  edges: [
    { from: "wv", to: "inj" },
    { from: "wv", to: "bridge" },
    { from: "bridge", to: "sql" },
    { from: "bridge", to: "sync" },
    { from: "sync", to: "api" },
    { from: "sql", to: "cache" },
    { from: "cache", to: "wv" },
    { from: "bridge", to: "rc" },
  ],
};

const FLOW_BILLING: DagSpec = {
  nodes: [
    { id: "play", label: "Play / Stripe" },
    { id: "rc", label: "RevenueCat" },
    { id: "hook", label: "webhook route" },
    { id: "idem", label: "grant_tokens_idempotent" },
    { id: "grant", label: "grant_tokens (044)" },
    { id: "credits", label: "query_credits" },
    { id: "consult", label: "consume_token" },
  ],
  edges: [
    { from: "play", to: "rc" },
    { from: "rc", to: "hook" },
    { from: "hook", to: "idem" },
    { from: "idem", to: "grant" },
    { from: "grant", to: "credits" },
    { from: "consult", to: "credits" },
  ],
};

function DagDiagram({
  spec,
  title,
  height = 320,
}: {
  spec: DagSpec;
  title: string;
  height?: number;
}) {
  const theme = useHostTheme();
  const layout: DAGLayoutResult = computeDAGLayout({
    nodes: spec.nodes.map((n) => ({ id: n.id })),
    edges: spec.edges,
    direction: "vertical",
    nodeWidth: 168,
    nodeHeight: 36,
    rankGap: 56,
    nodeGap: 24,
    padding: 20,
  });

  const labelById = new Map(spec.nodes.map((n) => [n.id, n.label ?? n.id]));

  return (
    <Stack gap={8}>
      <Text weight="medium">{title}</Text>
      <div
        style={{
          overflow: "auto",
          border: `1px solid ${theme.stroke.secondary}`,
          borderRadius: 8,
          background: theme.bg.chrome,
        }}
      >
        <svg
          width={layout.width}
          height={Math.max(layout.height, height)}
          style={{ display: "block", minWidth: "100%" }}
        >
          {layout.edges.map((e) => (
            <line
              key={`${e.from}-${e.to}`}
              x1={e.sourceX}
              y1={e.sourceY}
              x2={e.targetX}
              y2={e.targetY}
              stroke={e.isBackEdge ? theme.text.tertiary : theme.stroke.primary}
              strokeWidth={e.isBackEdge ? 1 : 1.5}
              strokeDasharray={e.isBackEdge ? "4 3" : undefined}
            />
          ))}
          {layout.nodes.map((n) => (
            <g key={n.id}>
              <rect
                x={n.x}
                y={n.y}
                width={168}
                height={36}
                rx={6}
                fill={theme.fill.secondary}
                stroke={theme.stroke.primary}
              />
              <text
                x={n.x + 84}
                y={n.y + 22}
                textAnchor="middle"
                fill={theme.text.primary}
                fontSize={11}
                fontFamily="ui-monospace, monospace"
              >
                {labelById.get(n.id) ?? n.id}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <Text size="small" tone="tertiary">
        Source: repo structure · layout computed client-side
      </Text>
    </Stack>
  );
}

const VIEW_OPTIONS = [
  { value: "layers", label: "Capas del sistema" },
  { value: "consult", label: "Flujo consulta" },
  { value: "mobile", label: "Mobile + SQLite" },
  { value: "billing", label: "Tokens y pagos" },
  { value: "modules", label: "Catálogo módulos" },
  { value: "api", label: "API Routes" },
  { value: "versions", label: "Historial versiones" },
  { value: "agents", label: "Guía para agentes" },
];

export default function ArchitectureSystemCanvas() {
  const theme = useHostTheme();
  const [view, setView] = useCanvasState<ViewId>("archView", "layers");
  const [archNotes, setArchNotes] = useCanvasState<string>(
    "archNotes",
    "Notas de arquitectura: editar aquí tras cada cambio relevante. Persistido en ARCHITECTURE_SYSTEM.canvas.data.json.",
  );
  const [showModuleTable, setShowModuleTable] = useCanvasState("showModuleTable", true);
  const [compactVersions, setCompactVersions] = useCanvasState("compactVersions", true);

  const moduleHeaders = ["Módulo", "Ruta", "Rol", "Depende de"];
  const moduleRows = MODULE_CATALOG.map((m) => [m.id, m.path, m.role, m.depends]);

  const versionHeaders = ["Version", "VC", "Fecha", "Etapa", "Notas arquitectura"];
  const versionTableRows = VERSION_ROWS.map((v) => [
    v.version,
    v.vc,
    v.date,
    v.stage,
    v.note,
  ]);

  return (
    <Stack gap={16} style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <Stack gap={4}>
        <H1>The Original I Ching App — Arquitectura por módulos</H1>
        <Text tone="secondary">
          Canvas vivo en la raíz del repo. Consultable y editable por agentes; sincronizar con{" "}
          <Code>CHANGELOG.md</Code> y <Code>apps/mobile/app.config.js</Code> en cada release.
        </Text>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat label="Release APK" value={CURRENT_RELEASE.versionName} />
        <Stat label="versionCode" value={String(CURRENT_RELEASE.versionCode)} />
        <Stat label="Web prod" value="theoriginaliching.com" />
        <Stat label="Idiomas UI" value="11" />
      </Grid>

      <Row gap={12} style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
        <Stack gap={4} style={{ minWidth: 220, flex: 1 }}>
          <Text size="small" tone="secondary">
            Vista de flujo
          </Text>
          <Select
            value={view}
            onChange={(v) => setView(v as ViewId)}
            options={VIEW_OPTIONS}
          />
        </Stack>
        <Button variant="secondary" onClick={() => setView("agents")}>
          Guía agentes
        </Button>
        <Button variant="secondary" onClick={() => setView("versions")}>
          Versiones
        </Button>
      </Row>

      {view === "layers" && (
        <Card>
          <CardHeader trailing={<Pill tone="info">overview</Pill>}>Arquitectura por capas</CardHeader>
          <CardBody>
            <DagDiagram spec={FLOW_LAYERS} title="Cliente → Web/Mobile → Dominio → Datos → Externos" height={400} />
          </CardBody>
        </Card>
      )}

      {view === "consult" && (
        <Card>
          <CardHeader trailing={<Pill tone="info">SSE</Pill>}>Flujo POST /api/consult</CardHeader>
          <CardBody>
            <Callout tone="info">
              Idioma: detectInputLanguage(pregunta, cookie iching_ui_locale) — responde en el idioma
              escrito si hay margen claro; si no, UI locale. Panel I Ching: Traductor → Lectura líneas
              (Huang/Zhu Xi, migración 074) → Método → Ejecución. Rate limit Upstash → consume_token →
              sorteo → cast_ready (~15ms) → Claude stream (oracle_delta SSE, 150ms flush) → imagen
              paralela si ANTHROPIC_PARALLEL_IMAGE=1 → oracle_ready → persist (line_reading_system) →
              final_ready incluye lineReadingSystem (auto SSE y JSON manual). Refund automático si falla
              post-cargo (refund_token RPC, migración 072).
            </Callout>
            <Divider />
            <DagDiagram spec={FLOW_CONSULT} title="Consulta oráculo (I Ching u Oracle Bones)" />
          </CardBody>
        </Card>
      )}

      {view === "mobile" && (
        <Card>
          <CardHeader trailing={<Pill tone="neutral">3 tiers SQLite</Pill>}>Mobile shell + cache</CardHeader>
          <CardBody>
            <Stack gap={12}>
              <Grid columns={3} gap={8}>
                <Stat label="Tier 1" value="Lista chats" />
                <Stat label="Tier 2" value="Thread cache" />
                <Stat label="Tier 3" value="Sync contenido" />
              </Grid>
              <Text tone="secondary">
                Tier 1: syncChats cada 5 min · Tier 2: getPagedThread al abrir chat · Tier 3:
                syncChatContent cada 1 min. fetchSummaries: null = error, [] = cuenta vacía →
                softDeleteStaleChats.
              </Text>
              <DagDiagram spec={FLOW_MOBILE} title="WebView bridge y stale-while-revalidate" />
            </Stack>
          </CardBody>
        </Card>
      )}

      {view === "billing" && (
        <Card>
          <CardHeader trailing={<Pill tone="warning">no subscription</Pill>}>
            Tokens consumibles
          </CardHeader>
          <CardBody>
            <Callout tone="warning">
              last_pack define tier (hilo/imagen), no el saldo. Migración 044: downgrade de pack válido;
              guard solo si p_pack_id = free. Webhook ignora $RCAnonymousID con HTTP 200.
              SEC-01: evento TEST gateado por REVENUECAT_ALLOW_TEST_EVENTS (default OFF en producción) —
              nunca acredita tokens reales sin esa variable activa.
            </Callout>
            <Divider />
            <DagDiagram spec={FLOW_BILLING} title="Compra → webhook → grant → consult consume" />
          </CardBody>
        </Card>
      )}

      {view === "modules" && (
        <Card>
          <CardHeader
            trailing={
              <Row gap={8} align="center">
                <Text size="small">Tabla</Text>
                <Toggle checked={showModuleTable} onChange={setShowModuleTable} />
              </Row>
            }
          >
            Catálogo de módulos (monorepo)
          </CardHeader>
          <CardBody>
            {showModuleTable ? (
              <Table headers={moduleHeaders} rows={moduleRows} striped framed />
            ) : (
              <Grid columns={2} gap={8}>
                {MODULE_CATALOG.map((m) => (
                  <div
                    key={m.id}
                    style={mergeStyle(
                      { padding: 10, borderRadius: 8, border: `1px solid ${theme.stroke.secondary}` },
                      { background: theme.fill.tertiary },
                    )}
                  >
                    <Text weight="medium">{m.id}</Text>
                    <Code>{m.path}</Code>
                    <Text size="small" tone="secondary">
                      {m.role}
                    </Text>
                  </div>
                ))}
              </Grid>
            )}
          </CardBody>
        </Card>
      )}

      {view === "api" && (
        <Card>
          <CardHeader>API Routes (apps/web/src/app/api)</CardHeader>
          <CardBody>
            <Stack gap={12}>
              {API_GROUPS.map((g) => (
                <div key={g.group}>
                  <H3>{g.group}</H3>
                  <Code>{g.routes}</Code>
                </div>
              ))}
              <Text size="small" tone="tertiary">
                Runtime principal: nodejs · consult maxDuration 300s (Fluid/Pro Vercel)
              </Text>
            </Stack>
          </CardBody>
        </Card>
      )}

      {view === "versions" && (
        <Card>
          <CardHeader
            trailing={
              <Row gap={8} align="center">
                <Text size="small">Hitos</Text>
                <Toggle checked={compactVersions} onChange={setCompactVersions} />
              </Row>
            }
          >
            Historial de versiones (muestra)
          </CardHeader>
          <CardBody>
            <Callout tone="info">
              Tabla completa en CHANGELOG.md. Actualizar con: npm run changelog:update -- --version X.Y.Z
              --versionCode N --stage &quot;…&quot;
            </Callout>
            <Table headers={versionHeaders} rows={versionTableRows} striped framed />
          </CardBody>
        </Card>
      )}

      {view === "agents" && (
        <Card>
          <CardHeader trailing={<Pill tone="info">AGENTS.md</Pill>}>Guía para agentes de IA</CardHeader>
          <CardBody>
            <Stack gap={12}>
              <H2>Cómo mantener este canvas</H2>
              <Text>
                1. Tras cambios de arquitectura, actualizar secciones MODULE_CATALOG / FLOW_* en este
                archivo.
                <br />
                2. Bump CURRENT_RELEASE al inicio cuando cambie app.config.js.
                <br />
                3. Añadir fila en VERSION_ROWS o regenerar desde CHANGELOG.md.
                <br />
                4. Usar el campo de notas abajo (persiste en .canvas.data.json).
              </Text>

              <H3>Referencias en el repo</H3>
              <Stack gap={4}>
                <Text>
                  <Code>CHANGELOG.md</Code> — historial releases
                </Text>
                <Text>
                  <Code>docs/auditorias/00000000-RPT-ARCH-01-architecture-fullstack.md</Code> — auditoría técnica A–Z
                </Text>
                <Text>
                  <Code>docs/auditorias/20260612-AUD-PERF-01-claude-image-performance.md</Code> — Phase 0-3, B1/B2/B3
                </Text>
                <Text>
                  <Code>docs/auditorias/20260613-AUD-PRD-01-pre-production-jun13.md</Code> — SEC-01/02, OPS-01, veredicto go-live
                </Text>
                <Text>
                  <Code>CLAUDE.md</Code> — contexto producto y comandos
                </Text>
                <Text>
                  <Code>AGENTS.md</Code> — preferencias aprendidas del usuario
                </Text>
                <Text>
                  <Code>docs/workflows/00000000-WF-I18N-01-i18n-guide.md</Code> · 00000000-WF-I18N-02-i18n-standardization.md
                </Text>
                <Text>
                  <Code>docs/auditorias/20260620-AUD-LRS-01-zhuxi-line-reading-selector.md</Code> — selector Huang/Zhu Xi (074)
                </Text>
                <Text>
                  <Code>apps/web/src/lib/detect-input-language.ts</Code> — idioma pregunta vs UI
                </Text>
              </Stack>

              <H3>Invariantes de producto (no romper)</H3>
              <Text tone="secondary">
                Tokens acumulables · last_pack = última compra (tier hilo/imagen) · free trial 2
                lifetime · RevenueCat product IDs tokens_seeker_20 / practitioner_40 / master_100 ·
                Chats privados server-side · line_reading_system default huang · WebView carga URL
                remota (staging vs prod según build) · Feature flags default OFF:
                ANTHROPIC_STREAM_DELTAS / ANTHROPIC_PARALLEL_IMAGE / ANTHROPIC_PROMPT_V2 /
                REVENUECAT_ALLOW_TEST_EVENTS (esta última NUNCA ON en producción)
              </Text>

              <Divider />

              <Text weight="medium">Notas de arquitectura (persistidas)</Text>
              <TextArea
                value={archNotes}
                onChange={setArchNotes}
                rows={6}
                placeholder="Escribir aquí ajustes recientes para el próximo agente…"
              />
            </Stack>
          </CardBody>
        </Card>
      )}

      <Text size="small" tone="quaternary" style={{ textAlign: "center" }}>
        ARCHITECTURE_SYSTEM.canvas.tsx · {CURRENT_RELEASE.updatedAt} · Turborepo + npm · Expo 53 ·
        Next.js 15
      </Text>
    </Stack>
  );
}
