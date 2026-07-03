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
Eres un erudito bilingüe (Alemán e Inglés) y auditor de calidad.
Recibirás un lote de hexagramas.
GOLD: Inglés (Baynes, 1950)
TARGET: Alemán (Wilhelm, 1924) extraído por OCR.

TAREA:
Escanea el texto rápidamente en busca de inconsistencias sin hacer una comparación caracter por caracter. Tu trabajo principal es comparar el Alemán contra el Inglés buscando anomalías.
Busca específicamente:
1. Errores de OCR (ej. palabras mal escritas como "verstekken", "nidit", "dab", o saltos de línea basura).
2. Fechas que no coincidan entre el texto en alemán y el inglés.
3. Fragmentos de texto mezclados o cortados.

INSTRUCCIONES DE RESPUESTA:
- Si detectas EL MÁS MÍNIMO detalle o error en un hexagrama, repórtalo con una ❌ y descríbelo.
- Si un hexagrama está completamente libre de errores, es OBLIGATORIO que devuelvas exactamente esta frase: ✅ [Hexagrama X] sin inconsistencias.
- No debes dejar ningún hexagrama en silencio. Cada uno de los 2 hexagramas del lote debe tener su estado impreso.
"""

def extract_hexagrams(data_list, start_idx, end_idx):
    batch = []
    for item in data_list:
        num = item.get("number")
        if num and start_idx <= num <= end_idx:
            batch.append(item)
    return batch

def run_validation():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backup_dir = os.path.join(base_dir, "backups_api")

    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)

    def load_json(filename):
        path = os.path.join(base_dir, filename)
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    # JSONs are expected alongside this script or in the generated output path.
    # Copy from packages/iching-data/src/generated/ before running:
    #   cp packages/iching-data/src/generated/hexagrams.*.json scripts/
    print("Cargando JSONs...")
    baynes_base = load_json("hexagrams.baynes.json")["hexagrams"]
    wilhelm_base = load_json("hexagrams.wilhelm.json")["hexagrams"]
    baynes_comm = load_json("hexagrams.baynes.commentary.json")
    wilhelm_comm = load_json("hexagrams.wilhelm.commentary.json")

    # All 32 lotes — 2 hexagrams each — full coverage of the 64 hexagrams
    batches = [
        (1, 2), (3, 4), (5, 6), (7, 8), (9, 10), (11, 12), (13, 14), (15, 16),
        (17, 18), (19, 20), (21, 22), (23, 24), (25, 26), (27, 28), (29, 30), (31, 32),
        (33, 34), (35, 36), (37, 38), (39, 40), (41, 42), (43, 44), (45, 46), (47, 48),
        (49, 50), (51, 52), (53, 54), (55, 56), (57, 58), (59, 60), (61, 62), (63, 64),
    ]

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

            # Guardar reporte individual para este lote
            batch_report = f"# Reporte de Verificación I Ching (Alemán PDF vs Inglés EPUB) - Hexagramas {start} al {end}\n\n{result_text}\n"
            report_path = os.path.join(base_dir, f"reporte_lote_{start}_{end}.md")
            with open(report_path, "w", encoding="utf-8") as f:
                f.write(batch_report)

        except Exception as e:
            error_msg = f"Error Crítico de API en lote {start}-{end}: {str(e)}"
            print(error_msg)
            
            batch_report = f"# Reporte de Verificación I Ching (Alemán PDF vs Inglés EPUB) - Hexagramas {start} al {end}\n\n{error_msg}\n"
            report_path = os.path.join(base_dir, f"reporte_lote_{start}_{end}.md")
            with open(report_path, "w", encoding="utf-8") as f:
                f.write(batch_report)

    print(f"\nVerificación completada para todos los lotes restantes.")

if __name__ == "__main__":
    run_validation()
