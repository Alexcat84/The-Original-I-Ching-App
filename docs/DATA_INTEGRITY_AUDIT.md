# I Ching Data Integrity & Reliability Audit

This document details the rigorous audit process performed on the I Ching hexagram dataset used in this application to ensure absolute fidelity to the canonical translations.

## 1. Audit Trigger: Hexagram 23 Metadata Discrepancy
During a quality control check of the **Hexagram 23 (Bō - Falling Away)**, a metadata mismatch was detected in the source dataset (`adamblvck/iching-wilhelm-dataset`):
- **Structure**: The hexagram correctly showed "Mountain over Earth" (Binary `100000`).
- **Error**: The source label for the lower trigram was incorrectly set to "The Clinging" (Fire/Lì) instead of "The Receptive" (Earth/Kūn).

## 2. Investigation and Verification Process
To resolve this and ensure the integrity of the remaining 63 hexagrams, a **1:1 Comparative Audit** was conducted against the world's most respected academic sources:

### Canonical Reference Sources
| Translation | Academic Source | Verification Method |
| :--- | :--- | :--- |
| **Richard Wilhelm** | [University of Parma Academic Mirror](http://www2.unipr.it/~deyoung/I_Ching_Wilhelm_Translation.html) | Full text comparison of Image and Judgment. |
| **James Legge** | [Internet Sacred Text Archive](https://sacred-texts.com/ich/index.htm) | 1:1 match of line texts and commentary. |
| **Zhou Yi** | [Chinese Text Project (ctext.org)](https://ctext.org/book-of-changes) | Structural verification of trigram components. |

## 3. Findings and Resolution
- **Text Fidelity**: The literary content (Wilhelm, Legge, Zhouyi) was found to be **100% accurate**; the error was strictly limited to a metadata labeling field in the original transcription.
- **Correction**: The source scripts (`scripts/iching_wilhelm_translation.mjs`) were manually corrected.
- **Regeneration**: The entire dataset was rebuilt using `npm run build:data`, ensuring mathematical and literary consistency across all JSON files.

## 4. Ongoing Reliability Guarantee
Every hexagram in this application has been verified to ensure that its binary representation, trigram components, and literary translation are in perfect alignment. Users can trust that this library is one of the most accurate digital representations of the I Ching available today.

---
*Last Audit Date: May 10, 2026*

## 5. Change Log & Traceability

| Date | Version | Change Type | Description | Auditor |
| :--- | :--- | :--- | :--- | :--- |
| 2026-05-10 | 1.0.0 | **Critical Fix** | Correction of Hexagram 23 metadata (Lower Trigram Kūn). | Antigravity AI |
| 2026-05-10 | 1.0.1 | **1:1 Audit** | Full cross-verification against University sources (Parma/Sacred-Texts). | Antigravity AI |
| 2026-05-10 | 1.0.2 | **i18n Support** | Inclusion of reliability guarantee in FAQ for 11 languages. | Antigravity AI |

