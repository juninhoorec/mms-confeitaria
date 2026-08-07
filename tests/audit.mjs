import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const siteUrl = 'https://juninhoorec.github.io/mms-confeitaria/';
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
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]+)"/i)?.[1];
  const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)?.[1];

  if (duplicateIds.length) failures.push(`${page}: IDs duplicados: ${[...new Set(duplicateIds)].join(', ')}`);
  if (/href="#"/.test(html)) failures.push(`${page}: ainda contém href="#"`);
  if (/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome/.test(html)) failures.push(`${page}: Font Awesome ainda é externo`);
  if (!title || title.length < 10 || title.length > 65) failures.push(`${page}: title ausente ou fora de 10–65 caracteres`);
  if (!description || description.length < 50 || description.length > 160) failures.push(`${page}: description ausente ou fora de 50–160 caracteres`);
  if (h1Count !== 1) failures.push(`${page}: deve conter exatamente um h1 (encontrados: ${h1Count})`);
  if (!canonical?.startsWith(siteUrl)) failures.push(`${page}: canonical absoluto ausente ou fora da URL oficial`);
  if (ogUrl !== canonical) failures.push(`${page}: og:url deve ser igual ao canonical`);
  if (!ogImage?.startsWith(siteUrl)) failures.push(`${page}: og:image deve usar URL absoluta`);
  if (!/<meta\s+name="twitter:card"\s+content="summary_large_image"/i.test(html)) failures.push(`${page}: Twitter Card ausente`);
  if (page !== 'index.html' && !/<base\s+href="\.\.\/">/i.test(html)) failures.push(`${page}: base href esperado para página interna`);

  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\salt="[^"]*"/i.test(match[1])) failures.push(`${page}: imagem sem atributo alt: ${match[0].slice(0, 100)}`);
  }

  for (const match of html.matchAll(/<a\b([^>]*)target="_blank"([^>]*)>/gi)) {
    const attributes = `${match[1]} ${match[2]}`;
    if (!/rel="[^"]*noopener[^"]*"/i.test(attributes)) failures.push(`${page}: link target=_blank sem noopener`);
  }

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

console.log(`Auditoria aprovada: ${pages.length} páginas, ${productIds.size} produtos, SEO, acessibilidade básica e referências locais válidas.`);
