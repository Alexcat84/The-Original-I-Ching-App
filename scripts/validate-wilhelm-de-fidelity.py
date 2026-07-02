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
Eres un erudito bilingüe (Alemán e Inglés) y un auditor ultra-estricto de control de calidad.
Recibirás dos estructuras JSON que contienen hexagramas del I Ching y sus comentarios:
- Versión GOLD: Traducción en Inglés (Baynes, 1950) extraída de un EPUB, garantizada como perfecta.
- Versión TARGET: Traducción en Alemán (Wilhelm, 1924) extraída de un PDF mediante OCR, propensa a errores.

Tu tarea es actuar como un humano experto: debes leer ambos textos y verificar campo a campo que el MENSAJE y EL SIGNIFICADO SEMÁNTICO sean exactamente equivalentes.
El hecho de que estén en idiomas distintos no es excusa para perder el sentido original ni el misticismo del texto.

BUSCAMOS ERRORES CRÍTICOS COMO ESTOS:
1. Pérdida de significado: El texto en alemán no transmite el mismo mensaje que la versión en inglés (ej. una traducción rota, cortada a medias o un OCR que arruinó el sentido de la frase).
2. Estructura y mezcla: Falta una línea entera, faltan secciones de las Diez Alas, o texto del 'Juicio' está mezclado con la 'Imagen'.
3. Basura PDF: Aparición de caracteres extraños, números de página u OCR basura incrustados en los párrafos en alemán.

INSTRUCCIONES DE RESPUESTA ESTRICTAS (PARA AHORRAR TOKENS):
1. **NO REPORTE HEXAGRAMAS PERFECTOS.** Si un hexagrama está bien, ignóralo completamente.
2. Por cada hexagrama que TENGA UN ERROR, indica:
   ❌ [Hexagrama X] ERROR CRÍTICO: [Describe el error, cita qué fragmento no coincide semánticamente, qué falta o qué está contaminado].
3. Si TODOS los hexagramas de este lote están perfectos y no hay absolutamente ningún error, devuelve EXCLUSIVAMENTE este texto: "Todos perfectos."

MUY IMPORTANTE: ES OBLIGATORIO que devuelvas el análisis de TODOS los hexagramas solicitados que tengan errores. Bajo ninguna circunstancia puedes devolver una respuesta vacía.
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
