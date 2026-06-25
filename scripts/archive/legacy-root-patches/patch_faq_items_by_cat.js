const fs = require('fs');

let code = fs.readFileSync('packages/i18n/src/messages/faq-page-ui.ts', 'utf8');

code = code.replace(/"tokens-payments": \[[^\]]+\],/g, '"tokens-payments": ["tokens-packs", "purchases-legal"],\n  "premium-features": ["translators-tiers", "master-tokens-cost", "library-unlock"],');

fs.writeFileSync('packages/i18n/src/messages/faq-page-ui.ts', code);
console.log("FAQ_ITEMS_BY_CATEGORY parcheado!");
