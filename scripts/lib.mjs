// Shared helpers for reading, resolving and writing MDS token files.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const TOKENS = join(ROOT, 'tokens');

export const readJSON = (file) => JSON.parse(readFileSync(file, 'utf8'));
export const writeJSON = (file, obj) => writeFileSync(file, JSON.stringify(obj, null, 2) + '\n');
export const readSet = (name) => readJSON(join(TOKENS, `${name}.json`));

/** Walk a token tree and return [{ path: ['Color','gray','100'], token }] for every node with a $value. */
export function flatten(tree, path = [], out = []) {
  for (const [key, node] of Object.entries(tree)) {
    if (key.startsWith('$')) continue;
    if (node && typeof node === 'object' && '$value' in node) out.push({ path: [...path, key], token: node });
    else if (node && typeof node === 'object') flatten(node, [...path, key], out);
  }
  return out;
}

/** Figma path ("Color/Content/onDark") → CSS custom property ("--color-content-on-dark"). Same rule the docs site uses. */
export const cssName = (path) => '--' + path.join('/').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase().replace(/[\/\s.]+/g, '-');

/** Build a lookup for one theme: the token sets it enables, merged in order. */
export function loadTheme(themeId) {
  const themes = readJSON(join(TOKENS, '$themes.json'));
  const theme = themes.find((t) => t.id === themeId);
  if (!theme) throw new Error(`Unknown theme "${themeId}"`);
  const map = new Map();
  for (const [set, state] of Object.entries(theme.selectedTokenSets)) {
    if (state === 'disabled') continue;
    for (const { path, token } of flatten(readSet(set))) map.set(path.join('.'), { path, token, set, source: state === 'source' });
  }
  return map;
}

const REF = /\{([^}]+)\}/g;

/** Resolve every {Ref.path} in a value. Returns { value, errors }. */
export function resolve(value, map, seen = new Set()) {
  const errors = [];
  const one = (v) => {
    if (typeof v === 'string') {
      return v.replace(REF, (m, ref) => {
        if (seen.has(ref)) { errors.push(`circular reference ${ref}`); return m; }
        const hit = map.get(ref);
        if (!hit) { errors.push(`unknown reference {${ref}}`); return m; }
        const r = resolve(hit.token.$value, map, new Set([...seen, ref]));
        errors.push(...r.errors);
        return typeof r.value === 'object' ? JSON.stringify(r.value) : String(r.value);
      });
    }
    if (Array.isArray(v)) return v.map(one);
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, one(x)]));
    return v;
  };
  return { value: one(value), errors };
}

/** A single-reference value ("{Color.gray.100}") → the referenced path, else null. */
export const singleRef = (v) => (typeof v === 'string' && /^\{[^}]+\}$/.test(v) ? v.slice(1, -1) : null);

/** Turn a resolved token into a CSS value. */
export function cssValue(type, v) {
  if (type === 'typography') return `${v.fontWeight} ${v.fontSize}/${v.lineHeight} "${v.fontFamily}", system-ui, sans-serif`;
  if (type === 'shadow') return (Array.isArray(v) ? v : [v]).map((s) => `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`).join(', ');
  return String(v);
}

function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a, b) {
  const A = lum(a), B = lum(b);
  return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05);
}
