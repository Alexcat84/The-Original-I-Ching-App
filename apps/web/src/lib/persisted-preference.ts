/**
 * Preferencias de UI persistidas en `localStorage`, sin romper la hidratación.
 *
 * EL PROBLEMA QUE RESUELVE
 * El patrón anterior inicializaba el `useState` con un lector de `localStorage`.
 * El servidor no tiene `localStorage`, así que devolvía el default mientras el
 * cliente devolvía el valor guardado: el primer render del cliente discrepaba del
 * HTML del servidor y React reportaba un mismatch de hidratación (error #418).
 *
 * LA TRAMPA DEL ARREGLO INGENUO
 * Mover la lectura a un efecto no basta, y hacerlo mal **borra la preferencia del
 * usuario**. El patrón anterior también reescribía el valor en un `useEffect` con
 * `[valor]` como dependencia, que corre en el montaje. Si el estado se inicializa
 * con el default y la lectura ocurre después, ese efecto de escritura puede
 * dispararse con el default todavía puesto y pisar lo que había guardado. Peor
 * aún: el efecto pasivo del primer commit conserva el valor viejo en su clausura,
 * así que un simple `ref` de "ya hidraté" no lo evita.
 *
 * LA SALIDA
 * Que ningún efecto escriba. La lectura ocurre una vez al montar y **nunca**
 * escribe; la escritura ocurre solo cuando el usuario elige algo, desde el setter.
 * Con eso la pérdida de datos deja de ser un caso a evitar con guardas y pasa a
 * ser estructuralmente imposible: no hay `setItem` en ningún camino de render.
 *
 * Estas funciones son puras respecto del almacenamiento (se les inyecta), así que
 * la secuencia de montaje se puede probar sin renderizar React.
 */

/** Lo mínimo de `localStorage` que hace falta aquí. Inyectable para poder probarlo. */
export interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * `window.localStorage`, o `null` cuando no hay (servidor, modo privado, cookies
 * bloqueadas). Devolver `null` en vez de lanzar deja a los llamadores sin
 * `try/catch` repartidos.
 */
export function browserPreferenceStorage(): PreferenceStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Lee una preferencia guardada, cayendo al default si falta o no es válida.
 *
 * **Nunca escribe.** Es la garantía central: la secuencia de montaje no puede
 * destruir lo que el usuario tenía guardado, porque no toca el almacenamiento
 * más que para leer.
 */
export function readStoredPreference<T extends string>(
  storage: PreferenceStorage | null,
  key: string,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!storage) return fallback;
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return fallback;
  }
  if (raw === null) return fallback;
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

/**
 * Persiste una preferencia. Se llama **solo** desde el setter que atiende una
 * elección explícita del usuario, nunca desde un efecto de render.
 */
export function writeStoredPreference(
  storage: PreferenceStorage | null,
  key: string,
  value: string,
): void {
  if (!storage) return;
  try {
    storage.setItem(key, value);
  } catch {
    /* modo privado o almacenamiento lleno: la preferencia se pierde al recargar,
       que es preferible a romper la interacción */
  }
}
