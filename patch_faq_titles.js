const fs = require('fs');

let code = fs.readFileSync('packages/i18n/src/messages/faq-page-ui.ts', 'utf8');

// Ensure all 6 categories exist in every language block
const langs = ["es", "en", "pt", "fr", "de", "it", "ja", "zh", "ko", "ar", "hi"];

langs.forEach(lang => {
  const langRegex = new RegExp(lang + ': \\{([\\s\\S]*?)\\},\n');
  code = code.replace(langRegex, (match, p1) => {
    let block = p1;
    // Si falta tokens-payments, lo añadimos
    if (!block.includes('"tokens-payments":')) {
      block = block.replace(/"privacy-account":/, '"tokens-payments": "Tokens, packs and payments",\n      "privacy-account":');
    }
    // Si falta premium-features, lo añadimos
    if (!block.includes('"premium-features":')) {
      block = block.replace(/"privacy-account":/, '"premium-features": "Premium Features",\n      "privacy-account":');
    }
    return lang + ': {' + block + '},\n';
  });
});

fs.writeFileSync('packages/i18n/src/messages/faq-page-ui.ts', code);
console.log("FAQ_CATEGORY_TITLES parcheado!");
