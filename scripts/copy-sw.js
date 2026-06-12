const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'public', 'sw.js');
const dest = path.join(__dirname, '..', 'dist', 'sw.js');

if (fs.existsSync(src)) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('Copied sw.js to dist/');
} else {
  console.warn('public/sw.js not found — skipping');
}
