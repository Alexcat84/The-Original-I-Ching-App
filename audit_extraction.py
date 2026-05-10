
import json
import os

# Load extracted data
with open("iching_extracted_data.json", "r", encoding="utf-8") as f:
    extracted = json.load(f)

# Load our local dataset (Wilhelm source)
# Note: iching_wilhelm_translation.mjs is a JS file, so I'll read it as text or use the JSON I generated earlier if available.
# Actually, I have the generated JSON in packages/iching-data/src/generated/hexagrams.wilhelm.json
with open("packages/iching-data/src/generated/hexagrams.wilhelm.json", "r", encoding="utf-8") as f:
    local_wilhelm = json.load(f)

h23_local = next(h for h in local_wilhelm if h['number'] == 23)

print("=== AUDIT REPORT: HEXAGRAM 23 (BŌ) ===")

# 1. Check Wilhelm Text Discrepancy
# We need to find the text of Hex 23 in the massive Wilhelm string from unipr.it
wilhelm_full = extracted['wilhelm']
h23_keyword = "23. Po - Splitting Apart" # Typical header in that file
start_idx = wilhelm_full.find(h23_keyword)
if start_idx != -1:
    h23_ext_text = wilhelm_full[start_idx:start_idx+500]
    print("\n[Wilhelm External Snippet]:")
    print(h23_ext_text)
    
    print("\n[Wilhelm Local Text Snippet]:")
    print(h23_local['wilhelm_judgment']['text'][:200])
else:
    print("\n[Wilhelm] Could not find Hex 23 header in external text.")

# 2. Check Legge Text Discrepancy
h23_legge_ext = extracted['legge']['23']
print("\n[Legge External Snippet]:")
print(h23_legge_ext[:300] if h23_legge_ext else "Not found")

# 3. Check Metadata
print("\n[Metadata Comparison]:")
print(f"Local Trigram Below (after my fix): {h23_local['lowerTrigram']}")
# In external Wilhelm, we usually see "Mountain over Earth" or similar
if "Mountain" in wilhelm_full[start_idx:start_idx+200] and "Earth" in wilhelm_full[start_idx:start_idx+200]:
    print("External Wilhelm confirms: Mountain over Earth")
else:
    print("External Wilhelm metadata not clearly parsed in snippet.")

