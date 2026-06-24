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

#### Hex 34 image

**Runtime:**
```
Thunder in heaven above:
The image of THE POWER OF THE
GREAT.
Thus the superior man does not tread upon paths
That do not accord with established order.
```

**TXT:**
```
Thunder in heaven above:
The image of THE POWER OF THE
GREAT.
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

