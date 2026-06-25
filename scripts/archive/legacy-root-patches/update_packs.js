const fs = require('fs');

let content = fs.readFileSync('packages/i18n/src/messages/token-pack-marketing-ui.ts', 'utf8');

const replacements = [
  // ES
  ["resolución estándar.\",", "resolución estándar. Acceso a los 3 traductores principales.\","],
  ["resolución estándar\",", "resolución estándar. Acceso a los 3 traductores principales.\","], // just in case
  ["alta resolución.\",", "alta resolución. Acceso a los 3 traductores principales.\","],
  ["máxima resolución.\",", "máxima resolución. Acceso adicional al motor Master (3), que combina los 3 traductores.\","],
  // EN
  ["standard resolution.\",", "standard resolution. Access to the 3 main translators.\","],
  ["high resolution.\",", "high resolution. Access to the 3 main translators.\","],
  ["maximum resolution.\",", "maximum resolution. Additional access to the Master (3) engine, which combines all 3 translators.\","],
  // PT
  ["resolução padrão.\",", "resolução padrão. Acesso aos 3 tradutores principais.\","],
  ["alta resolução.\",", "alta resolução. Acesso aos 3 tradutores principais.\","],
  ["resolução máxima.\",", "resolução máxima. Acesso adicional ao motor Master (3), que combina os 3 tradutores.\","],
  // FR
  ["résolution standard.\",", "résolution standard. Accès aux 3 traducteurs principaux.\","],
  ["haute résolution.\",", "haute résolution. Accès aux 3 traducteurs principaux.\","],
  ["résolution maximale.\",", "résolution maximale. Accès supplémentaire au moteur Master (3), qui combine les 3 traducteurs.\","],
  // DE
  ["Standardauflösung.\",", "Standardauflösung. Zugang zu den 3 Hauptübersetzern.\","],
  ["hoher Auflösung.\",", "hoher Auflösung. Zugang zu den 3 Hauptübersetzern.\","],
  ["maximaler Auflösung.\",", "maximaler Auflösung. Zusätzlicher Zugang zur Master (3) Engine, die alle 3 Übersetzer kombiniert.\","],
  // IT
  ["risoluzione standard.\",", "risoluzione standard. Accesso ai 3 traduttori principali.\","],
  ["alta risoluzione.\",", "alta risoluzione. Accesso ai 3 traduttori principali.\","],
  ["risoluzione massima.\",", "risoluzione massima. Accesso aggiuntivo al motore Master (3), che combina i 3 traduttori.\","],
  // JA
  ["標準解像度。\",", "標準解像度。 3つの主要な翻訳者へのアクセス。\",",],
  ["高解像度。\",", "高解像度。 3つの主要な翻訳者へのアクセス。\",",],
  ["最高解像度。\",", "最高解像度。 3つの翻訳を組み合わせるMaster (3)エンジンへの追加アクセス。\",",],
  // ZH
  ["标准分辨率。\",", "标准分辨率。 访问 3 个主要译本。\",",],
  ["高分辨率。\",", "高分辨率。 访问 3 个主要译本。\",",],
  ["最高分辨率。\",", "最高分辨率。 额外使用 Master (3) 引擎，该引擎结合了 3 个译本。\",",],
  // KO
  ["표준 해상도.\",", "표준 해상도. 3가지 주요 번역본 이용 가능.\","],
  ["고해상도.\",", "고해상도. 3가지 주요 번역본 이용 가능.\","],
  ["최고 해상도.\",", "최고 해상도. 3가지 번역본을 결합하는 Master (3) 엔진 추가 이용 가능.\","],
  // AR
  ["دقة قياسية.\",", "دقة قياسية. الوصول إلى المترجمين الثلاثة الرئيسيين.\","],
  ["دقة عالية.\",", "دقة عالية. الوصول إلى المترجمين الثلاثة الرئيسيين.\","],
  ["بأقصى دقة.\",", "بأقصى دقة. وصول إضافي لمحرك Master (3) الذي يجمع بين المترجمين الثلاثة.\","],
  // HI
  ["स्टैंडर्ड रिज़ॉल्यूशन में।\",", "स्टैंडर्ड रिज़ॉल्यूशन में। 3 मुख्य अनुवादकों तक पहुंच।\","],
  ["हाई रिज़ॉल्यूशन में।\",", "हाई रिज़ॉल्यूशन में। 3 मुख्य अनुवादकों तक पहुंच।\","],
  ["अधिकतम रिज़ॉल्यूशन में।\",", "अधिकतम रिज़ॉल्यूशन में। मास्टर (3) इंजन तक अतिरिक्त पहुंच, जो सभी 3 अनुवादकों को जोड़ता है।\","]
];

replacements.forEach(([oldStr, newStr]) => {
  content = content.replace(oldStr, newStr);
});

fs.writeFileSync('packages/i18n/src/messages/token-pack-marketing-ui.ts', content);
console.log('Update script finished');
