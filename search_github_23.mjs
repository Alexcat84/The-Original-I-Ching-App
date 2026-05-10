
import fs from 'fs';
const content = fs.readFileSync('C:\\Users\\AlexDesk\\.gemini\\antigravity\\brain\\ecfee6cd-7fec-46c5-9786-b40e819fca40\\.system_generated\\steps\\1219\\content.md', 'utf8');
const match = content.match(/"23":\s*\{[^}]+\}/);
if (match) {
  console.log('Hexagram 23 from GitHub Raw:');
  console.log(match[0]);
} else {
  // If it's a huge object, maybe search for the block
  const startIdx = content.indexOf('"23":');
  const endIdx = content.indexOf('"24":');
  if (startIdx !== -1 && endIdx !== -1) {
    console.log('Hexagram 23 Block from GitHub Raw:');
    console.log(content.substring(startIdx, endIdx));
  } else {
    console.log('Could not find Hexagram 23 in the file.');
  }
}
