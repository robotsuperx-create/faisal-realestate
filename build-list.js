const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'content/properties');

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const files = fs.readdirSync(dir)
  .filter(f => f.endsWith('.json') && f !== 'list.json')
  .map(f => f.replace('.json', ''));

fs.writeFileSync(
  path.join(dir, 'list.json'),
  JSON.stringify(files, null, 2)
);

console.log('✅ list.json updated with:', files);
