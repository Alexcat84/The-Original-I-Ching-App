
const fs = require('fs');
const path = 'c:/Users/AlexDesk/Documents/iching-app/apps/web/src/app/page.tsx';
let content = fs.readFileSync(path, 'utf8');
const linesToRemove = [
  'modeIChingHint:',
  'modeIChingYarrowHint:',
  'modeBonesHint:'
];
const lines = content.split('\n');
const filteredLines = lines.filter(line => !linesToRemove.some(rem => line.includes(rem)));
fs.writeFileSync(path, filteredLines.join('\n'), 'utf8');
