import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";
const root = resolve(import.meta.dirname, ".."),
  failures = [];
const context = {
  window: {
    MMS_PRODUCTS: { "bolo-chocolatudo": { name: "Bolo Chocolatudo" } },
  },
};
vm.createContext(context);
vm.runInContext(readFileSync(resolve(root, "order-utils.js"), "utf8"), context);
const parsed = context.window.MMSOrderUtils.parseWhatsAppOrder(
  "CLIENTE: Ana\nTELEFONE: 81999990000\nITEM: 2 x Bolo Chocolatudo\nPARA ENTREGAR: 18/09/2026 às 15:00\nFRETE: retirada no local\nPAGAMENTO: Pix\nTOTAL: R$ 56,00",
  context.window.MMS_PRODUCTS,
);
if (
  parsed.customerName !== "Ana" ||
  parsed.items[0]?.quantity !== 2 ||
  parsed.items[0]?.productId !== "bolo-chocolatudo" ||
  parsed.date !== "2026-09-18" ||
  parsed.time !== "15:00" ||
  parsed.deliveryType !== "Retirada" ||
  parsed.total !== 56
)
  failures.push("parser WhatsApp não reconheceu o cenário completo");
const csv = context.window.MMSOrderUtils.ordersToCSV([
  { orderNumber: "#1042", customerName: "Ana", total: 56 },
]);
if (!csv.includes("#1042") || !csv.includes("56"))
  failures.push("exportação CSV inválida");
const dateContext = { window: {}, Intl, Date, Object };
vm.createContext(dateContext);
vm.runInContext(
  readFileSync(resolve(root, "date-utils.js"), "utf8"),
  dateContext,
);
const { getSaoPauloDateISO, shiftISODate } = dateContext.window.MMSDate;
if (getSaoPauloDateISO(new Date("2026-09-19T02:30:00Z")) !== "2026-09-18")
  failures.push("23:30 em São Paulo avançou indevidamente para o dia UTC");
if (getSaoPauloDateISO(new Date("2026-09-19T03:30:00Z")) !== "2026-09-19")
  failures.push("data após meia-noite em São Paulo incorreta");
for (const [date, days, expected] of [
  ["2026-09-18", -1, "2026-09-17"],
  ["2026-03-01", -1, "2026-02-28"],
  ["2024-03-01", -1, "2024-02-29"],
])
  if (shiftISODate(date, days) !== expected)
    failures.push(`deslocamento civil incorreto: ${date}`);
const repository = readFileSync(resolve(root, "data-repositories.js"), "utf8");
if (!repository.includes("catch"))
  failures.push("fallback para falha remota ausente");
let requestedUrl = "";
const store = new Map();
const repoContext = {
  window: {
    MMS_CONFIG: {
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "public-test-key",
    },
    MMSDate: dateContext.window.MMSDate,
  },
  localStorage: {
    getItem: (key) => store.get(key) || null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  },
  fetch: async (url) => {
    requestedUrl = String(url);
    return { ok: true, status: 200, json: async () => [] };
  },
  Date,
  Intl,
  Object,
  Map,
  JSON,
  Number,
  String,
  Boolean,
  Math,
  Error,
  crypto: { randomUUID: () => "test-id" },
};
vm.createContext(repoContext);
vm.runInContext(repository, repoContext);
await repoContext.window.MMSData.availabilityForDate();
const expectedToday = getSaoPauloDateISO();
if (!requestedUrl.includes(`available_date=eq.${expectedToday}`))
  failures.push("repository remoto não recebeu a data civil de São Paulo");
const customerOrders = [
  {
    id: "1",
    orderNumber: "#1042",
    customerName: "Ana",
    customerPhone: "(81) 99999-0000",
    date: "2026-09-17",
    time: "10:00",
    deliveryType: "Entrega",
    paymentMethod: "Pix",
    total: 56,
    items: [],
  },
  {
    id: "2",
    orderNumber: "#1043",
    customerName: "Ana",
    customerPhone: "81999990000",
    date: "2026-09-18",
    time: "11:00",
    deliveryType: "Retirada",
    paymentMethod: "Dinheiro",
    total: 44,
    items: [],
  },
];
const customers = context.window.MMSOrderUtils.groupCustomers(customerOrders);
if (
  customers.length !== 1 ||
  customers[0].orders.length !== 2 ||
  customers[0].total !== 100
)
  failures.push("histórico não agrupou formatos equivalentes do telefone");
const report = context.window.MMSOrderUtils.buildReportBreakdown([
  ...customerOrders,
  { deliveryType: "Entrega", paymentMethod: "Cartão", total: 80 },
]);
if (
  report.delivery.Entrega.count !== 2 ||
  report.delivery.Retirada.count !== 1 ||
  report.payments.Pix.count !== 1 ||
  report.payments.Pix.value !== 56 ||
  report.payments.Dinheiro.count !== 1 ||
  report.payments.Dinheiro.value !== 44 ||
  report.payments["Cartão"].count !== 1 ||
  report.payments["Cartão"].value !== 80
)
  failures.push("agregação de entrega ou pagamento incorreta");
const keyA = context.window.MMSOrderUtils.productionGroupKey({
    productId: "bolo-chocolatudo",
    options: { size: "Médio", finish: "Cobertura" },
  }),
  keyB = context.window.MMSOrderUtils.productionGroupKey({
    productId: "bolo-chocolatudo",
    options: { finish: "Cobertura", size: "Médio" },
  });
if (keyA !== keyB)
  failures.push("chave do grupo de produção não é determinística");
const localStore = new Map();
const makeLocalContext = () => ({
  window: { MMS_CONFIG: {}, MMSDate: dateContext.window.MMSDate },
  localStorage: {
    getItem: (key) => localStore.get(key) || null,
    setItem: (key, value) => localStore.set(key, value),
    removeItem: (key) => localStore.delete(key),
  },
  Date,
  Intl,
  Object,
  Map,
  JSON,
  Number,
  String,
  Boolean,
  Math,
  Error,
  encodeURIComponent,
  crypto: { randomUUID: () => "test-id" },
});
let localContext = makeLocalContext();
vm.createContext(localContext);
vm.runInContext(repository, localContext);
await localContext.window.MMSData.settings.saveValue(
  "production-checklist:2026-09-18",
  { groups: { cake: { prepared: true } } },
);
await localContext.window.MMSData.settings.saveValue(
  "production-checklist:2026-09-19",
  { groups: { cake: { prepared: false } } },
);
localContext = makeLocalContext();
vm.createContext(localContext);
vm.runInContext(repository, localContext);
const savedToday = await localContext.window.MMSData.settings.getValue(
    "production-checklist:2026-09-18",
  ),
  savedTomorrow = await localContext.window.MMSData.settings.getValue(
    "production-checklist:2026-09-19",
  );
if (
  savedToday.groups?.cake?.prepared !== true ||
  savedTomorrow.groups?.cake?.prepared !== false
)
  failures.push("checklist não persistiu ou misturou datas");
const migration2 = readFileSync(
  resolve(root, "supabase/migrations/002_admin_allowlist_and_phase21.sql"),
  "utf8",
);
if (
  !/admin_users/i.test(migration2) ||
  !/auth\.uid\(\)/i.test(migration2) ||
  !/exists\s*\(/i.test(migration2)
)
  failures.push("migration 002 sem allowlist completa");
if (/to\s+authenticated\s+using\s*\(true\)/i.test(migration2))
  failures.push("migration 002 mantém policy administrativa irrestrita");
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(
  "Phase 2 aprovada: parser WhatsApp, CSV e fallback remoto verificados.",
);
