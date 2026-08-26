import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * Runner de tests para el shell nativo.
 *
 * Usa jsdom y react-dom en vez de un preset de React Native a propósito. Lo que
 * se prueba aquí son hooks de lógica pura (timers, refs, concurrencia, el puente
 * con el WebView), que no renderizan nada específico de React Native. Montar el
 * preset de RN traería la cadena de transformación de Metro y el código con tipos
 * Flow sin aportar nada a esa clase de test. Un test que sí necesite renderizar
 * componentes nativos requerirá su propio setup; ese caso todavía no existe.
 *
 * `dedupe` es la red de seguridad del problema de las dos copias de React: la
 * raíz del monorepo tiene 18.2.0 hoisted y apps/mobile tiene 19.2.3. Dos copias
 * dejan el dispatcher en null y cualquier hook revienta. La defensa principal es
 * que `src/test/render-hook.ts` vive dentro de apps/mobile y por tanto resuelve
 * la misma copia que usa el APK; ver el comentario de ese archivo.
 */
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    exclude: ["**/node_modules/**", "**/android/**", "**/ios/**"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [{ find: /^@\/(.*)$/, replacement: path.resolve(__dirname, ".") + "/$1" }],
  },
});
