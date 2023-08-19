const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, '..', 'dist', 'src', 'index.js');


const content = fs.readFileSync(outputPath, 'utf8');
const shebang = '#!/usr/bin/env node\n';

if (!content.startsWith(shebang)) {
  fs.writeFileSync(outputPath, shebang + content);
}
