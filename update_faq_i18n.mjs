
import fs from 'fs';

const filePath = 'C:/Users/AlexDesk/Documents/iching-app/packages/i18n/src/messages/faq-page-ui.ts';
let content = fs.readFileSync(filePath, 'utf8');

const translations = {
  pt: {
    q: "Quão confiáveis são os textos do I Ching no aplicativo?",
    a: "Os textos são altamente confiáveis. Realizamos uma auditoria de integridade de dados 1:1, verificando cada hexagrama com fontes acadêmicas como a Universidade de Parma (versão Wilhelm), Sacred-Texts.com (Legge) e o Chinese Text Project (Zhou Yi). Quaisquer erros de transcrição encontrados nos conjuntos de dados originais foram corrigidos manualmente para garantir precisão matemática e literária."
  },
  fr: {
    q: "À quel point les textes du Yi King sont-ils fiables dans l'application ?",
    a: "Les textes sont extrêmement fiables. Nous avons effectué un audit d'intégrité des données 1:1, en vérifiant chaque hexagramme par rapport à des sources académiques telles que l'Université de Parme (traduction Wilhelm), Sacred-Texts.com (Legge) et le Chinese Text Project (Zhou Yi). Toutes les erreurs de transcription détectées dans les ensembles de données sources originaux ont été corrigées manuellement pour garantir une exactitude mathématique et littéraire."
  },
  de: {
    q: "Wie zuverlässig sind die I-Ging-Texte in der App?",
    a: "Die Texte sind äußerst zuverlässig. Wir haben ein 1:1-Datenintegritätsaudit durchgeführt und jedes Hexagramm mit akademischen Quellen wie der Universität Parma (Wilhelm-Übersetzung), Sacred-Texts.com (Legge) und dem Chinese Text Project (Zhou Yi) abgeglichen. Etwaige Transkriptionsfehler in den ursprünglichen Quelldatensätzen wurden manuell korrigiert, um mathematische und literarische Genauigkeit zu gewährleisten."
  },
  it: {
    q: "Quanto sono affidabili i testi dell'I Ching nell'app?",
    a: "I testi sono estremamente affidabili. Abbiamo condotto un audit di integrità dei dati 1:1, verificando ogni esagramma rispetto a fonti accademiche come l'Università di Parma (traduzione Wilhelm), Sacred-Texts.com (Legge) e il Chinese Text Project (Zhou Yi). Eventuali errori di trascrizione trovati nei dataset originali sono stati corretti manualmente per garantire la precisione matematica e letteraria."
  },
  ja: {
    q: "アプリで提供される易経のテキストの信頼性はどの程度ですか？",
    a: "テキストの信頼性は極めて高いです。パルマ大学（ヴィルヘルム訳）、Sacred-Texts.com（レッグ訳）、Chinese Text Project（周易）などの学術的ソースと1対1のデータ整合性監査を実施しました。元のソースデータセットに見つかった転記ミスはすべて手動で修正され、数学的および文学的な正確さが保証されています。"
  },
  zh: {
    q: "应用中提供的易经文本可靠性如何？",
    a: "这些文本非常可靠。我们进行了 1:1 的数据完整性审核，根据帕尔马大学（卫礼贤译本）、Sacred-Texts.com（理雅各译本）和中国哲学书电子化计划（周易）等学术资源验证了每个卦象。原始源数据集中发现의 任何转录错误均已手动更正，以确保数学和文学的准确性。"
  },
  ko: {
    q: "앱에서 제공되는 주역 텍스트는 얼마나 신뢰할 수 있습니까?",
    a: "텍스트는 매우 신뢰할 수 있습니다. 파르마 대학교(빌헬름 번역), Sacred-Texts.com(레그 번역), Chinese Text Project(주역)와 같은 학술적 자료를 바탕으로 1:1 데이터 무결성 감사를 실시했습니다. 원본 소스 데이터셋에서 발견된 모든 오타는 수학적 및 문학적 정확성을 보장하기 위해 수동으로 수정되었습니다."
  },
  ar: {
    q: "ما مدى موثوقية نصوص الآي تشينغ في التطبيق؟",
    a: "النصوص موثوقة للغاية. لقد أجرينا تدقيقاً لسلامة البيانات بنسبة 1:1، مع التحقق من كل سداسي مقابل المصادر الأكاديمية مثل جامعة بارما (ترجمة فيلهلم)، وSacred-Texts.com (ليج)، ومشروع النصوص الصينية (تشو يي). تم تصحيح أي أخطاء في النسخ وجدت في مجموعات البيانات الأصلية يدوياً لضمان الدقة الرياضية والأدبية。"
  },
  hi: {
    q: "ऐप में दिए गए आई चिंग ग्रंथों की विश्वसनीयता क्या है?",
    a: "ग्रंथ अत्यंत विश्वसनीय हैं। हमने परमा विश्वविद्यालय (विल्हेम अनुवाद), Sacred-Texts.com (लेग), और चीनी पाठ परियोजना (झोउ यी) जैसे शैक्षणिक स्रोतों के साथ प्रत्येक हेक्साग्राम का मिलान करते हुए 1:1 डेटा अखंडता ऑडिट किया है। मूल स्रोत डेटासेट में मिली किसी भी प्रतिलेखन त्रुटि को गणितीय और साहित्यिक सटीकता सुनिश्चित करने के लिए मैन्युअल रूप से ठीक किया गया है।"
  }
};

for (const [lang, data] of Object.entries(translations)) {
    const key = `FAQ_ITEMS_${lang.toUpperCase()}`;
    const insertAfterId = 'tokens-packs';
    const regex = new RegExp(`const ${key}: FaqItem\\[\\] = \\[\\s+\\{[^}]+id: "${insertAfterId}"[^}]+related: \\[[^\\]]+\\],\\s+\\},`, 's');
    
    const match = content.match(regex);
    if (match) {
        const newItem = `
  {
    id: "data-reliability",
    question: "${data.q}",
    answer: "${data.a}",
  },`;
        content = content.replace(match[0], match[0] + newItem);
        console.log(`Updated ${lang}`);
    } else {
        console.log(`Could not find ${key} block`);
    }
}

fs.writeFileSync(filePath, content, 'utf8');
