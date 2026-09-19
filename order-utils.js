(() => {
  const normalize = (v) =>
    String(v || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  const number = (v) =>
    Number(
      String(v || "")
        .replace(/[^\d,.-]/g, "")
        .replace(".", "")
        .replace(",", "."),
    ) || 0;
  function parseWhatsAppOrder(text, products = window.MMS_PRODUCTS || {}) {
    const lines = String(text || "")
        .split(/\r?\n/)
        .map((x) => x.trim())
        .filter(Boolean),
      result = {
        source: "whatsapp",
        items: [],
        paymentStatus: "Pendente",
        status: "NOVO",
        warnings: [],
      };
    let current = null;
    for (const line of lines) {
      const clean = normalize(line),
        value = line.split(":").slice(1).join(":").trim();
      if (/^(cliente|nome):/.test(clean)) result.customerName = value;
      else if (/^(telefone|whatsapp):/.test(clean))
        result.customerPhone = value.replace(/\D/g, "");
      else if (/^(para entregar|data):/.test(clean)) {
        const m = line.match(/(\d{2})\/(\d{2})\/(\d{4})(?:.*?(\d{2}:\d{2}))?/);
        if (m) {
          result.date = `${m[3]}-${m[2]}-${m[1]}`;
          result.time = m[4] || "";
        }
      } else if (/^(endereco|endereço):/.test(clean)) result.address = value;
      else if (/^(pagamento|forma de pagamento):/.test(clean))
        result.paymentMethod = value;
      else if (/^(subtotal):/.test(clean)) result.subtotal = number(value);
      else if (/^(total):/.test(clean)) result.total = number(value);
      else if (/^(frete|taxa de entrega):/.test(clean)) {
        result.deliveryType = /retirada/i.test(value) ? "Retirada" : "Entrega";
        result.deliveryFee = /confirmar/i.test(value) ? null : number(value);
      } else if (/^(item|produto):/.test(clean) || /^\d+\s*[x×-]/i.test(line)) {
        const quantity = Number(line.match(/(\d+)\s*[x×-]/i)?.[1] || 1),
          name = value || line.replace(/^\d+\s*[x×-]\s*/i, "");
        const match = Object.entries(products).find(
          ([, p]) =>
            normalize(name).includes(normalize(p.name)) ||
            normalize(p.name).includes(normalize(name)),
        );
        current = {
          productId: match?.[0] || "",
          name: match?.[1].name || name,
          quantity,
          options: {},
          notes: "",
        };
        result.items.push(current);
        if (!match) result.warnings.push(`Produto não reconhecido: ${name}`);
      } else if (
        current &&
        /^(opcoes|opções|tamanho|acabamento|massa|recheio):/.test(clean)
      )
        current.options.raw = value;
      else if (current && /^(observacao|observação):/.test(clean))
        current.notes = value;
      else if (/^(observacao geral|observação geral|notas):/.test(clean))
        result.notes = value;
    }
    if (!result.customerName) result.warnings.push("Cliente não identificado");
    if (!result.date) result.warnings.push("Data não identificada");
    if (!result.items.length)
      result.warnings.push("Nenhum produto identificado");
    result.total = result.total || result.subtotal || 0;
    return result;
  }
  const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  function ordersToCSV(orders) {
    return [
      "Pedido,Cliente,Telefone,Data,Horário,Recebimento,Pagamento,Status pagamento,Status,Total",
      ...orders.map((o) =>
        [
          o.orderNumber,
          o.customerName,
          o.customerPhone,
          o.date,
          o.time,
          o.deliveryType,
          o.paymentMethod,
          o.paymentStatus,
          o.status,
          o.total,
        ]
          .map(csvCell)
          .join(","),
      ),
    ].join("\r\n");
  }
  const normalizePhone = (value) => String(value || "").replace(/\D/g, "");

  function productionGroupKey(item) {
    const product = normalize(item.productId || item.name).replace(/\s+/g, "-");
    const options = Object.entries(item.options || {})
      .filter(([, value]) => value != null && value !== "")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${normalize(key)}=${normalize(value)}`)
      .join("|");
    return options ? `${product}|${options}` : product;
  }

  function groupCustomers(orders) {
    const customers = new Map();
    orders.forEach((order) => {
      const phoneKey = normalizePhone(order.customerPhone);
      const key = phoneKey || `name:${normalize(order.customerName)}`;
      if (!customers.has(key)) {
        customers.set(key, {
          key,
          name: order.customerName,
          phone: order.customerPhone,
          normalizedPhone: phoneKey,
          orders: [],
          count: 0,
          total: 0,
          last: "",
        });
      }
      const customer = customers.get(key);
      customer.orders.push(order);
      customer.count += 1;
      customer.total += Number(order.total) || 0;
      if (!customer.last || customer.last < order.date)
        customer.last = order.date;
    });
    return [...customers.values()].map((customer) => ({
      ...customer,
      orders: customer.orders.sort((a, b) =>
        `${b.date || ""}T${b.time || ""}`.localeCompare(
          `${a.date || ""}T${a.time || ""}`,
        ),
      ),
    }));
  }

  function buildReportBreakdown(orders) {
    const delivery = { Entrega: 0, Retirada: 0 };
    const payments = {};
    orders.forEach((order) => {
      const deliveryKey =
        normalize(order.deliveryType) === "entrega"
          ? "Entrega"
          : normalize(order.deliveryType) === "retirada"
            ? "Retirada"
            : null;
      if (deliveryKey) delivery[deliveryKey] += 1;
      const normalizedMethod = normalize(order.paymentMethod);
      const method =
        normalizedMethod === "pix"
          ? "Pix"
          : normalizedMethod === "cartao"
            ? "Cartão"
            : normalizedMethod === "dinheiro"
              ? "Dinheiro"
              : "Outros";
      payments[method] ||= { count: 0, value: 0 };
      payments[method].count += 1;
      payments[method].value += Number(order.total) || 0;
    });
    const deliveryTotal = delivery.Entrega + delivery.Retirada;
    return {
      delivery: {
        Entrega: {
          count: delivery.Entrega,
          percent: deliveryTotal ? (delivery.Entrega / deliveryTotal) * 100 : 0,
        },
        Retirada: {
          count: delivery.Retirada,
          percent: deliveryTotal
            ? (delivery.Retirada / deliveryTotal) * 100
            : 0,
        },
      },
      payments,
    };
  }

  window.MMSOrderUtils = {
    normalize,
    normalizePhone,
    productionGroupKey,
    groupCustomers,
    buildReportBreakdown,
    parseWhatsAppOrder,
    ordersToCSV,
  };
})();
