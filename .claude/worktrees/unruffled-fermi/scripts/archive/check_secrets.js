import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const IGNORE = new Set(['node_modules', 'dist', 'build', '.git']);

const PATTERNS = [
  /AKIA[0-9A-Z]{16}/g,
  /ASIA[0-9A-Z]{16}/g,
  /AIza[0-9A-Za-z-_]{35}/g,
  /xox[baprs]-[0-9a-zA-Z-]{10,}/g,
  /sk_live_[0-9a-zA-Z]{16,}/g,
  /sk_test_[0-9a-zA-Z]{16,}/g,
  /-----BEGIN PRIVATE KEY-----/g
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function scanFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const hits = [];
  for (const pattern of PATTERNS) {
    const match = content.match(pattern);
    if (match) hits.push({ pattern: pattern.toString(), match: match[0] });
  }
  return hits;
}

let found = 0;
for (const file of walk(ROOT)) {
  // skip lock files noise + self
  if (file.endsWith('package-lock.json') || file.endsWith('pnpm-lock.yaml') || file.endsWith('yarn.lock')) continue;
  if (file.endsWith(path.join('scripts', 'check_secrets.js'))) continue;
  const hits = scanFile(file);
  if (hits.length) {
    found += hits.length;
    console.log(`Potential secrets in ${path.relative(ROOT, file)}:`);
    hits.forEach((h) => console.log(`  - ${h.pattern}`));
  }
}

if (found > 0) {
  console.error(`\n❌ ${found} potential secret(s) detected.`);
  process.exit(1);
} else {
  console.log('✅ No secrets detected.');
}
