(async () => {
  const D = window.MMSData,
    U = window.MMSOrderUtils,
    P = window.MMS_PRODUCTS || {},
    dates = window.MMSDate,
    today = dates.getSaoPauloDateISO(),
    money = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  let orders = [],
    availability = [],
    imported = null,
    selectedCustomer = null,
    productionChecklist = { groups: {} },
    productionChecklistDate = "";
  const $ = (s) => document.querySelector(s),
    esc = (v) =>
      String(v ?? "").replace(
        /[<>&"]/g,
        (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c],
      ),
    download = (name, text, type = "text/plain") => {
      const a = document.createElement("a"),
        url = URL.createObjectURL(new Blob([text], { type }));
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    };
  const showApp = () => {
    $("#admin-app").hidden = false;
    $("#login-screen").hidden = true;
    $("#mode-note").innerHTML = D.remote
      ? '<i class="fa-solid fa-cloud"></i><p><strong>Modo online.</strong> Dados sincronizados com segurança pelo Supabase.</p>'
      : '<i class="fa-solid fa-circle-info"></i><p><strong>Modo local.</strong> Alterações salvas somente neste dispositivo.</p>';
    $("#logout").hidden = !D.remote;
  };
  const showLogin = () => {
    $("#admin-app").hidden = true;
    $("#login-screen").hidden = false;
    $("#login-form").onsubmit = async (e) => {
      e.preventDefault();
      const f = new FormData(e.currentTarget);
      try {
        await D.auth.signIn(f.get("email"), f.get("password"));
        showApp();
        await refresh();
      } catch (err) {
        $(".form-feedback").textContent = err.message;
      }
    };
  };
  if (D.remote && !(await D.auth.ensureSession())) {
    showLogin();
  } else {
    showApp();
  }
  $("#logout").onclick = () => {
    D.auth.signOut();
    location.reload();
  };
  const go = (name) => {
    document
      .querySelectorAll("[data-tab]")
      .forEach((b) => b.classList.toggle("is-active", b.dataset.tab === name));
    document
      .querySelectorAll("[data-panel]")
      .forEach((p) => (p.hidden = p.dataset.panel !== name));
  };
  document
    .querySelectorAll("[data-tab]")
    .forEach((b) => (b.onclick = () => go(b.dataset.tab)));
  document
    .querySelectorAll("[data-go]")
    .forEach((b) => (b.onclick = () => go(b.dataset.go)));
  const card = (label, value, icon = "fa-chart-simple") =>
      `<article class="metric-card"><div class="metric-icon-wrap"><i class="fa-solid ${icon}"></i></div><div class="metric-info"><span>${label}</span><strong>${value}</strong></div></article>`,
    empty = (t) => `<p class="empty-state">${t}</p>`;
  async function loadAvailability(date = $("#ready-date").value) {
    availability = await D.availability.listAllForDate(date);
    return availability;
  }
  function updateProductCard(row, qty) {
    const isAvail = qty > 0;
    row.classList.toggle("is-available", isAvail);
    row.classList.toggle("is-empty", !isAvail);
    const pill = row.querySelector(".stock-pill");
    if (pill) {
      pill.className = `stock-pill ${isAvail ? "pill-active" : "pill-empty"}`;
      pill.innerHTML = `<i class="fa-solid ${isAvail ? "fa-check" : "fa-circle-xmark"}"></i> ${isAvail ? `${qty} disponível` : "Sem estoque"}`;
    }
    $("#save-status").innerHTML = `<span class="status-unsaved"><i class="fa-solid fa-circle-exclamation"></i> Alterações pendentes</span>`;
  }
  async function renderAvailability() {
    await loadAvailability();
    const categories = { highlights: "Destaques", house: "Bolos Caseiros", sweets: "Doces" };
    const prods = window.MMS_PRODUCTS || P;
    $("#admin-products").innerHTML = Object.entries(prods)
      .filter(([, p]) => !p.deleted)
      .map(([id, p]) => {
        const x = availability.find((a) => a.productId === id),
          q = Number(x?.quantity) || 0;
        const isAvail = q > 0;
        return `<article class="admin-product ${isAvail ? "is-available" : "is-empty"}" data-product="${id}"><div class="product-media"><img src="${p.image}" alt="${esc(p.name)}" loading="lazy"><span class="stock-pill ${isAvail ? "pill-active" : "pill-empty"}"><i class="fa-solid ${isAvail ? "fa-check" : "fa-circle-xmark"}"></i> ${isAvail ? `${q} disponível` : "Sem estoque"}</span></div><div class="product-details"><span class="product-tag">${categories[p.category] || "Confeitaria"}</span><strong class="product-title">${esc(p.name)}</strong><span class="product-price">${money.format(p.price)}</span></div><div class="qty-control"><div class="qty-stepper"><button type="button" class="btn-qty btn-minus" data-minus title="Diminuir 1" aria-label="Diminuir unidade"><i class="fa-solid fa-minus"></i></button><input type="number" min="0" max="99" value="${q}" class="qty-number" aria-label="Quantidade de ${esc(p.name)}"><button type="button" class="btn-qty btn-plus" data-plus title="Aumentar 1" aria-label="Aumentar unidade"><i class="fa-solid fa-plus"></i></button></div></div></article>`;
      })
      .join("");
  }
  $("#admin-products").onclick = async (e) => {
    const row = e.target.closest("[data-product]");
    if (!row) return;
    const input = row.querySelector("input[type=number]");
    if (!input) return;

    if (e.target.closest("[data-minus]")) {
      const val = Math.max(0, (parseInt(input.value, 10) || 0) - 1);
      input.value = val;
      updateProductCard(row, val);
    } else if (e.target.closest("[data-plus]")) {
      const val = Math.min(99, (parseInt(input.value, 10) || 0) + 1);
      input.value = val;
      updateProductCard(row, val);
    }
  };
  $("#admin-products").oninput = (e) => {
    if (e.target.matches("input[type=number]")) {
      const row = e.target.closest("[data-product]");
      if (row) {
        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
        e.target.value = isNaN(val) ? 0 : val;
        updateProductCard(row, val);
      }
    }
  };
  $("#save-ready").onclick = async () => {
    const btn = $("#save-ready");
    const origHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
    try {
      const items = [...document.querySelectorAll("[data-product]")]
        .map((row) => ({
          id: availability.find((x) => x.productId === row.dataset.product)?.id,
          productId: row.dataset.product,
          quantity: Number(row.querySelector("input[type=number]").value) || 0,
          date: $("#ready-date").value,
          active: (Number(row.querySelector("input[type=number]").value) || 0) > 0,
          options: {},
        }))
        .filter((x) => x.quantity > 0);
      await D.availability.replaceForDate($("#ready-date").value, items);
      D.clearCache();
      const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
      $("#save-status").innerHTML = `<span class="status-saved"><i class="fa-solid fa-check"></i> Salvo com sucesso às ${timeStr}</span>`;
      await refresh();
    } catch (err) {
      $("#save-status").innerHTML = `<span class="status-error"><i class="fa-solid fa-triangle-exclamation"></i> Erro ao salvar: ${err.message}</span>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = origHTML;
    }
  };
  $("#clear-day").onclick = async () => {
    await D.availability.replaceForDate($("#ready-date").value, []);
    D.clearCache();
    await renderAvailability();
  };
  $("#copy-yesterday").onclick = async () => {
    const old = await D.availability.listAllForDate(
      dates.shiftISODate($("#ready-date").value, -1),
    );
    await D.availability.replaceForDate(
      $("#ready-date").value,
      old.map((x) => ({ ...x, id: null, date: $("#ready-date").value })),
    );
    D.clearCache();
    await renderAvailability();
  };
  $("#ready-date").value = today;
  $("#ready-date").onchange = renderAvailability;

  /* ==========================================================================
     GERENCIAMENTO DE PRODUTOS / CARDÁPIO
     ========================================================================== */
  let activeCatFilter = "all";
  let customCatalog = {};

  async function loadCustomCatalog() {
    if (D.catalog) {
      customCatalog = await D.catalog.getProducts();
      for (const [id, item] of Object.entries(customCatalog)) {
        if (!item) continue;
        if (item.deleted) {
          delete window.MMS_PRODUCTS[id];
        } else {
          window.MMS_PRODUCTS[id] = { ...(window.MMS_PRODUCTS[id] || {}), ...item };
        }
      }
    }
  }

  const categoryLabels = {
    highlights: "Nossos Destaques",
    house: "Bolos Caseiros",
    sweets: "Doces",
    specials: "Bolos Especiais",
  };

  function renderCatalogAdmin() {
    const list = $("#catalog-products-list");
    if (!list) return;

    const allProds = Object.entries(window.MMS_PRODUCTS || {})
      .filter(([, p]) => !p.deleted && (activeCatFilter === "all" || p.category === activeCatFilter))
      .sort(([, a], [, b]) => (a.category || "").localeCompare(b.category || "") || a.name.localeCompare(b.name, "pt-BR"));

    if (!allProds.length) {
      list.innerHTML = empty("Nenhum produto cadastrado nesta categoria.");
      return;
    }

    list.innerHTML = allProds
      .map(([id, p]) => `
        <article class="catalog-item-card" data-product-id="${id}">
          <div class="catalog-item-header">
            <img class="catalog-item-img" src="${p.image || "assets/logo-clean.png"}" alt="${esc(p.name)}" onerror="this.src='assets/logo-clean.png'">
            <div class="catalog-item-details">
              <span class="catalog-item-cat">${categoryLabels[p.category] || p.category || "Geral"}</span>
              <strong class="catalog-item-name" title="${esc(p.name)}">${esc(p.name)}</strong>
              <span class="catalog-item-price">${money.format(p.price || 0)}</span>
            </div>
          </div>
          <div class="catalog-item-actions">
            <button type="button" class="btn-edit-prod" data-edit-product="${id}">
              <i class="fa-solid fa-pen-to-square"></i> Editar
            </button>
            <button type="button" class="btn-delete-prod" data-delete-product="${id}">
              <i class="fa-solid fa-trash-can"></i> Excluir
            </button>
          </div>
        </article>
      `)
      .join("");
  }

  document.querySelectorAll("[data-cat-filter]").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll("[data-cat-filter]").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeCatFilter = btn.dataset.catFilter;
      renderCatalogAdmin();
    };
  });

  function processImageFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 640;
          let w = img.width, h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const chooseImageBtn = $("#btn-choose-image");
  const fileInput = $("#prod-file-input");
  if (chooseImageBtn && fileInput) {
    chooseImageBtn.onclick = () => fileInput.click();
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await processImageFile(file);
        $("#prod-image-preview").src = dataUrl;
        $("#prod-image-url").value = dataUrl;
      } catch (err) {
        alert("Não foi possível processar a imagem. Tente outra foto.");
      }
    };
  }

  const prodImageUrlInput = $("#prod-image-url");
  if (prodImageUrlInput) {
    prodImageUrlInput.oninput = (e) => {
      if (e.target.value.trim()) {
        $("#prod-image-preview").src = e.target.value.trim();
      }
    };
  }

  const btnAddProduct = $("#btn-add-product");
  if (btnAddProduct) {
    btnAddProduct.onclick = () => {
      $("#product-modal-kicker").textContent = "NOVO CADASTRO";
      $("#product-modal-title").textContent = "Adicionar Produto";
      $("#prod-id").value = "";
      $("#prod-name").value = "";
      $("#prod-price").value = "";
      $("#prod-category").value = activeCatFilter !== "all" ? activeCatFilter : "highlights";
      $("#prod-image-url").value = "";
      $("#prod-image-preview").src = "assets/logo-clean.png";
      $("#prod-description").value = "";
      $("#product-modal").showModal();
    };
  }

  const catalogProductsList = $("#catalog-products-list");
  if (catalogProductsList) {
    catalogProductsList.onclick = async (e) => {
      const editBtn = e.target.closest("[data-edit-product]");
      if (editBtn) {
        const id = editBtn.dataset.editProduct;
        const prod = window.MMS_PRODUCTS[id];
        if (!prod) return;
        $("#product-modal-kicker").textContent = "EDITAR PRODUTO";
        $("#product-modal-title").textContent = prod.name;
        $("#prod-id").value = id;
        $("#prod-name").value = prod.name || "";
        $("#prod-price").value = prod.price || "";
        $("#prod-category").value = prod.category || "highlights";
        $("#prod-image-url").value = prod.image || "";
        $("#prod-image-preview").src = prod.image || "assets/logo-clean.png";
        $("#prod-description").value = prod.description || "";
        $("#product-modal").showModal();
        return;
      }

      const delBtn = e.target.closest("[data-delete-product]");
      if (delBtn) {
        const id = delBtn.dataset.deleteProduct;
        const prod = window.MMS_PRODUCTS[id];
        if (!prod) return;
        if (confirm(`Tem certeza que deseja excluir o produto "${prod.name}" do cardápio?`)) {
          customCatalog[id] = { deleted: true };
          delete window.MMS_PRODUCTS[id];
          await D.catalog.saveProducts(customCatalog);
          renderCatalogAdmin();
          await renderAvailability();
        }
      }
    };
  }

  const btnCloseProductModal = $("#btn-close-product-modal");
  const btnCancelProduct = $("#btn-cancel-product");
  if (btnCloseProductModal) btnCloseProductModal.onclick = () => $("#product-modal").close();
  if (btnCancelProduct) btnCancelProduct.onclick = () => $("#product-modal").close();

  const productModalForm = $("#product-modal-form");
  if (productModalForm) {
    productModalForm.onsubmit = async (e) => {
      e.preventDefault();
      const saveBtn = $("#btn-save-product");
      const origText = saveBtn.innerHTML;
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

      try {
        let id = $("#prod-id").value.trim();
        const name = $("#prod-name").value.trim();
        const price = parseFloat($("#prod-price").value) || 0;
        const category = $("#prod-category").value;
        const image = $("#prod-image-url").value.trim() || $("#prod-image-preview").src;
        const description = $("#prod-description").value.trim();

        if (!id) {
          const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          id = slug || `prod-${Date.now()}`;
          if (window.MMS_PRODUCTS[id]) {
            id = `${id}-${Date.now().toString().slice(-4)}`;
          }
        }

        const productPayload = {
          name,
          price,
          category,
          image: image || "assets/logo-clean.png",
          description: description || name,
          leadTimeHours: 20,
          defaultFinish: "cobertura",
        };

        customCatalog[id] = productPayload;
        window.MMS_PRODUCTS[id] = { ...(window.MMS_PRODUCTS[id] || {}), ...productPayload };

        await D.catalog.saveProducts(customCatalog);

        $("#product-modal").close();
        renderCatalogAdmin();
        await renderAvailability();
      } catch (err) {
        alert("Erro ao salvar produto: " + err.message);
      } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = origText;
      }
    };
  }
  function itemSummary(o) {
    return o.items?.length
      ? o.items
          .map(
            (i) =>
              `${i.quantity || 1}× ${i.name || P[i.productId]?.name || i.productId}`,
          )
          .join(", ")
      : o.notes || "Pedido sem resumo";
  }
  function renderOrders() {
    const statuses = [
      "NOVO",
      "CONFIRMADO",
      "EM PREPARO",
      "PRONTO",
      "SAIU PARA ENTREGA",
      "ENTREGUE",
      "CANCELADO",
    ];
    $("#orders-list").innerHTML = orders.length
      ? orders
          .map(
            (o) =>
              `<article class="order-card" data-order="${o.id}"><header><div><strong>${esc(o.orderNumber)} · ${esc(o.customerName)}</strong><small>${o.date}${o.time ? ` às ${o.time}` : ""} · ${esc(o.deliveryType || "")}</small></div><strong>${money.format(o.total)}</strong></header><p>${esc(itemSummary(o))}</p><div class="order-actions"><select data-field="status">${statuses.map((s) => `<option ${s === o.status ? "selected" : ""}>${s}</option>`)}</select><select data-field="paymentStatus"><option ${o.paymentStatus === "Pendente" ? "selected" : ""}>Pendente</option><option ${o.paymentStatus === "Pago" ? "selected" : ""}>Pago</option></select><a href="https://wa.me/55${String(o.customerPhone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, ${o.customerName}! Seu pedido ${o.orderNumber} da MMS está ${String(o.status).toLowerCase()} 🤎`)}" target="_blank" rel="noopener">WhatsApp</a><button data-edit>Editar</button></div></article>`,
          )
          .join("")
      : empty("Nenhum pedido cadastrado.");
  }
  $("#orders-list").onchange = async (e) => {
    const o = orders.find(
      (x) => x.id === e.target.closest("[data-order]")?.dataset.order,
    );
    if (o && e.target.dataset.field) {
      o[e.target.dataset.field] = e.target.value;
      await D.orders.save(o);
      await refresh();
    }
  };
  $("#orders-list").onclick = (e) => {
    const id = e.target.closest("[data-order]")?.dataset.order;
    if (e.target.matches("[data-edit]")) {
      const o = orders.find((x) => x.id === id),
        f = $("#order-form");
      Object.entries(o).forEach(([k, v]) => {
        if (f.elements[k] && typeof v !== "object")
          f.elements[k].value = v ?? "";
      });
      go("orders");
      f.scrollIntoView({ behavior: "smooth" });
    }
  };
  $("#order-form").onsubmit = async (e) => {
    e.preventDefault();
    const o = Object.fromEntries(new FormData(e.currentTarget));
    o.subtotal = Number(o.subtotal) || 0;
    o.total = Number(o.total) || o.subtotal;
    o.items = orders.find((x) => x.id === o.id)?.items || [];
    await D.orders.save(o);
    e.currentTarget.reset();
    await refresh();
  };
  const openImport = () => $("#import-dialog").showModal();
  $("#open-import").onclick = openImport;
  $("#import-order").onclick = openImport;
  $("#preview-import").onclick = () => {
    imported = U.parseWhatsAppOrder($("#import-text").value, P);
    $("#import-preview").innerHTML =
      `<h3>Preview do pedido</h3><dl><dt>Cliente</dt><dd>${esc(imported.customerName || "Não identificado")}</dd><dt>Data</dt><dd>${esc(imported.date || "Não identificada")} ${esc(imported.time || "")}</dd><dt>Itens</dt><dd>${esc(itemSummary(imported))}</dd><dt>Total</dt><dd>${money.format(imported.total)}</dd></dl>${imported.warnings.length ? `<p class="warning">${imported.warnings.map(esc).join("<br>")}</p>` : ""}`;
    $("#confirm-import").hidden = false;
  };
  $("#confirm-import").onclick = async () => {
    await D.orders.save(imported);
    $("#import-dialog").close();
    $("#import-text").value = "";
    await refresh();
    go("orders");
  };
  async function renderAgenda() {
    const selected = $("#agenda-date").value,
      list = orders
        .filter((o) => o.date === selected)
        .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
    $("#agenda-list").innerHTML = list.length
      ? list
          .map(
            (o) =>
              `<article class="agenda-item"><time>${o.time || "SEM HORÁRIO"}</time><div><strong>${esc(o.customerName)}</strong><p>${esc(itemSummary(o))}</p><small>${esc(o.status)} · ${esc(o.deliveryType || "")}</small></div></article>`,
          )
          .join("")
      : empty("Nenhum pedido para este dia.");
    const prod = list
        .filter((o) => ["CONFIRMADO", "EM PREPARO"].includes(o.status))
        .flatMap((o) => o.items || []),
      groups = {};
    prod.forEach((i) => {
      const key = U.productionGroupKey(i);
      groups[key] = groups[key] || {
        key,
        name: i.name || P[i.productId]?.name || key,
        quantity: 0,
      };
      groups[key].quantity += Number(i.quantity) || 1;
    });
    productionChecklistDate = selected;
    productionChecklist = await D.settings.getValue(
      `production-checklist:${selected}`,
    );
    productionChecklist.groups ||= {};
    $("#production-list").innerHTML = Object.values(groups).length
      ? Object.values(groups)
          .map((g) => {
            const state = productionChecklist.groups[g.key] || {};
            return `<article class="production-item"><strong>${g.quantity}× ${esc(g.name)}</strong><div><label><input type="checkbox" data-production-key="${esc(g.key)}" data-stage="prepared" ${state.prepared ? "checked" : ""}> Preparado</label><label><input type="checkbox" data-production-key="${esc(g.key)}" data-stage="finished" ${state.finished ? "checked" : ""}> Finalizado</label><label><input type="checkbox" data-production-key="${esc(g.key)}" data-stage="packed" ${state.packed ? "checked" : ""}> Embalado</label></div></article>`;
          })
          .join("")
      : empty("Sem itens confirmados para produção.");
  }
  $("#agenda-date").value = today;
  $("#agenda-date").onchange = () => renderAgenda();
  $("#production-list").onchange = async (event) => {
    const input = event.target.closest("[data-production-key]");
    if (!input) return;
    const key = input.dataset.productionKey;
    productionChecklist.groups[key] ||= {};
    productionChecklist.groups[key][input.dataset.stage] = input.checked;
    await D.settings.saveValue(
      `production-checklist:${productionChecklistDate}`,
      productionChecklist,
    );
  };
  $("#copy-production").onclick = () =>
    navigator.clipboard.writeText($("#production-list").innerText);
  $("#print-production").onclick = () => window.print();
  function renderCustomers() {
    const customers = U.groupCustomers(orders);
    $("#customers-list").innerHTML = customers.length
      ? `<table><thead><tr><th>Nome</th><th>Telefone</th><th>Último pedido</th><th>Pedidos</th><th>Valor registrado</th><th></th></tr></thead><tbody>${Object.values(
          customers,
        )
          .map(
            (c) =>
              `<tr><td>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${c.last}</td><td>${c.count}</td><td>${money.format(c.total)}</td><td><button type="button" data-customer="${esc(c.key)}">Ver histórico</button></td></tr>`,
          )
          .join("")}</tbody></table>`
      : empty("Clientes aparecerão a partir dos pedidos.");
  }
  $("#customers-list").onclick = (event) => {
    const button = event.target.closest("[data-customer]");
    if (!button) return;
    selectedCustomer = U.groupCustomers(orders).find(
      (customer) => customer.key === button.dataset.customer,
    );
    if (!selectedCustomer) return;
    $("#customer-dialog-title").textContent = selectedCustomer.name;
    $("#customer-summary").innerHTML =
      `<dl class="customer-summary"><div><dt>Telefone</dt><dd>${esc(selectedCustomer.phone || "Não informado")}</dd></div><div><dt>Pedidos registrados</dt><dd>${selectedCustomer.count}</dd></div><div><dt>Último pedido</dt><dd>${selectedCustomer.last}</dd></div><div><dt>Valor registrado</dt><dd>${money.format(selectedCustomer.total)}</dd></div></dl>`;
    $("#customer-history").innerHTML = selectedCustomer.orders
      .map(
        (order) =>
          `<article><header><strong>${esc(order.orderNumber)}</strong><time>${esc(order.date)}</time></header><p>${esc(itemSummary(order))}</p><small>${money.format(order.total)} · ${esc(order.status)} · ${esc(order.paymentStatus)} · ${esc(order.deliveryType || "")}</small></article>`,
      )
      .join("");
    $("#customer-whatsapp").href =
      `https://wa.me/55${selectedCustomer.normalizedPhone}`;
    $("#customer-dialog").showModal();
  };
  $("[data-close-customer]").onclick = () => $("#customer-dialog").close();
  $("#customer-new-order").onclick = () => {
    const form = $("#order-form");
    form.reset();
    form.elements.customerName.value = selectedCustomer.name || "";
    form.elements.customerPhone.value = selectedCustomer.phone || "";
    $("#customer-dialog").close();
    go("orders");
    form.scrollIntoView({ behavior: "smooth" });
  };
  function renderFinance() {
    const paid = orders.filter((o) => o.paymentStatus === "Pago"),
      month = today.slice(0, 7);
    $("#finance-metrics").innerHTML =
      card(
        "Recebido hoje",
        money.format(
          paid.filter((o) => o.date === today).reduce((n, o) => n + o.total, 0),
        ),
        "fa-circle-check"
      ) +
      card(
        "Pendente",
        money.format(
          orders
            .filter((o) => o.paymentStatus !== "Pago")
            .reduce((n, o) => n + o.total, 0),
        ),
        "fa-clock"
      ) +
      card(
        "Recebido no mês",
        money.format(
          paid
            .filter((o) => o.date?.startsWith(month))
            .reduce((n, o) => n + o.total, 0),
        ),
        "fa-calendar-days"
      );
    $("#finance-list").innerHTML = orders.length
      ? `<table><thead><tr><th>Pedido</th><th>Cliente</th><th>Data</th><th>Valor</th><th>Pagamento</th><th>Status</th></tr></thead><tbody>${orders.map((o) => `<tr><td>${esc(o.orderNumber)}</td><td>${esc(o.customerName)}</td><td>${o.date}</td><td>${money.format(o.total)}</td><td>${esc(o.paymentMethod)}</td><td>${esc(o.paymentStatus)}</td></tr>`).join("")}</tbody></table>`
      : empty("Sem lançamentos.");
  }
  function renderReports() {
    const days = Number($("#report-range").value),
      start = dates.shiftISODate(today, -(days - 1)),
      filtered = orders.filter((o) => o.date >= start && o.date <= today),
      revenue = filtered.reduce((n, o) => n + o.total, 0),
      counts = {},
      breakdown = U.buildReportBreakdown(filtered);
    filtered
      .flatMap((o) => o.items || [])
      .forEach((i) => {
        const n = i.name || P[i.productId]?.name || i.productId;
        counts[n] = (counts[n] || 0) + (Number(i.quantity) || 1);
      });
    $("#report-metrics").innerHTML =
      card("Pedidos no período", filtered.length, "fa-receipt") +
      card("Faturamento registrado", money.format(revenue), "fa-chart-pie") +
      card(
        "Ticket médio registrado",
        money.format(filtered.length ? revenue / filtered.length : 0),
        "fa-basket-shopping"
      );
    const productsReport = Object.keys(counts).length
      ? `<section><h3>Produtos mais pedidos</h3>${Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(
            ([n, q]) =>
              `<div class="report-bar"><span>${esc(n)}</span><b style="--value:${q}">${q}</b></div>`,
          )
          .join("")}</section>`
      : empty("Sem produtos no período.");
    const deliveryTotal =
      breakdown.delivery.Entrega.count + breakdown.delivery.Retirada.count;
    const deliveryReport = deliveryTotal
      ? `<section><h3>Entrega × Retirada</h3><div class="report-summary"><p><strong>${breakdown.delivery.Entrega.count}</strong> Entrega <small>${breakdown.delivery.Entrega.percent.toFixed(1)}%</small></p><p><strong>${breakdown.delivery.Retirada.count}</strong> Retirada <small>${breakdown.delivery.Retirada.percent.toFixed(1)}%</small></p></div></section>`
      : `<section><h3>Entrega × Retirada</h3>${empty("Sem dados de recebimento no período.")}</section>`;
    const paymentEntries = ["Pix", "Cartão", "Dinheiro", "Outros"].filter(
      (method) => breakdown.payments[method],
    );
    const paymentReport = paymentEntries.length
      ? `<section><h3>Formas de pagamento</h3><div class="report-summary">${paymentEntries.map((method) => `<p><strong>${breakdown.payments[method].count}</strong> ${method} <small>${money.format(breakdown.payments[method].value)}</small></p>`).join("")}</div></section>`
      : `<section><h3>Formas de pagamento</h3>${empty("Sem formas de pagamento no período.")}</section>`;
    $("#report-details").innerHTML =
      `<div class="report-sections">${productsReport}${deliveryReport}${paymentReport}</div>`;
  }
  $("#report-range").onchange = renderReports;
  $("#export-orders").onclick = () =>
    download(
      `mms-pedidos-${today}.csv`,
      U.ordersToCSV(orders),
      "text/csv;charset=utf-8",
    );
  $("#export-finance").onclick = $("#export-orders").onclick;
  $("#export-data").onclick = () =>
    download(
      `mms-backup-${today}.json`,
      JSON.stringify(
        {
          version: 2,
          exportedAt: new Date().toISOString(),
          availability,
          orders,
        },
        null,
        2,
      ),
      "application/json",
    );
  $("#import-data").onchange = async (e) => {
    const data = JSON.parse(await e.target.files[0].text());
    if (D.remote)
      return alert("Restauração direta é permitida apenas no modo local.");
    localStorage.setItem(
      D.keys.availability,
      JSON.stringify(data.availability || []),
    );
    localStorage.setItem(D.keys.orders, JSON.stringify(data.orders || []));
    await refresh();
  };
  async function refresh() {
    await loadCustomCatalog();
    renderCatalogAdmin();
    orders = await D.orders.list();
    await loadAvailability(today);
    const todays = orders.filter((o) => o.date === today);
    $("#dashboard-metrics").innerHTML =
      card("Pedidos hoje", todays.length, "fa-receipt") +
      card(
        "Em produção",
        todays.filter((o) => ["CONFIRMADO", "EM PREPARO"].includes(o.status))
          .length,
        "fa-fire-burner"
      ) +
      card(
        "Entregas",
        todays.filter((o) => o.deliveryType === "Entrega").length,
        "fa-truck"
      ) +
      card(
        "Retiradas",
        todays.filter((o) => o.deliveryType === "Retirada").length,
        "fa-store"
      );
    $("#today-orders").innerHTML = todays.length
      ? todays
          .map(
            (o) =>
              `<p><strong>${esc(o.time || "--:--")} · ${esc(o.customerName)}</strong><br>${esc(o.status)}</p>`,
          )
          .join("")
      : empty("Sem pedidos hoje.");
    $("#today-ready").innerHTML = availability.length
      ? availability
          .map(
            (a) =>
              `<p><strong>${a.quantity}× ${esc(P[a.productId]?.name || a.productId)}</strong></p>`,
          )
          .join("")
      : empty("Nenhum produto disponível.");
    renderOrders();
    await renderAgenda();
    renderCustomers();
    renderFinance();
    renderReports();
    if (!$("#admin-app").hidden) await renderAvailability();
  }
  if (!$("#admin-app").hidden) await refresh();
})();
