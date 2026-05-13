const fs = require('fs');

let code = fs.readFileSync('packages/i18n/src/messages/faq-page-ui.ts', 'utf8');

// Eliminar items obsoletos si existen
code = code.replace(/\{\s*id:\s*"master-tokens-cost",[\s\S]*?\},/g, '');
code = code.replace(/\{\s*id:\s*"library-unlock",[\s\S]*?\},/g, '');

const itemsToInject = `  {
    id: "translators-tiers",
    question: "¿Cómo funcionan los diferentes niveles de traducción?",
    answer: "La app ofrece diversos linajes de sabiduría para tu consulta. Mientras que el nivel inicial incluye la visión de Wilhelm, los packs superiores (Seeker y Practitioner) desbloquean a James Legge y el Zhou Yi original. El nivel Master ofrece acceso exclusivo a la función Master (3).",
  },
  {
    id: "master-tokens-cost",
    question: "¿Cómo funciona la síntesis Master (3) y por qué es tan potente?",
    answer: "La función Master (3) realiza una Síntesis Personalizada: triangula simultáneamente las tres fuentes raíz (Wilhelm, Legge y el Zhou Yi original) para destilar un veredicto coherente. El resultado es un análisis dialéctico que ofrece una 'Respuesta Concreta' potente e inmediata, seguida de un análisis comparativo profundo elaborado de forma única para tu situación y adaptado con total fidelidad al contexto personal de tu consulta.",
    related: ["tokenPacks", "pricing"],
  },
  {
    id: "library-unlock",
    question: "¿Qué es la Biblioteca y cómo se accede?",
    answer: "Es el compendio completo de los 64 hexagramas y las tres obras literarias íntegras. El acceso se desbloquea de forma permanente al adquirir cualquier pack de pago (Seeker en adelante).",
  },
`;

code = code.replace(/const FAQ_ITEMS_ES: FaqItem\[\] = \[/, 'const FAQ_ITEMS_ES: FaqItem[] = [\n' + itemsToInject);

fs.writeFileSync('packages/i18n/src/messages/faq-page-ui.ts', code);
console.log("FAQ items actualizados!");
