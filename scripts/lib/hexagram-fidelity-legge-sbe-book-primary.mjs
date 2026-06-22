/**
 * Oxford SBE XVI scan-verified overrides (book-primary).
 * Applied after OCR + optional EPUB repair-only guide.
 */

/** @type {Record<number, Partial<{ judgment: string; image: string; lines: Record<number, string>; yongJiu: string; yongLiu: string }>>} */
export const LEGGE_SBE_BOOK_PRIMARY_PATCHES = {
  1: {
    yongJiu:
      "(The lines of this hexagram are all strong and undivided, as appears from) the use of the number nine. If the host of dragons (thus) appearing were to divest themselves of their heads, there would be good fortune.",
  },
  10: {
    judgment:
      "(Lî suggests the idea of) one treading on the tail of a tiger, which does not bite him. There will be progress and success.",
    lines: {
      6: "The sixth line, undivided, tells us to look at (the whole course) that is trodden, and examine the presage which that gives. If it be complete and without failure, there will be great good fortune.",
    },
  },
  11: {
    judgment:
      "In Thai (we see) the little gone and the great come. (It indicates that) there will be good fortune, with progress and success.",
    lines: {
      5: "The fifth line, divided, reminds us of (king) Tî-yî's (rule about the) marriage of his younger sister. By such a course there is happiness and there will be great good fortune.",
      6: "The sixth line, divided, shows us the city wall returned into the moat. It is not the time to use the army. (The subject of the line) may, indeed, announce his orders to the people of his own city; but however correct and firm he may be, he will have cause for regret.",
    },
  },
  5: {
    image:
      "(The trigram for) clouds ascending over that for the sky forms Hsü. The superior man, in accordance with this, eats and drinks, feasts and enjoys himself (as if there were nothing else to employ him).",
  },
  16: {
    lines: {
      5: "The fifth line, divided, shows one with a chronic complaint, but who lives on without dying.",
    },
  },
  21: {
    lines: {
      6: "The sixth line, undivided, shows one wearing the cangue, and deprived of his ears. There will be evil.",
    },
  },
  39: {
    judgment:
      "In (the state indicated by) Kien advantage will be found in the south-west, and the contrary in the north-east. It will be advantageous (also) to meet with the great man. (In these circumstances), with firmness and correctness, there will be good fortune.",
    image:
      "(The trigram representing) a mountain, and above it that for water, form Kien. The superior man, in accordance with this, turns round (and examines) himself, and cultivates his virtue.",
    lines: {
      6: "The topmost line, divided, shows its subject going forward, (only to increase) the difficulties, while his remaining stationary will be (productive of) great (merit). There will be good fortune, and it will be advantageous to meet with the great man.",
    },
  },
  53: {
    judgment:
      "Kien suggests to us the marriage of a young lady, and the good fortune (attending it). There will be advantage in being firm and correct.",
    image:
      "(The trigram representing) a mountain and above it that for a tree form Kien. The superior man, in accordance with this, attains to and maintains his extraordinary virtue, and makes the manners of the people good.",
    lines: {
      6: "The sixth line, undivided, shows the geese gradually advanced to the large heights (beyond). Their feathers can be used as ornaments. There will be good fortune.",
    },
  },
};

/**
 * @param {Record<number, { judgment: string; image: string; lines: Record<number, string>; yongJiu?: string; yongLiu?: string }>} rows
 */
export function applyLeggeSbeBookPrimaryPatches(rows) {
  for (const [hexRaw, patch] of Object.entries(LEGGE_SBE_BOOK_PRIMARY_PATCHES)) {
    const n = Number(hexRaw);
    const row = rows[n];
    if (!row) continue;
    if (patch.judgment) row.judgment = patch.judgment;
    if (patch.image) row.image = patch.image;
    if (patch.yongJiu) row.yongJiu = patch.yongJiu;
    if (patch.yongLiu) row.yongLiu = patch.yongLiu;
    if (patch.lines) {
      row.lines = { ...(row.lines ?? {}), ...patch.lines };
    }
  }
  return rows;
}
