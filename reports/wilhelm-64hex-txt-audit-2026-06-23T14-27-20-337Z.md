# Wilhelm 64-hex TXT audit

- Source: `C:\Users\AlexDesk\Documents\iching-app\tools\source-pdfs\I Ching or Book of Changes (Bollingen Series), The - Wilhelm, Hellmut-64hex.txt`
- Parsed JSON: `C:\Users\AlexDesk\Documents\iching-app\tools\output\wilhelm-64hex-parsed.json`
- Zone lines: 12956

## G0 structure

**PASS**

No structural errors.

## G1 oracle vs runtime

**FAIL**

- Match: 512/514
- Mismatch: 2

### First mismatches

#### Hex 54 L3

**Runtime:**
```
The marrying maiden as a slave.
She marries as a concubine.
```

**TXT:**
```
The marrying maiden as a slave.
She marries as a concubine.
A girl who is in a lowly position and finds no husband may, in some circumstances, still win shelter as a concubine.
```

#### Hex 59 L4

**Runtime:**
```
He dissolves his bond with his group.
Supreme good fortune.
Dispersion leads in turn to accumulation.
This is something that ordinary men do not think of.
```

**TXT:**
```
He dissolves his bond with his group.1
Supreme good fortune.
Dispersion leads in turn to accumulation.
This is something that ordinary men do not think of.
```

