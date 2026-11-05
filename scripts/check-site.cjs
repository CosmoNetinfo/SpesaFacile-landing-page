const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync('index.html', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML IDs');
for (const match of html.matchAll(/(?:src|href)="([^"#]+|#[^"]+)"/g)) {
  const value = match[1];
  if (value.startsWith('#')) {
    if (!ids.includes(value.slice(1))) throw new Error(`Missing anchor: ${value}`);
  } else if (!/^[a-z]+:/i.test(value) && !fs.existsSync(path.resolve(value.split(/[?#]/)[0]))) {
    throw new Error(`Missing local resource: ${value}`);
  }
}
if (!fs.existsSync('assets/social-card.png')) throw new Error('Missing social sharing image');
if (!html.includes('lang="it"') || !html.includes('name="viewport"')) throw new Error('Missing locale or viewport');
for (const file of ['assets/app.js', 'assets/style.css', 'robots.txt', 'sitemap.xml', '.nojekyll']) {
  if (!fs.existsSync(file)) throw new Error(`Missing ${file}`);
}
console.log('Site checks passed: resources, anchors, metadata and public files.');
