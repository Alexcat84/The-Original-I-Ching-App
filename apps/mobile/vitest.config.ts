import { defineConfig } from "vitest/config";

/**
 * Runner de tests del shell nativo.
 *
 * Entorno `node`, sin DOM y sin React. Lo que se prueba son controladoras planas
 * (timers, backoff, concurrencia), extraídas de los hooks justamente para no
 * necesitar un reconciliador. Ver la cabecera de `src/hooks/integrity-controller.ts`.
 *
 * NO añadir react-dom ni jsdom aquí: el override global de la raíz fija react-dom
 * en 18.2.0 y choca con react 19 de apps/mobile, rompiendo el install limpio de
 * Vercel con ERESOLVE. Ya pasó una vez.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/android/**", "**/ios/**"],
  },
});
