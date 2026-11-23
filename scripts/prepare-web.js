const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const excluded = new Set(['.git', 'node_modules', 'dist', 'src-tauri', 'android', 'ios', '.github', 'scripts']);

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  const from = path.join(root, entry.name);
  const to = path.join(dist, entry.name);
  if (entry.isDirectory()) fs.cpSync(from, to, { recursive: true });
  else if (entry.isFile()) fs.copyFileSync(from, to);
}
console.log('Prepared DJ Olatuns web assets in dist/');
