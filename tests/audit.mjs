import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const siteUrl = 'https://juninhoorec.github.io/mms-confeitaria/';
const pages = [
  'index.html',
  'nossos-destaques/index.html',
  'bolos-especiais/index.html',
  'bolos-caseiros/index.html',
  'doces/index.html',
  'sobre-nos/index.html',
  'politica-de-privacidade/index.html',
  'termos-de-encomenda/index.html',
];
const failures = [];
const script = readFileSync(resolve(root, 'script.js'), 'utf8');
const productIds = new Set([...script.matchAll(/^    '([^']+)': \{/gm)].map((match) => match[1]));

for (const requiredProduct of ['bolo-chantininho', 'bolo-vulcao-chocomorango', 'bolo-prestigio-caseiro', 'bolo-laranja-chocolate-cremoso', 'pote-ninho-morango', 'naked-cake-prestigio']) {
  if (!productIds.has(requiredProduct)) failures.push(`produto obrigatÃ³rio ausente: ${requiredProduct}`);
}
if (productIds.has('doce-leite-nozes')) failures.push('Doce de Leite com Nozes ainda estÃ¡ cadastrado nos destaques');
if (productIds.has('bolo-baunilha') || productIds.has('bolo-chocolate-caseiro')) failures.push('Bolos caseiros substituÃ­dos ainda estÃ£o cadastrados');
if (productIds.has('brigadeiro-gourmet')) failures.push('Caixa de Brigadeiros Gourmet ainda esta cadastrada em Doces');
if (!/pricePerKg:\s*80/.test(script)) failures.push('Bolo Chantininho deve custar R$ 80,00 por kg');
if (!/'bolo-vulcao-chocomorango':\s*\{[\s\S]{0,200}price:\s*55/.test(script)) failures.push('Bolo VulcÃ£o Chocomorango deve custar R$ 55,00');
if (!/'pote-ninho-morango':\s*\{[\s\S]{0,200}price:\s*10/.test(script)) failures.push('Bolo de Pote Ninho com Morango deve custar R$ 10,00');
if (!/'naked-cake-prestigio':\s*\{[\s\S]{0,200}price:\s*75/.test(script)) failures.push('Naked Cake Prestigio deve custar R$ 75,00');
for (const option of ['baunilha', 'chocolate', 'coco-cremoso', 'ninho-morango', 'ninho-maracuja', 'chocolate-maracuja', 'doce-de-leite']) {
  if (!script.includes(option)) failures.push(`opÃ§Ã£o do Chantininho ausente: ${option}`);
}

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

for (const file of ['script.js', 'commerce-shell.js', 'premium.js', 'data-repositories.js', 'order-utils.js', 'admin/admin.js']) {
  try {
    new Function(readFileSync(resolve(root, file), 'utf8'));
  } catch (error) {
    failures.push(`${file}: JavaScript inválido: ${error.message}`);
  }
}

const premiumScript = readFileSync(resolve(root, 'premium.js'), 'utf8');
const adminHtml = readFileSync(resolve(root, 'admin/index.html'), 'utf8');
if (!/window\.MMS_PRODUCTS\s*=\s*PRODUCTS/.test(script)) failures.push('catálogo não está exposto como fonte única compartilhada');
if (!premiumScript.includes("normalize('NFD')")) failures.push('busca sem normalização de acentos');
if (!premiumScript.includes("item.quantity > 0")) failures.push('pronta entrega não remove quantidade zero');
if (!premiumScript.includes("item.date === today")) failures.push('pronta entrega não filtra a data atual');
if (!premiumScript.includes("mms-ready-availability-v1")) failures.push('chave de disponibilidade ausente');
if (!/<meta\s+name="robots"\s+content="noindex,nofollow"/i.test(adminHtml)) failures.push('admin precisa de noindex,nofollow');
const forbiddenAdminKey = ['service', 'role'].join('_');
if (new RegExp(forbiddenAdminKey, 'i').test([script, premiumScript, adminHtml].join('\n'))) failures.push('chave administrativa não pode existir no frontend');
for (const file of ['premium.css', 'premium.js', 'admin/index.html', 'admin/admin.css', 'admin/admin.js']) {
  if (!existsSync(resolve(root, file))) failures.push(`arquivo novo ausente: ${file}`);
}
const repositories = readFileSync(resolve(root, 'data-repositories.js'), 'utf8');
const orderUtils = readFileSync(resolve(root, 'order-utils.js'), 'utf8');
const migration = readFileSync(resolve(root, 'supabase/migrations/001_mms_phase2.sql'), 'utf8');
for (const required of ['LocalAvailabilityRepository', 'SupabaseAvailabilityRepository', 'LocalOrderRepository', 'SupabaseOrderRepository', 'availabilityForDate']) {
  if (!repositories.includes(required)) failures.push(`repositório/adaptador ausente: ${required}`);
}
for (const required of ['parseWhatsAppOrder', 'ordersToCSV']) {
  if (!orderUtils.includes(required)) failures.push(`utilitário operacional ausente: ${required}`);
}
if (!/\.normalize\(["']NFD["']\)/.test(orderUtils)) failures.push('utilitário operacional sem normalização Unicode');
if (!/enable row level security/i.test(migration)) failures.push('migration sem RLS');
if (!/revoke all on public\.orders from anon/i.test(migration)) failures.push('orders precisa negar acesso anon');
if (!/revoke insert, update, delete on public\.availability from anon/i.test(migration)) failures.push('anon não pode escrever availability');
if (!/available_date = \(now\(\) at time zone 'America\/Sao_Paulo'\)::date/i.test(migration)) failures.push('availability pública deve usar o dia atual de São Paulo');
if (!/grant usage, select on sequence public\.mms_order_number_seq to authenticated/i.test(migration)) failures.push('sequência de pedidos sem permissão authenticated');
if (!/admin deletes settings/i.test(migration)) failures.push('CRUD administrativo de settings incompleto');
if (!/quantity integer[^\n]+check \(quantity >= 0\)/i.test(migration)) failures.push('availability sem constraint de quantidade');
if (!existsSync(resolve(root, 'SUPABASE_SETUP.md')) || !existsSync(resolve(root, 'config.example.js'))) failures.push('documentação/configuração Supabase ausente');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Auditoria aprovada: ${pages.length} páginas, ${productIds.size} produtos, SEO, acessibilidade básica e referências locais válidas.`);
