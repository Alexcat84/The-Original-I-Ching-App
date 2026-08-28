/**
 * QA code: TS-WEB-019 persisted-preference · v1.1.0
 * Area: apps/web/src/lib/persisted-preference
 * Family: CHAT
 */

/**
 * Gate obligatorio de T-03, fijado por la auditoría externa:
 *
 *   "un test que simule un montaje con un valor no-default guardado y afirme que
 *    ese valor SOBREVIVE".
 *
 * El modo de fallo aquí no es un render feo: es **perder una preferencia real del
 * usuario**. Por eso el ticket se separó del arreglo de `cachedAuthEmail`, que no
 * tenía este riesgo, y por eso este archivo existe.
 *
 * La secuencia de montaje se simula con las primitivas en vez de renderizar,
 * porque `apps/web` no tiene entorno DOM y añadir uno significaba dependencias
 * nuevas. Es el mismo enfoque humble-object que la auditoría endosó para el shell
 * nativo.
 */

import { describe, expect, it, vi } from "vitest";
import {
  readStoredPreference,
  writeStoredPreference,
  type PreferenceStorage,
} from "../persisted-preference";

const CASTING_KEY = "iching_casting_method_v1";
const CASTING_ALLOWED = ["three-coins", "yarrow-stalks"] as const;
const CASTING_DEFAULT = "three-coins";

const LINE_KEY = "iching_line_reading_system_v1";
const LINE_ALLOWED = ["huang", "zhuxi"] as const;
const LINE_DEFAULT = "huang";

const CAST_MODE_KEY = "iching_cast_mode_v1";
const CAST_MODE_ALLOWED = ["auto", "manual"] as const;
const CAST_MODE_DEFAULT = "auto";

/** Almacenamiento espiado sobre un Map, para poder afirmar que NO se escribió. */
function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const setItem = vi.fn((k: string, v: string) => {
    data.set(k, v);
  });
  const getItem = vi.fn((k: string) => data.get(k) ?? null);
  return { storage: { getItem, setItem } as PreferenceStorage, data, setItem, getItem };
}

// ── EL GATE ──────────────────────────────────────────────────────────────────

describe("montaje con una preferencia no-default guardada", () => {
  it("la lee y NO la destruye (metodo de tirada)", () => {
    const s = fakeStorage({ [CASTING_KEY]: "yarrow-stalks" });

    // Esto es todo lo que hace el montaje: leer una vez.
    const valor = readStoredPreference(s.storage, CASTING_KEY, CASTING_ALLOWED, CASTING_DEFAULT);

    expect(valor).toBe("yarrow-stalks");
    expect(s.setItem).not.toHaveBeenCalled(); // el gate
    expect(s.data.get(CASTING_KEY)).toBe("yarrow-stalks"); // sobrevivio
  });

  it("la lee y NO la destruye (sistema de lectura de lineas)", () => {
    const s = fakeStorage({ [LINE_KEY]: "zhuxi" });

    const valor = readStoredPreference(s.storage, LINE_KEY, LINE_ALLOWED, LINE_DEFAULT);

    expect(valor).toBe("zhuxi");
    expect(s.setItem).not.toHaveBeenCalled();
    expect(s.data.get(LINE_KEY)).toBe("zhuxi");
  });

  it("la lee y NO la destruye (modo de tirada manual)", () => {
    // P-11: este es el caso que en el patron viejo se autocorregia, pero pasaba
    // por un estado transitorio en el que "auto" pisaba el "manual" guardado.
    // Si la pestana se cerraba en ese hueco, el usuario perdia su modo manual.
    const s = fakeStorage({ [CAST_MODE_KEY]: "manual" });

    const valor = readStoredPreference(s.storage, CAST_MODE_KEY, CAST_MODE_ALLOWED, CAST_MODE_DEFAULT);

    expect(valor).toBe("manual");
    expect(s.setItem).not.toHaveBeenCalled();
    expect(s.data.get(CAST_MODE_KEY)).toBe("manual");
  });

  it("montar varias veces seguidas tampoco la toca", () => {
    const s = fakeStorage({ [CASTING_KEY]: "yarrow-stalks" });

    for (let i = 0; i < 5; i++) {
      readStoredPreference(s.storage, CASTING_KEY, CASTING_ALLOWED, CASTING_DEFAULT);
    }

    expect(s.setItem).not.toHaveBeenCalled();
    expect(s.data.get(CASTING_KEY)).toBe("yarrow-stalks");
  });
});

/**
 * Documenta POR QUÉ cambió el patrón. Reproduce la secuencia vieja (escribir el
 * estado en un efecto que corre al montar) y demuestra que destruía la
 * preferencia. Si alguien vuelve a introducir una escritura en un efecto de
 * montaje, este test explica el daño que causa.
 */
describe("la secuencia vieja destruia la preferencia", () => {
  it("escribir el default en el montaje pisa lo guardado", () => {
    const s = fakeStorage({ [CASTING_KEY]: "yarrow-stalks" });

    // Patron viejo: el estado arranca en el default y un efecto lo persiste
    // antes de que la lectura haya podido aplicarse.
    writeStoredPreference(s.storage, CASTING_KEY, CASTING_DEFAULT);

    expect(s.data.get(CASTING_KEY)).toBe("three-coins"); // preferencia perdida
  });
});

// ── Lectura ──────────────────────────────────────────────────────────────────

describe("readStoredPreference", () => {
  it("cae al default cuando no hay nada guardado", () => {
    const s = fakeStorage();
    expect(readStoredPreference(s.storage, CASTING_KEY, CASTING_ALLOWED, CASTING_DEFAULT))
      .toBe("three-coins");
    expect(s.setItem).not.toHaveBeenCalled();
  });

  it("cae al default ante un valor guardado invalido, sin corregirlo en disco", () => {
    const s = fakeStorage({ [CASTING_KEY]: "basura-de-otra-version" });

    expect(readStoredPreference(s.storage, CASTING_KEY, CASTING_ALLOWED, CASTING_DEFAULT))
      .toBe("three-coins");
    // No se "repara" el valor: escribir aqui seria justo el efecto que se elimino.
    expect(s.setItem).not.toHaveBeenCalled();
    expect(s.data.get(CASTING_KEY)).toBe("basura-de-otra-version");
  });

  it("cae al default sin almacenamiento (servidor)", () => {
    expect(readStoredPreference(null, CASTING_KEY, CASTING_ALLOWED, CASTING_DEFAULT))
      .toBe("three-coins");
  });

  it("cae al default si getItem lanza (modo privado)", () => {
    const storage = {
      getItem: () => { throw new Error("SecurityError"); },
      setItem: vi.fn(),
    } as PreferenceStorage;

    expect(readStoredPreference(storage, CASTING_KEY, CASTING_ALLOWED, CASTING_DEFAULT))
      .toBe("three-coins");
  });

  it("el servidor y un cliente sin nada guardado coinciden, que es lo que evita el mismatch", () => {
    const servidor = readStoredPreference(null, CASTING_KEY, CASTING_ALLOWED, CASTING_DEFAULT);
    const cliente = readStoredPreference(fakeStorage().storage, CASTING_KEY, CASTING_ALLOWED, CASTING_DEFAULT);
    expect(servidor).toBe(cliente);
  });
});

// ── Escritura ────────────────────────────────────────────────────────────────

describe("writeStoredPreference", () => {
  it("persiste el valor que le dan", () => {
    const s = fakeStorage();
    writeStoredPreference(s.storage, CASTING_KEY, "yarrow-stalks");
    expect(s.data.get(CASTING_KEY)).toBe("yarrow-stalks");
  });

  it("no hace nada sin almacenamiento", () => {
    expect(() => writeStoredPreference(null, CASTING_KEY, "yarrow-stalks")).not.toThrow();
  });

  it("no rompe la interaccion si setItem lanza (cuota llena)", () => {
    const storage = {
      getItem: () => null,
      setItem: () => { throw new Error("QuotaExceededError"); },
    } as PreferenceStorage;

    expect(() => writeStoredPreference(storage, CASTING_KEY, "yarrow-stalks")).not.toThrow();
  });

  it("un cambio del usuario sobrevive a un montaje posterior", () => {
    const s = fakeStorage({ [CASTING_KEY]: "three-coins" });

    writeStoredPreference(s.storage, CASTING_KEY, "yarrow-stalks");
    const trasRecargar = readStoredPreference(s.storage, CASTING_KEY, CASTING_ALLOWED, CASTING_DEFAULT);

    expect(trasRecargar).toBe("yarrow-stalks");
  });
});
