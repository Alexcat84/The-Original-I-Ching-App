
import trafilatura
from trafilatura import fetch_url
import json
import time
import os

def extract_content(url):
    print(f"Fetching {url}...")
    downloaded = fetch_url(url)
    if downloaded:
        text = trafilatura.extract(downloaded, include_comments=False, include_formatting=True)
        return text
    return None

# 1. Wilhelm (One big page)
wilhelm_url = "http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html"
wilhelm_text = extract_content(wilhelm_url)

# 2. Legge (Index + subpages)
legge_base = "https://sacred-texts.com/ich/"
legge_data = {}
print("Extracting Legge (Sample: Hex 1, 23, 64)...")
for i in [1, 23, 64]:
    url = f"{legge_base}ic{str(i).zfill(2)}.htm"
    legge_data[i] = extract_content(url)
    time.sleep(1)

# 3. CTP (Index + subpages)
ctp_base = "https://ctext.org/book-of-changes/"
ctp_data = {}
# ctext uses names, but we can try to find them. 
# For now, let's just get the main page and maybe one specific
print("Extracting CTP (Main + Hex 1)...")
ctp_data["main"] = extract_content("https://ctext.org/book-of-changes")
ctp_data["hex1"] = extract_content("https://ctext.org/book-of-changes/qian")

results = {
    "wilhelm": wilhelm_text,
    "legge": legge_data,
    "ctp": ctp_data
}

with open("iching_extracted_data.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("\nExtraction complete. Saved to iching_extracted_data.json")
