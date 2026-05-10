
import fs from 'fs';

const filePath = 'C:/Users/AlexDesk/Documents/iching-app/packages/i18n/src/messages/faq-page-ui.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the broken English block
const brokenBlock = /const FAQ_ITEMS_EN: FaqItem\[\] = \[\s+\{\s+related: \["tokenPacks", "pricing", "termsOfService"\],\s+\},/;
const fixedBlock = `const FAQ_ITEMS_EN: FaqItem[] = [
  {
    id: "tokens-packs",
    question: "How do tokens, packs, and the free tier work?",
    answer:
      "Consultations consume tokens according to your active pack. The guide explains free trial allowances, pack sizes, and how balances work with your account. Purchases and renewals are governed by the Terms.",
    related: ["tokenPacks", "pricing", "termsOfService"],
  },`;

if (content.match(brokenBlock)) {
    content = content.replace(brokenBlock, fixedBlock);
    console.log("Fixed English block");
} else {
    console.log("Could not find broken English block");
}

fs.writeFileSync(filePath, content, 'utf8');
