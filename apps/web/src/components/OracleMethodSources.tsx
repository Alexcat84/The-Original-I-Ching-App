"use client";

import Link from "next/link";
import { useState } from "react";

const SOURCES = [
  {
    label: "I Ching (Zhouyi 周易) — textos y hexagramas",
    note:
      "Corpus clásico asociado a la dinastía Zhou; las traducciones académicas en occidente suelen citar a Wilhelm/Baynes como referencia estándar.",
    href: "https://en.wikipedia.org/wiki/I_Ching",
  },
  {
    label: "Oracle bone script 甲骨文 — inscripciones y contexto Shang",
    note:
      "Introducción general a la escritura y a la práctica de grabar preguntas en hueso/caparazón (continuidad histórica anterior al Zhouyi tal como lo conocemos hoy).",
    href: "https://en.wikipedia.org/wiki/Oracle_bone_script",
  },
  {
    label: "Pyromancia y adivinación en la China antigua (visión de conjunto)",
    note: "Artículo de referencia en abierto sobre métodos tempranos incl. huesos de tortuga y buey.",
    href: "https://en.wikipedia.org/wiki/Chinese_pyromancy",
  },
] as const;

export function OracleMethodSources() {
  const [open, setOpen] = useState(false);
  return (
    <div className="oracle-method-sources">
      <button type="button" className="sources-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? "Ocultar" : "Ver"} notas y fuentes (I Ching · 甲骨)
      </button>
      {open ? (
        <div className="sources-panel">
          <p className="meta-line doc-help-links">
            <Link href="/guia">Guía rápida de uso</Link>
            {" · "}
            <Link href="/documentacion/iching">El I Ching en esta app</Link>
          </p>
          <p className="meta-line">
            Los dos modos de esta app son <strong>inspirados</strong> en tradiciones históricas: el <strong>I Ching</strong> como
            sistema de líneas y textos del Zhouyi, y los <strong>huesos de oráculo</strong> como práctica shang de sí/no sobre
            cargos en pareja. Los motivos de grieta y las imágenes siguen una <strong>estilización</strong> guiada por descripciones
            de perforaciones y 兆; no sustituyen el estudio de piezas reales en museo o publicación académica.
          </p>
          <ul>
            {SOURCES.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
                <span className="source-note"> — {s.note}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
