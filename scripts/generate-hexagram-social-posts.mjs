#!/usr/bin/env node
/**
 * Generates Hexagram of the Day social posts from hexagrams.baynes.json.
 * Metadata (number, name, hanzi, pinyin) is read directly from the bundle.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BAYNES_PATH = path.join(
  ROOT,
  'packages/iching-data/src/generated/hexagrams.baynes.json',
);
const OUT_PATH = path.join(ROOT, 'tools/output/hexagram-of-the-day-posts.md');

/** Display name overrides (social copy only). */
const NAME_OVERRIDES = {
  14: 'Possession in Great Measure',
};

/** Hook + body paraphrased from each hex judgment (Baynes/Wilhelm EN). */
const COPY = {
  1: {
    hook: 'Pure creative force. Heaven above heaven, the power to begin.',
    body: 'Success comes through perseverance, not haste. Strength grows when you act in time and know when to wait.',
  },
  2: {
    hook: 'Open earth. Receive, follow, and carry what is arising.',
    body: 'Forcing leadership now leads astray. Devoted yielding opens the way to sublime success.',
  },
  3: {
    hook: 'New life struggles to break through. Chaos precedes form.',
    body: 'Do not rush what is not ready. Persevere quietly and gather the right helpers.',
  },
  4: {
    hook: 'Innocence seeks guidance. The student must come to the teacher.',
    body: 'True learning begins with humility. Ask once with sincerity; forcing answers closes the door.',
  },
  5: {
    hook: 'Strength gathered in stillness. Wait with sincerity, not passivity.',
    body: 'The right moment will come. Nourish yourself now so you can cross the great water when it opens.',
  },
  6: {
    hook: 'Opposition blocks your path. Sincerity alone does not end the struggle.',
    body: 'Stop halfway rather than push to ruin. Seek wise counsel before you cross the great water.',
  },
  7: {
    hook: 'Collective force needs discipline and a firm leader.',
    body: 'Move only with clear command and steady perseverance. Strength without order brings chaos.',
  },
  8: {
    hook: 'Union requires sincerity, constancy, and the right center.',
    body: 'People gather around what is genuine. Those who arrive late miss the moment.',
  },
  9: {
    hook: 'Small forces restrain the great. Clouds gather, but rain has not yet fallen.',
    body: 'Progress is subtle, not dramatic. Hold back until the moment to release truly arrives.',
  },
  10: {
    hook: 'You walk beside danger with careful conduct.',
    body: 'Respectful presence disarms what could destroy you. Propriety is your protection.',
  },
  11: {
    hook: 'Heaven and earth unite. What is small withdraws; what is great advances.',
    body: 'This is a season of harmony and expansion. Align with the rising tide.',
  },
  12: {
    hook: 'Flow stops. The small rises while the great withdraws.',
    body: 'Do not waste force against stagnation. Hold inner truth until the cycle turns.',
  },
  13: {
    hook: 'Open fellowship under heaven. Hearts unite in broad purpose.',
    body: 'True community is not closed or secret. Persevere in the open and the path widens.',
  },
  14: {
    hook: 'Great measure without arrogance. Abundance held with clarity.',
    body: 'Supreme success belongs to those who carry wealth lightly. Stay aligned with what is greater than yourself.',
  },
  15: {
    hook: 'True strength lowers itself. Modesty completes what pride cannot.',
    body: 'Let accomplishment speak quietly. Humility is what carries great things through.',
  },
  16: {
    hook: 'Joy mobilizes people. Enthusiasm sets things in motion.',
    body: 'Rally support and move with purpose. Shared excitement becomes collective power.',
  },
  17: {
    hook: 'To lead well, first know how to follow.',
    body: 'Adapt to the rhythm of what is greater. Sincere following brings supreme success.',
  },
  18: {
    hook: 'Decay can be repaired. What was spoiled asks for restoration.',
    body: 'Face what went wrong with patience. Repair the root before you cross the great water.',
  },
  19: {
    hook: 'Influence draws near. A season of approach opens before you.',
    body: 'Act while the tide is rising, but remember: what ascends must eventually decline.',
  },
  20: {
    hook: 'Be seen before you speak. Contemplation reaches others through presence.',
    body: 'Prepare inwardly first. When your stillness is sincere, others look up with trust.',
  },
  21: {
    hook: 'Obstruction must be chewed through. Clarity cuts what blocks the whole.',
    body: 'Decisive justice clears the path. Do not tolerate what corrupts the flow.',
  },
  22: {
    hook: 'Beauty adorns truth, but does not replace it.',
    body: 'Form matters, yet keep substance first. Grace succeeds in small, careful steps.',
  },
  23: {
    hook: 'What is untrue falls away. The structure splits apart.',
    body: 'This is not a time to advance. Withdraw and let what cannot stand collapse on its own.',
  },
  24: {
    hook: 'The turning point arrives. Light returns after the darkest edge.',
    body: 'The cycle renews itself. Move with the return and friends will come without blame.',
  },
  25: {
    hook: 'Act without contrivance. Innocence aligns you with the unexpected.',
    body: 'Forced cunning brings misfortune. Natural sincerity opens supreme success.',
  },
  26: {
    hook: 'Great force held in reserve. The wild is tamed by steady strength.',
    body: 'Restraint matures power. Sometimes growth means leaving comfort to cross the great water.',
  },
  27: {
    hook: 'What you take in shapes you. Nourishment is sacred care.',
    body: 'Watch what feeds body and spirit. Perseverance in right sustenance brings good fortune.',
  },
  28: {
    hook: 'The weight is too great. The beam bends toward breaking.',
    body: 'Extraordinary pressure demands movement, not denial. Go where the load can be borne.',
  },
  29: {
    hook: 'Danger repeated, like water falling into water. Keep moving with sincerity.',
    body: 'Do not fight the abyss with rigidity. Flow through difficulty and your heart stays true.',
  },
  30: {
    hook: 'Clarity clings to what gives light. Fire illuminates when it has fuel.',
    body: 'Attach yourself to what is steady and bright. Perseverance in right dependence brings success.',
  },
  31: {
    hook: 'Gentle influence moves hearts before force ever could.',
    body: 'Attraction grows through sensitivity, not pressure. Mutual response brings lasting union.',
  },
  32: {
    hook: 'Endurance is virtue made visible. What lasts stands through change.',
    body: 'Do not chase novelty for its own sake. Steady constancy carries you without blame.',
  },
  33: {
    hook: 'Strategic withdrawal is not defeat. Knowing when to step back is wisdom.',
    body: 'Retreat while the matter is still small. Preserve strength for what truly matters.',
  },
  34: {
    hook: 'Great power rises. The strong must not lose measure.',
    body: 'Force without restraint destroys itself. Persevere with discipline and your strength serves you.',
  },
  35: {
    hook: 'Advancement comes into the light. Recognition follows genuine progress.',
    body: 'Move forward openly and honor will find you. Perseverance turns effort into visible ascent.',
  },
  36: {
    hook: 'Light hides beneath injury. Brightness goes underground to survive.',
    body: 'In dark times, do not expose what must be protected. Inner perseverance keeps the flame alive.',
  },
  37: {
    hook: 'Order begins at home. The family is the root of all relation.',
    body: 'Clear roles and steady devotion stabilize everything outward. Tend the inner hearth first.',
  },
  38: {
    hook: 'Difference creates tension. Two forces look away from each other.',
    body: 'Do not force total agreement. Find good fortune in small steps despite opposition.',
  },
  39: {
    hook: 'The path is blocked. Obstacles stand before you.',
    body: 'Turn toward what opens rather than what closes. Seek the great person and persevere.',
  },
  40: {
    hook: 'Release after tension. What was bound begins to loosen.',
    body: 'Do not cling once the trouble passes. Return to clarity and freedom brings good fortune.',
  },
  41: {
    hook: 'Less can be more when sacrifice is sincere.',
    body: 'True decrease is not loss but offering. Sincere restraint brings supreme good fortune.',
  },
  42: {
    hook: 'Growth spreads outward. Blessing increases when shared.',
    body: 'This is a time to act boldly. Accept increase and carry it across the great water.',
  },
  43: {
    hook: 'Truth must break through. What is hidden demands open resolution.',
    body: 'Speak clearly and resolutely, but avoid violence. Make the matter known with integrity.',
  },
  44: {
    hook: 'A powerful encounter arrives unbidden. Temptation meets you on the road.',
    body: 'Not every attraction should be pursued. Discern what is disproportionate before you commit.',
  },
  45: {
    hook: 'People assemble around a shared center. Gathering magnifies what unites.',
    body: 'Great offerings and sincere purpose draw the many. Gather around what is sacred and true.',
  },
  46: {
    hook: 'Steady ascent, like a tree on the mountain. Rise without force.',
    body: 'Push upward with humility and meet what guides you. Departure toward the south brings good fortune.',
  },
  47: {
    hook: 'Exhaustion presses in, yet the spirit can remain unbroken.',
    body: 'When words are not believed, integrity speaks through endurance. Perseverance brings good fortune.',
  },
  48: {
    hook: 'The source endures. Villages change, but the well remains.',
    body: 'Return to what nourishes everyone alike. Draw deeply from the source that never runs dry.',
  },
  49: {
    hook: 'Old skin must be shed. Revolution comes when the time is ripe.',
    body: 'Change is believed when it is true to the moment. Persevere through the turning and remorse disappears.',
  },
  50: {
    hook: 'The vessel that transforms and nourishes culture. The cauldron holds what feeds the many.',
    body: 'Refine what you carry so it can serve the whole. Transformation in the right vessel brings supreme good fortune.',
  },
  51: {
    hook: 'Thunder awakens. Shock shakes the stillness without breaking the sacred.',
    body: 'Sudden fright can clear stagnation. Stay centered when the earth trembles and success follows.',
  },
  52: {
    hook: 'Stillness as power. The mountain does not move.',
    body: 'Stop inner agitation before you act outwardly. True rest brings clarity without blame.',
  },
  53: {
    hook: 'Gradual growth, step by step. Development cannot be rushed.',
    body: 'Like the tree on the mountain, advance slowly and surely. Patience in process brings good fortune.',
  },
  54: {
    hook: 'Union out of place. The wrong footing makes every step uncertain.',
    body: 'Not every connection should become commitment. See what is secondary before you act.',
  },
  55: {
    hook: 'Fullness at its peak. Abundance shines like the sun at noon.',
    body: 'Do not grieve at the height of fortune. Remember: fullness already carries the seed of change.',
  },
  56: {
    hook: 'The stranger passes through. The wanderer succeeds by staying light.',
    body: 'Do not try to settle too deeply where you do not belong. Small, careful steps bring good fortune.',
  },
  57: {
    hook: 'Wind penetrates gently. Soft influence reaches what force cannot.',
    body: 'Work through small, repeated efforts. Gentle persistence opens paths to the great person.',
  },
  58: {
    hook: 'Shared joy ripples outward. The lake reflects and doubles delight.',
    body: 'True joy is not shallow pleasure. Persevere in honest exchange and success follows.',
  },
  59: {
    hook: 'What was frozen begins to dissolve. Dispersion clears rigid separation.',
    body: 'Release what blocks unity and return to the sacred center. Then you may cross the great water.',
  },
  60: {
    hook: 'Boundaries give form. Measure protects what would spill over.',
    body: 'Accept wise limits, but do not endure what crushes the spirit. Right restraint brings success.',
  },
  61: {
    hook: 'Sincerity reaches even what seems unreachable. Inner truth needs no display.',
    body: 'When the heart is true, trust crosses every distance. Perseverance in sincerity brings good fortune.',
  },
  62: {
    hook: 'Do not overreach. The small prevails over the great in this moment.',
    body: 'Stay low, stay careful. The flying bird succeeds by not striving upward.',
  },
  63: {
    hook: 'The task is done, yet vigilance remains. Completion is not the end of care.',
    body: 'Guard what has been achieved before disorder enters. Success lives in small, steady attention.',
  },
  64: {
    hook: 'Almost there, but not yet. The final step demands full care.',
    body: 'Do not ruin the crossing at the last moment. Complete the passage with patience and precision.',
  },
};

function displayName(hex) {
  return NAME_OVERRIDES[hex.number] ?? hex.name;
}

function hashtagFromName(name) {
  const base = name.split('[')[0].split('(')[0].trim();
  return base
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function renderPost(hex) {
  const copy = COPY[hex.number];
  if (!copy) {
    throw new Error(`Missing copy for hex ${hex.number}`);
  }

  const name = displayName(hex);
  const tagName = hashtagFromName(name);

  const caption = [
    'Hexagram of the Day',
    '',
    `✨ Today we present Hexagram #${hex.number}, ${name}`,
    '',
    `☯️ ${hex.chineseName} ${capitalizePinyin(hex.pinyin)}`,
    '',
    copy.hook,
    '',
    copy.body,
    '',
    '📲 Download The Original I Ching App for the complete interpretation, changing lines, and personal reading.',
    '',
    '🔗 Link in bio',
    '',
    `#HexagramOfTheDay #IChing #BookOfChanges #Hexagram${hex.number} #${tagName} #Wisdom #AncientWisdom #TheOriginalIChing`,
  ].join('\n');

  return [
    `## Hexagram #${hex.number}`,
    '',
    `Image: hex-${String(hex.number).padStart(2, '0')}-${hex.chineseName}.png`,
    '',
    'Copy everything inside the block below (do not copy this line):',
    '',
    '```',
    caption,
    '```',
    '',
    '---',
    '',
  ].join('\n');
}

function capitalizePinyin(pinyin) {
  return pinyin
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function verify(bundle) {
  const hexagrams = bundle.hexagrams;
  if (hexagrams.length !== 64) {
    throw new Error(`Expected 64 hexagrams, got ${hexagrams.length}`);
  }

  for (let i = 0; i < hexagrams.length; i += 1) {
    const hex = hexagrams[i];
    if (hex.number !== i + 1) {
      throw new Error(`Order mismatch at index ${i}: number ${hex.number}`);
    }
    if (!COPY[hex.number]) {
      throw new Error(`Missing COPY for hex ${hex.number}`);
    }
  }

  console.log('Verification OK: 64 hexagrams, ordered 1–64, copy complete.');
}

function main() {
  const bundle = JSON.parse(fs.readFileSync(BAYNES_PATH, 'utf8'));
  verify(bundle);

  const header = [
    '# Hexagram of the Day: 64 Social Posts',
    '',
    'Source metadata: `packages/iching-data/src/generated/hexagrams.baynes.json` (Wilhelm/Baynes EN).',
    'Copy body: paraphrase of each hex judgment. Hex #14 name corrected to Possession in Great Measure.',
    '',
    '## Manual scheduling (Meta Business Suite)',
    '',
    '1. Open Meta Business Suite → Planner.',
    '2. Attach image from `tools/output/zhouyi-64hex-master/` (filename shown above each block).',
    '3. Copy the text inside the code block only (Hexagram of the Day through hashtags).',
    '4. Set date and time in Planner, not in the caption.',
    '',
    'Images: `hex-01-*.png` through `hex-64-*.png` in `tools/output/zhouyi-64hex-master/`.',
    '',
    '---',
    '',
  ].join('\n');

  const body = bundle.hexagrams.map(renderPost).join('\n');

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, header + body, 'utf8');

  console.log(`Wrote ${OUT_PATH}`);
}

main();
