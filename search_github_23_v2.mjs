
import fs from 'fs';
const content = fs.readFileSync('C:\\Users\\AlexDesk\\.gemini\\antigravity\\brain\\ecfee6cd-7fec-46c5-9786-b40e819fca40\\.system_generated\\steps\\1219\\content.md', 'utf8');
const startIdx = content.indexOf('"23":');
const endIdx = content.indexOf('"24":');
console.log(content.substring(startIdx, startIdx + 1000));
