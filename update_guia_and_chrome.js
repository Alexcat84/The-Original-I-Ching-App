const fs = require('fs');

// 1. Update home-chrome-ui.ts
let chromeContent = fs.readFileSync('packages/i18n/src/messages/home-chrome-ui.ts', 'utf8');

const chromeProps = "  translatorLabel: string;\n  translatorMasterCombined: string;";

if (!chromeContent.includes('translatorLabel: string;')) {
  chromeContent = chromeContent.replace(
    /export type HomeChromeUiMessages = \{([^}]*)\};/,
    "export type HomeChromeUiMessages = {$1" + chromeProps + "\n};"
  );
}

const chromeTranslations = {
  es: { translatorLabel: 'Traductor', translatorMasterCombined: 'Master (3)' },
  en: { translatorLabel: 'Translator', translatorMasterCombined: 'Master (3)' },
  pt: { translatorLabel: 'Tradutor', translatorMasterCombined: 'Master (3)' },
  fr: { translatorLabel: 'Traducteur', translatorMasterCombined: 'Master (3)' },
  de: { translatorLabel: 'Übersetzer', translatorMasterCombined: 'Master (3)' },
  it: { translatorLabel: 'Traduttore', translatorMasterCombined: 'Master (3)' },
  ja: { translatorLabel: '翻訳者', translatorMasterCombined: 'マスター (3)' },
  zh: { translatorLabel: '译本', translatorMasterCombined: '大师 (3)' },
  ko: { translatorLabel: '번역본', translatorMasterCombined: '마스터 (3)' },
  ar: { translatorLabel: 'المترجم', translatorMasterCombined: 'Master (3)' },
  hi: { translatorLabel: 'अनुवादक', translatorMasterCombined: 'मास्टर (3)' },
};

const locales = ['es', 'en', 'pt', 'fr', 'de', 'it', 'ja', 'zh', 'ko', 'ar', 'hi'];

locales.forEach((loc) => {
  const trans = chromeTranslations[loc];
  const replaceRegex = new RegExp("(" + loc + ": \\{[\\s\\S]*?)(    openLibrary: \".*\",)\\n(  \\},)");
  chromeContent = chromeContent.replace(replaceRegex, "$1$2\n    translatorLabel: \"" + trans.translatorLabel + "\",\n    translatorMasterCombined: \"" + trans.translatorMasterCombined + "\",\n$3");
});

fs.writeFileSync('packages/i18n/src/messages/home-chrome-ui.ts', chromeContent);

// 2. Update guia-page-ui.ts
let guiaContent = fs.readFileSync('packages/i18n/src/messages/guia-page-ui.ts', 'utf8');

const guiaProps = "  translatorOptionsBullet: string;";
if (!guiaContent.includes('translatorOptionsBullet: string;')) {
  guiaContent = guiaContent.replace(
    /export type GuiaPageUiMessages = \{([^}]*)\};/,
    "export type GuiaPageUiMessages = {$1" + guiaProps + "\n};"
  );
}

const guiaTranslations = {
  es: "Elección de traductor: Puedes elegir entre Wilhelm/Baynes, Zhou Yi, James Legge o el modo Master (3) que combina todos en una única respuesta.",
  en: "Translator choice: You can choose between Wilhelm/Baynes, Zhou Yi, James Legge, or the Master (3) mode which combines all into a single answer.",
  pt: "Escolha de tradutor: Podes escolher entre Wilhelm/Baynes, Zhou Yi, James Legge ou o modo Master (3) que combina todos numa única resposta.",
  fr: "Choix du traducteur : Vous pouvez choisir entre Wilhelm/Baynes, Zhou Yi, James Legge, ou le mode Master (3) qui combine le tout en une seule réponse.",
  de: "Wahl des Übersetzers: Sie können zwischen Wilhelm/Baynes, Zhou Yi, James Legge oder dem Master (3)-Modus wählen, der alle in einer einzigen Antwort kombiniert.",
  it: "Scelta del traduttore: Puoi scegliere tra Wilhelm/Baynes, Zhou Yi, James Legge o la modalità Master (3) che li combina in un'unica risposta.",
  ja: "翻訳者の選択: Wilhelm/Baynes、Zhou Yi、James Legge、またはすべてを組み合わせたマスター(3)モードから選択できます。",
  zh: "译本选择：您可以选择卫礼贤/贝恩斯、原始周易、理雅各，或将三者结合为单一回答的大师 (3) 模式。",
  ko: "번역본 선택: 빌헬름/베인스, 원전 주역, 제임스 레게 중 하나를 선택하거나 모든 버전을 하나의 답변으로 결합하는 마스터(3) 모드를 선택할 수 있습니다.",
  ar: "اختيار المترجم: يمكنك الاختيار بين Wilhelm/Baynes، أو Zhou Yi، أو James Legge، أو وضع Master (3) الذي يجمع الكل في إجابة واحدة.",
  hi: "अनुवादक का विकल्प: आप विल्हेम/बेन्स, झोउ यी, जेम्स लेग या मास्टर (3) मोड के बीच चयन कर सकते हैं जो सभी को एक उत्तर में जोड़ता है।"
};

locales.forEach((loc) => {
  const bullet = guiaTranslations[loc];
  const replaceRegex = new RegExp("(" + loc + ": \\{[\\s\\S]*?)(    threadDepthBullet: \".*\",)\\n");
  guiaContent = guiaContent.replace(replaceRegex, "$1$2\n    translatorOptionsBullet: \"" + bullet + "\",\n");
});

fs.writeFileSync('packages/i18n/src/messages/guia-page-ui.ts', guiaContent);
console.log('Script done');
