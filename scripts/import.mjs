// Apply an export from the docs site ("Copy tokens" in the Overview) to the token files.
//   npm run import -- exports/my-change.json
// Updates primitive colour values, semantic Light/Dark aliases and component sizing aliases.
// Descriptions and notes in the token files are kept. Prints every change it makes.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TOKENS, readSet, writeJSON } from './lib.mjs';

const file = process.argv[2];
if (!file) { console.error('Usage: npm run import -- <exported.json>'); process.exit(1); }
const exp = JSON.parse(readFileSync(file, 'utf8'));
const toRef = (v) => (typeof v === 'string' ? v.replace(/\{([^}]+)\}/g, (m, p) => `{${p.replace(/\//g, '.')}}`) : v);
const changes = [];

function setValue(setName, tree, path, value, type) {
  let node = tree;
  for (const k of path.slice(0, -1)) node = node[k] ??= {};
  const leaf = path[path.length - 1];
  if (!node[leaf]) { node[leaf] = { $type: type, $value: value }; changes.push(`${setName}: + ${path.join('/')} = ${value}`); return; }
  if (node[leaf].$value !== value) { changes.push(`${setName}: ${path.join('/')}  ${node[leaf].$value} → ${value}`); node[leaf].$value = value; }
}

const sets = Object.fromEntries(['primitives', 'layout', 'semantic-light', 'semantic-dark'].map((n) => [n, readSet(n)]));

for (const [name, hex] of Object.entries(exp.primitives || {})) setValue('primitives', sets.primitives, name.split('/'), hex, 'color');
for (const [mode, set] of [['Light', 'semantic-light'], ['Dark', 'semantic-dark']]) {
  for (const [name, ref] of Object.entries(exp.Semantic?.[mode] || {})) setValue(set, sets[set], name.split('/'), toRef(ref), 'color');
}
for (const [name, val] of Object.entries(exp.other || {})) {
  if (name.startsWith('sizing/') && typeof val === 'string' && val.startsWith('{')) setValue('layout', sets.layout, name.split('/'), toRef(val), 'dimension');
}

if (!changes.length) { console.log('No changes: the export matches the token files.'); process.exit(0); }
for (const [n, tree] of Object.entries(sets)) writeJSON(join(TOKENS, `${n}.json`), tree);
console.log(changes.join('\n'));
console.log(`\n${changes.length} change(s) written to tokens/. Run "npm run build", then commit.`);
