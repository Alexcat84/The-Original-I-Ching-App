# Wilhelm book meta fidelity (comments)

- Parsed: `C:\Users\AlexDesk\Documents\iching-app\tools\datasets\wilhelm\comments\wilhelm-64hex-comments-parsed.json`
- Generated: 2026-06-23T17:47:27.950Z

## Summary

| Check | Result |
|-------|--------|
| nombre matches book title | **PASS** |
| chinese_roman matches book header (Wade-Giles) | **PASS** |
| chinese (hanzi) matches gold trad_chinese | **PASS** |
| Bundle `english` differs from book title | **62/64** (expected; product naming) |



## Bundle vs book title (injector drift — not auto-fixed)

| Hex | Book title (Wilhelm) | Bundle `english` |
|-----|----------------------|-------------------|
| 1 | The Creative | Initiating |
| 2 | The Receptive | Responding |
| 3 | Difficulty at the Beginning | Beginning |
| 4 | Youthful Folly | Childhood |
| 5 | Waiting (Nourishment) | Needing |
| 6 | Conflict | Contention |
| 7 | The Army | Multitude |
| 8 | Holding Together [Union] | Union |
| 9 | The Taming Power of the Small | Little Accumulation |
| 10 | Treading [Conduct] | Fulfillment |
| 11 | Peace | Advance |
| 12 | Standstill [Stagnation] | Hindrance |
| 13 | Fellowship with Men | Seeking Harmony |
| 14 | Posession in Great Measure | Great Harvest |
| 15 | Modesty | Humbleness |
| 16 | Enthusiasm | Delight |
| 18 | Work on What Has Been Spoiled [Decay] | Remedying |
| 19 | Approach | Approaching |
| 20 | Contemplation (View) | Watching |
| 21 | Biting Through | Eradicating |
| 22 | Grace | Adorning |
| 23 | Splitting Apart | Falling Away |
| 24 | Return (The Turning Point) | Turning Back |
| 25 | Innocence (The Unexpected) | Without Falsehood |
| 26 | The Taming Power of the Great | Great Accumulation |
| 27 | The Corners of the Mouth | Nourishing |
| 28 | Preponderance of the Great | Great Exceeding |
| 29 | The Abysmal (Water) | Darkness |
| 30 | The Clinging, Fire | Brightness |
| 31 | Influence (Wooing) | Mutual Influence |
| 32 | Duration | Long Lasting |
| 34 | The Power of the Great | Great Strength |
| 35 | Progress | Proceeding Forward |
| 36 | Darkening of the Light | Brilliance Injured |
| 37 | The Family [The Clan] | Household |
| 38 | Opposition | Diversity |
| 39 | Obstruction | Hardship |
| 40 | Deliverance | Relief |
| 41 | Decrease | Decreasing |
| 42 | Increase | Increasing |
| 43 | Break-through (Resoluteness) | Eliminating |
| 44 | Coming to Meet | Encountering |
| 45 | Gathering Together [Massing] | Bringing Together |
| 46 | Pushing Upward | Growing Upward |
| 47 | Oppression (Exhaustion) | Exhausting |
| 48 | The Well | Replenishing |
| 49 | Revolution (Molting) | Abolishing The Old |
| 50 | The Caldron | Establishing The New |
| 51 | The Arousing (Shock, Thunder) | Taking Action |
| 52 | Keeping Still, Mountain | Keeping Still |
| 53 | Development (Gradual Progress) | Developing Gradually |
| 54 | The Marrying Maiden | Marrying Maiden |
| 55 | Abundance [Fullness] | Abundance |
| 56 | The Wanderer | Travelling |
| 57 | The Gentle (Penetrating, Wind) | Proceeding Humbly |
| 58 | The Joyous, Lake | Joyful |
| 59 | Dispersion [Dissolution] | Dispersing |
| 60 | Limitation | Restricting |
| 61 | Inner Truth | Innermost Sincerity |
| 62 | Preponderance of the Small | Little Exceeding |
| 63 | After Completion | Already Fulfilled |
| 64 | Before Completion | Not Yet Fulfilled |

## Hanzi source

Book TXT/EPUB headers carry Wade-Giles (`chinese_roman`), not extractable hanzi. Dataset `chinese` comes from `scripts/iching_wilhelm_translation.mjs` → `trad_chinese`, cross-checked vs Zhou Yi / ctext. See `tools/datasets/wilhelm/wilhelm-hex-chinese-gold.json`.
