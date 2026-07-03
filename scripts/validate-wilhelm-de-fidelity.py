import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("ANTHROPIC_API_KEY")
if not api_key or api_key == "tu_clave_api_aqui":
    print("Falta la clave API de Anthropic")
    exit(1)

client = anthropic.Anthropic(api_key=api_key)

SYSTEM_PROMPT = """
Eres un erudito bilingüe (Alemán e Inglés) y un auditor ultra-estricto de control de calidad de textos del I Ching de Wilhelm (1924).
Recibirás dos estructuras JSON que contienen hexagramas del I Ching y sus comentarios:
- Versión GOLD: Traducción en Inglés (Baynes, 1950) extraída de un EPUB digital, garantizada como texto perfecto.
- Versión TARGET: Traducción en Alemán (Wilhelm, 1924) extraída de un PDF mediante OCR. Esta versión es PROPENSA A ERRORES DE OCR que debes detectar con máxima rigurosidad.

═══════════════════════════════════════════════════════════
PATRONES DE ERROR OCR CONOCIDOS PARA ESTE PDF ESPECÍFICO
(tipografía gótica alemana del siglo XX — muy difícil para OCR)
═══════════════════════════════════════════════════════════
Debes buscar activamente estos errores de escritura alemana que el OCR comete con frecuencia:

A) SUSTITUCIONES DE LETRAS:
   - "ch" → "dl" o "cl" (ej.: "nidlt" en vez de "nicht", "wadlsen" en vez de "wachsen")
   - "ch" → "cb" o "ch" normal cuando la fuente lo permite
   - Capital "A" → "./l" o ".A" (ej.: "./luch" en vez de "Auch", "./luf" en vez de "Auf")
   - "ß" → "b" o "p" (ej.: "dab" en vez de "daß", "mub" en vez de "muß")
   - "W" mayúscula → "V" (ej.: "Vahrheit" en vez de "Wahrheit")
   - "ü" → "u" o "ii" (ej.: "uber" en vez de "über", "Giite" en vez de "Güte")
   - "ö" → "o" o "6" (ej.: "gr6ß" en vez de "großß")
   - "ä" → "a" o "a" con acento raro

B) PALABRAS COMPUESTAS INCORRECTAMENTE DIVIDIDAS:
   - El alemán une palabras que el OCR separa con espacio (ej.: "Vereinigungs mittelpunkt" en vez de "Vereinigungsmittelpunkt")
   - Guiones de corte de línea que quedan en el texto (ej.: "zusam-\nmenhalten" en vez de "zusammenhalten")

C) MEZCLA DE COLUMNAS / INTERLINEADO:
   - Palabras de una columna adyacente insertadas en medio de una oración
   - Encabezados de página (nombres de hexagramas, números romanos) insertados en el texto
   - Sellos de biblioteca o marcas de archivo (ej.: "UNIVERSITY OF ILLINOIS")

D) PÉRDIDA O CORTE DE TEXTO:
   - Frases que terminan abruptamente a la mitad (sin conclusión)
   - Versos oraculares que faltan el remate final (ej.: "Heil!", "Unheil.", "Kein Makel.")
   - Secciones completas ausentes comparadas con el GOLD inglés

E) CONTAMINACIÓN ENTRE CAMPOS:
   - Texto oracular (oracle text) apareciendo al inicio del campo de comentario (bookOne)
   - Texto de un hexagrama adyacente insertado en otro hexagrama

═══════════════════════════════════════════════════════════
VERIFICACIÓN COMPLETA — TODOS LOS CAMPOS
═══════════════════════════════════════════════════════════
Para CADA hexagrama en el lote, verifica TODOS estos campos uno por uno:

1. CAMPOS BASE (hexagrams.wilhelm.json / hexagrams.baynes.json):
   - judgment.text: ¿El juicio alemán transmite el mismo mensaje que el inglés? ¿Está completo?
   - image.text: ¿La imagen alemana es completa y equivalente?
   - lines[0-5].text: ¿Cada línea oracular está completa? ¿Falta algún verso final?

2. CAMPOS DE COMENTARIO (hexagrams.wilhelm.commentary.json / hexagrams.baynes.commentary.json):
   - judgment.bookOne: ¿Comentario del Juicio (Libro I) equivalente y sin contaminación?
   - judgment.tenWings: ¿Comentario del Juicio (Diez Alas) limpio?
   - image.bookOne: ¿Comentario de la Imagen (Libro I) limpio?
   - image.tenWings: ¿Comentario de la Imagen (Diez Alas) limpio, sin contenido de líneas individuales?
   - lines[0-5].commentary.bookOne: ¿Comentario por línea limpio? ¿No empieza con texto oracular?
   - lines[0-5].commentary.tenWings: ¿Comentario de Diez Alas por línea limpio?
   - about.intro: ¿Introducción del hexagrama completa?
   - about.rulerNote: ¿Nota sobre el Herr del hexagrama correcta y sin prefijos OCR?
   - wenYen (solo hex 1 y 2): ¿Texto de Wen Yen limpio?

═══════════════════════════════════════════════════════════
INSTRUCCIONES DE RESPUESTA
═══════════════════════════════════════════════════════════
1. **Reporta TODOS los errores** — no omitas ninguno aunque parezca menor.
2. Por cada error encontrado, indica:
   ❌ [Hexagrama X] [CAMPO AFECTADO] ERROR: [Describe el error con precisión. Cita el fragmento alemán problemático y el equivalente inglés correcto.]
3. Si detectas un patrón OCR (ej.: "nidlt" por "nicht"), cita el fragmento exacto donde aparece.
4. Si TODOS los hexagramas del lote están perfectos sin ningún error, devuelve EXCLUSIVAMENTE: "Todos perfectos."
5. ES OBLIGATORIO analizar todos los hexagramas del lote. No devuelvas respuesta vacía.
6. Sé RIGUROSO: un texto "casi correcto" con un error OCR sutil es un ERROR que debes reportar."""
"""

def extract_hexagrams(data_list, start_idx, end_idx):
    batch = []
    for item in data_list:
        num = item.get("number")
        if num and start_idx <= num <= end_idx:
            batch.append(item)
    return batch

def run_validation():
    # Paths relative to repo root — run this script from the repo root or adjust BASE_DIR.
    base_dir = os.path.join(os.path.dirname(__file__), "..", "packages", "iching-data", "src", "generated")
    backup_dir = os.path.join(os.path.dirname(__file__), "..", "reports", "wilhelm-de-fidelity-backups")

    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)

    def load_json(filename):
        path = os.path.join(base_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    print("Cargando JSONs...")
    baynes_base = load_json("hexagrams.baynes.json")["hexagrams"]
    wilhelm_base = load_json("hexagrams.wilhelm.json")["hexagrams"]
    baynes_comm = load_json("hexagrams.baynes.commentary.json")
    wilhelm_comm = load_json("hexagrams.wilhelm.commentary.json")

    batches = [(1, 8), (9, 16), (17, 24), (25, 32), (33, 40), (41, 48), (49, 56), (57, 64)]
    full_report = "# Reporte de Verificación I Ching (Alemán PDF vs Inglés EPUB) - VERSIÓN DEFINITIVA\n\n"

    for start, end in batches:
        print(f"\nPreparando lote {start}-{end}...")
        en_base = extract_hexagrams(baynes_base, start, end)
        de_base = extract_hexagrams(wilhelm_base, start, end)
        en_comm = extract_hexagrams(baynes_comm, start, end)
        de_comm = extract_hexagrams(wilhelm_comm, start, end)

        prompt = f"""
        ### VERSIÓN GOLD (INGLÉS) - Hexagramas {start}-{end}
        --- BASE ---
        {json.dumps(en_base, ensure_ascii=False)}
        --- COMENTARIOS ---
        {json.dumps(en_comm, ensure_ascii=False)}

        ### VERSIÓN TARGET (ALEMÁN) - Hexagramas {start}-{end}
        --- BASE ---
        {json.dumps(de_base, ensure_ascii=False)}
        --- COMENTARIOS ---
        {json.dumps(de_comm, ensure_ascii=False)}

        Por favor, realiza la verificación de ERRORES CRÍTICOS para estos hexagramas.
        """

        try:
            print(f"Enviando a la API (Lote {start}-{end})...")
            response = client.messages.create(
                model="claude-sonnet-5",
                max_tokens=8192,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
            )

            if isinstance(response.content, list):
                result_text = "\n".join([b.text for b in response.content if hasattr(b, "text")])
            else:
                result_text = str(response.content)

            if not result_text.strip():
                result_text = "ERROR: La API devolvió una respuesta vacía."

            print(f"Respuesta recibida. Guardando respaldo...")
            backup_file = os.path.join(backup_dir, f"backup_lote_{start}_{end}.txt")
            with open(backup_file, "w", encoding="utf-8") as f:
                f.write(result_text)
            print(f"Respaldo: {backup_file}")

            full_report += f"## Lote: Hexagramas {start} al {end}\n\n{result_text}\n\n"

        except Exception as e:
            error_msg = f"Error Crítico de API en lote {start}-{end}: {str(e)}"
            print(error_msg)
            full_report += f"## Lote: Hexagramas {start} al {end}\n\n{error_msg}\n\n"

    report_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "reports",
        "20260701-EXT-DAT-W-08-wilhelm-de-ocr-fidelity-run.md",
    )
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(full_report)

    print(f"\nVerificación completada. Reporte: {report_path}")

if __name__ == "__main__":
    run_validation()
