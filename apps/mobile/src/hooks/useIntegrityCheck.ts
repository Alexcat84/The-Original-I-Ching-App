import { useEffect, useRef, useState } from "react";
import * as AppIntegrity from "expo-app-integrity";
import * as SecureStore from "expo-secure-store";
import * as Sentry from "@sentry/react-native";
import Constants from "expo-constants";
import {
  IntegrityController,
  SECURE_TOKEN_KEY,
  createIntegrityTraceId,
  type IntegrityClientEvent,
  type IntegrityDeps,
  type IntegrityTokenState,
} from "./integrity-controller";

const BASE_URL: string =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL ??
  "https://theoriginaliching.com";

const ANDROID_CLOUD_PROJECT_NUMBER: number =
  Constants.expoConfig?.extra?.androidCloudProjectNumber ?? 564428602412;

/**
 * Puente de telemetría hacia Sentry y Axiom.
 *
 * El POST viaja con el MISMO bearer que acaba de fallar cuando el fallo es de
 * auth, así que ese reporte muere en 401 y nunca llega a Axiom. Por eso el
 * servidor registra su propia denegación (`integrity_client_event_denied`) desde
 * el 2026-08-23: es la única vía por la que un fallo de auth queda observable.
 */
function reportIntegrityClientEvent(bearerToken: string, payload: IntegrityClientEvent): void {
  if (!payload.ok) {
    Sentry.captureMessage("integrity_client_event", {
      level: "warning",
      tags: {
        api: "integrity",
        source: "mobile",
        phase: payload.phase,
        reason: payload.reason ?? payload.phase,
      },
      extra: {
        traceId: payload.traceId,
        detail: payload.detail ?? null,
        nonceFp: payload.nonceFp ?? null,
        tokenLen: payload.tokenLen ?? null,
      },
    });
  }

  void fetch(`${BASE_URL}/api/integrity/client-event`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bearerToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  }).catch(() => undefined); // Non-fatal: solo telemetría.
}

function productionDeps(): IntegrityDeps {
  return {
    baseUrl: BASE_URL,
    cloudProjectNumber: ANDROID_CLOUD_PROJECT_NUMBER,
    getBearerToken: () => SecureStore.getItemAsync(SECURE_TOKEN_KEY),
    attest: (challenge, projectNumber) => AppIntegrity.attestKey(challenge, projectNumber),
    reportEvent: reportIntegrityClientEvent,
    fetch: (...args) => fetch(...args),
  };
}

/**
 * Gestiona la atestación Play Integrity del shell Android.
 *
 * Envoltorio delgado sobre `IntegrityController`, que es donde viven timers,
 * backoff y guarda de concurrencia. La lógica se extrajo allí para poder probarla
 * sin montar el hook: montar un hook exige un reconciliador, y react-dom está
 * fijado a 18.2.0 por un override global que choca con react 19 de mobile.
 * Ver el comentario de cabecera de `integrity-controller.ts`.
 */
export function useIntegrityCheck(isAuthenticated: boolean) {
  const [tokenState, setTokenState] = useState<IntegrityTokenState | null>(null);
  const controllerRef = useRef<IntegrityController | null>(null);
  if (controllerRef.current === null) {
    controllerRef.current = new IntegrityController(productionDeps(), setTokenState);
  }
  const controller = controllerRef.current;

  useEffect(() => {
    controller.activate();
    if (isAuthenticated) {
      controller.start();
    } else {
      controller.clearSession();
    }
    return () => controller.dispose();
  }, [isAuthenticated, controller]);

  return {
    currentTokenRef: controller.tokenRef,
    currentTraceIdRef: controller.traceIdRef,
    tokenState,
    refreshToken: (traceId?: string) => controller.refresh(traceId),
  };
}

export { createIntegrityTraceId };
