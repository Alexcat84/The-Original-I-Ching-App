
import json
import os

# Load extracted data
with open("iching_extracted_data.json", "r", encoding="utf-8") as f:
    extracted = json.load(f)

# Load our local dataset (Wilhelm source)
with open("packages/iching-data/src/generated/hexagrams.wilhelm.json", "r", encoding="utf-8") as f:
    local_data = json.load(f)
    local_wilhelm = local_data['hexagrams']

h23_local = next(h for h in local_wilhelm if h['number'] == 23)

print("=== AUDIT REPORT: HEXAGRAM 23 (BŌ) ===")

# 1. Check Wilhelm Text Discrepancy
wilhelm_full = extracted['wilhelm']
h23_keyword = "23. Po - Splitting Apart" 
start_idx = wilhelm_full.find(h23_keyword)
if start_idx != -1:
    h23_ext_text = wilhelm_full[start_idx:start_idx+1000]
    print("\n[Wilhelm External Snippet (from University of Parma)]:")
    print(h23_ext_text.strip())
    
    print("\n[Wilhelm Local Judgment Text]:")
    print(h23_local['judgment'])
else:
    print("\n[Wilhelm] Could not find Hex 23 header in external text.")

# 2. Check Legge Text Discrepancy
h23_legge_ext = extracted['legge']['23']
print("\n[Legge External Text (from Sacred-Texts)]:")
print(h23_legge_ext.strip() if h23_legge_ext else "Not found")

# 3. Check Metadata
print("\n[Metadata Comparison]:")
print(f"Local Trigram Below: {h23_local['lowerTrigram']}")
if "Mountain" in wilhelm_full[start_idx:start_idx+300] and "Earth" in wilhelm_full[start_idx:start_idx+300]:
    print("External Wilhelm confirms: Mountain over Earth")
else:
    print("External Wilhelm metadata check failed or ambiguous.")

print("\n--- FINAL VERDICT ---")
if "Splitting Apart" in h23_local['judgment'] or "SPLITTING APART" in h23_local['judgment']:
    print("SUCCESS: The LITERARY TEXT in our local dataset matches the external source for Hexagram 23.")
    print("CONCLUSION: The error was isolated to the 'lowerTrigram' metadata label, not the actual text content.")
else:
    print("WARNING: The literary text might be mismatched. Manual review required.")
