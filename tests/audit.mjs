import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pages = [
  'index.html',
  'nossos-destaques/index.html',
  'bolos-caseiros/index.html',
  'doces/index.html',
  'sobre-nos/index.html',
];
const failures = [];
const script = readFileSync(resolve(root, 'script.js'), 'utf8');
const productIds = new Set([...script.matchAll(/^    '([^']+)': \{/gm)].map((match) => match[1]));

for (const page of pages) {
  const file = resolve(root, page);
  const html = readFileSync(file, 'utf8');
  const base = page === 'index.html' ? root : resolve(dirname(file), '..');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

  if (duplicateIds.length) failures.push(`${page}: IDs duplicados: ${[...new Set(duplicateIds)].join(', ')}`);
  if (/href="#"/.test(html)) failures.push(`${page}: ainda contém href="#"`);
  if (/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/.test(html)) failures.push(`${page}: Font Awesome ainda é externo`);

  for (const match of html.matchAll(/data-product-id="([^"]+)"/g)) {
    if (!productIds.has(match[1])) failures.push(`${page}: produto sem cadastro: ${match[1]}`);
  }

  for (const match of html.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"/g)) {
    const reference = match[1];
    if (/^(?:https?:|mailto:|tel:)/.test(reference)) continue;
    if (!existsSync(resolve(base, reference))) failures.push(`${page}: arquivo ausente: ${reference}`);
  }
}

for (const file of ['script.js', 'commerce-shell.js']) {
  try {
    new Function(readFileSync(resolve(root, file), 'utf8'));
  } catch (error) {
    failures.push(`${file}: JavaScript inválido: ${error.message}`);
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Auditoria aprovada: ${pages.length} páginas, ${productIds.size} produtos e referências locais válidas.`);
