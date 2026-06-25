const fs = require('fs');
let guiaContent = fs.readFileSync('packages/i18n/src/messages/guia-page-ui.ts', 'utf8');

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
  hi: "अनुवादक का विकल्प: आप विल्हेम/बेन्स, झोउ यी, जेम्स लेग या मास्टर (3) मोड के बीच चयन कर सकते हैं जो सभी को एक उत्तर में जोड़ता है."
};

const locales = ['es', 'en', 'pt', 'fr', 'de', 'it', 'ja', 'zh', 'ko', 'ar', 'hi'];

locales.forEach((loc) => {
  const bullet = guiaTranslations[loc];
  // Find "methodsHeading:"
  // and replace it with translatorOptionsBullet + methodsHeading
  const regex = new RegExp("(" + loc + ": \\{[\\s\\S]*?)(    methodsHeading: )");
  guiaContent = guiaContent.replace(regex, "$1    translatorOptionsBullet: \"" + bullet + "\",\n$2");
});

fs.writeFileSync('packages/i18n/src/messages/guia-page-ui.ts', guiaContent);
console.log('Done adding translatorOptionsBullet');
