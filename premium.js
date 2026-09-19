(async () => {
  const products = window.MMS_PRODUCTS || {};
  const READY_KEY = 'mms-ready-availability-v1';
  const today = window.MMSDate.getSaoPauloDateISO();
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  let ready = [];
  try { ready = (await window.MMSData.availabilityForDate(today)).filter(item => item.active && item.quantity > 0 && products[item.productId]); }
  catch { try { ready = JSON.parse(localStorage.getItem(READY_KEY) || '[]').filter(item => item.active && item.date === today && item.quantity > 0 && products[item.productId]); } catch { ready = []; } }
  const categoryName = { highlights: 'Destaques', house: 'Bolos Caseiros', sweets: 'Doces' };
  const priceLabel = p => `${p.pricing || p.startingAt || p.customization ? 'A partir de ' : ''}${money.format(p.customization?.pricePerKg || p.price)}${p.customization ? '/kg' : ''}`;
  const initReadyCarousel = grid => {
    const cards = [...grid.querySelectorAll('.ready-card')];
    if (cards.length <= 2) return;
    grid.classList.add('is-carousel');
    grid.setAttribute('role', 'region');
    grid.setAttribute('aria-roledescription', 'carrossel');
    grid.setAttribute('aria-label', 'Produtos disponíveis hoje');
    cards.forEach((card, index) => card.setAttribute('aria-label', `${index + 1} de ${cards.length}`));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let index = 0;
    let timer;
    const goTo = next => {
      index = next >= cards.length ? 0 : next;
      grid.scrollTo({ left: cards[index].offsetLeft - cards[0].offsetLeft, behavior: 'smooth' });
    };
    const play = () => { clearInterval(timer); timer = setInterval(() => goTo(index + 1), 3800); };
    const pause = () => clearInterval(timer);
    grid.addEventListener('pointerenter', pause);
    grid.addEventListener('pointerleave', play);
    grid.addEventListener('focusin', pause);
    grid.addEventListener('focusout', event => { if (!grid.contains(event.relatedTarget)) play(); });
    grid.addEventListener('touchstart', pause, { passive: true });
    grid.addEventListener('touchend', play, { passive: true });
    addEventListener('resize', () => goTo(index), { passive: true });
    document.addEventListener('visibilitychange', () => document.hidden ? pause() : play());
    play();
  };
  const openProduct = id => {
    const card = document.querySelector(`[data-product-id="${CSS.escape(id)}"]`);
    if (card) { card.scrollIntoView({ behavior: 'smooth', block: 'center' }); card.querySelector('.btn-add')?.focus(); card.querySelector('.btn-add')?.click(); }
    else { const route = products[id].category === 'house' ? 'bolos-caseiros/' : products[id].category === 'sweets' ? 'doces/' : 'nossos-destaques/'; location.href = new URL(`${route}?produto=${encodeURIComponent(id)}`, document.baseURI).href; }
  };

  const nav = document.querySelector('.navbar');
  if (nav) {
    const search = document.createElement('div'); search.className = 'global-search'; search.innerHTML = `<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i><label class="sr-only" for="global-product-search">Buscar produtos</label><input id="global-product-search" class="global-search-input" type="search" placeholder="Buscar produtos..." autocomplete="off" aria-controls="global-search-results" aria-expanded="false"><button class="search-close" type="button" aria-label="Fechar busca"><i class="fa-solid fa-xmark"></i></button><div class="search-results" id="global-search-results" role="listbox" hidden></div>`;
    nav.querySelector('.nav-actions')?.prepend(search);
    const mobileButton = document.createElement('button'); mobileButton.className='mobile-search-trigger'; mobileButton.type='button'; mobileButton.setAttribute('aria-label','Buscar produtos'); mobileButton.innerHTML='<i class="fa-solid fa-magnifying-glass"></i>'; nav.querySelector('.nav-actions')?.prepend(mobileButton);
    const input=search.querySelector('input'), results=search.querySelector('.search-results'); let active=-1;
    const render = () => { const q=normalize(input.value.trim()); if(!q){results.hidden=true;input.setAttribute('aria-expanded','false');return;} const matches=Object.entries(products).filter(([,p])=>normalize(`${p.name} ${p.description} ${categoryName[p.category]}`).includes(q)).slice(0,7); results.innerHTML=matches.length?matches.map(([id,p],i)=>`<button class="search-result" role="option" aria-selected="${i===active}" data-search-id="${id}"><img src="${new URL(p.image,document.baseURI).href}" alt=""><span><strong>${p.name}</strong><small>${categoryName[p.category]}${ready.some(r=>r.productId===id)?' · Disponível hoje':''}</small></span><small>${priceLabel(p)}</small></button>`).join(''):'<p class="search-empty">Nenhum produto encontrado.</p>'; results.hidden=false; input.setAttribute('aria-expanded','true'); };
    input.addEventListener('input',()=>{active=-1;render()}); input.addEventListener('keydown',e=>{const items=[...results.querySelectorAll('.search-result')];if(e.key==='Escape'){results.hidden=true;document.body.classList.remove('mobile-search-open')}else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();active=(active+(e.key==='ArrowDown'?1:-1)+items.length)%items.length;render()}else if(e.key==='Enter'&&items[active])items[active].click()});
    results.addEventListener('click',e=>{const item=e.target.closest('[data-search-id]');if(item)openProduct(item.dataset.searchId)}); mobileButton.addEventListener('click',()=>{document.body.classList.add('mobile-search-open');setTimeout(()=>input.focus(),0)}); search.querySelector('.search-close').addEventListener('click',()=>{document.body.classList.remove('mobile-search-open');results.hidden=true});
  }

  const hero=document.querySelector('.hero-section');
  if(hero){const strip=document.createElement('section');strip.className='service-strip';strip.setAttribute('aria-label','Informações de atendimento');strip.innerHTML=`<article><i class="fa-regular fa-calendar"></i><div><strong>Encomendas com antecedência</strong><small>Garanta a disponibilidade da sua data</small></div></article><article><i class="fa-solid fa-truck"></i><div><strong>Retirada ou entrega</strong><small>Em Camaragibe e região</small></div></article><article><i class="fa-brands fa-whatsapp"></i><div><strong>Atendimento pelo WhatsApp</strong><small>Tire dúvidas e faça seu pedido</small></div></article><article><i class="fa-regular fa-heart"></i><div><strong>Feito com carinho</strong><small>Qualidade em cada receita</small></div></article>`;hero.after(strip)}
  if(ready.length && document.querySelector('main')){const section=document.createElement('section');section.className='ready-section';section.id='pronta-entrega';section.innerHTML=`<div class="ready-heading"><div><span class="section-tag">DISPONÍVEIS HOJE</span><h2>Pronta entrega</h2></div><p>Delícias já disponíveis para você garantir hoje mesmo. Sujeito à disponibilidade.</p></div><div class="ready-grid">${ready.map(item=>{const p=products[item.productId];return `<article class="ready-card"><span class="ready-badge" data-low="${item.quantity<=2}">${item.quantity<=2?`Últimas ${item.quantity}`:'Disponível hoje'}</span><img src="${new URL(p.image,document.baseURI).href}" alt="${p.name}" loading="lazy"><div class="ready-card-body"><h3>${p.name}</h3><span>${priceLabel(p)}</span><button type="button" data-ready-id="${item.productId}">VER PRODUTO <i class="fa-solid fa-arrow-right"></i></button></div></article>`}).join('')}</div>`;const anchor=document.querySelector('.features-section')||document.querySelector('main').firstElementChild;anchor?.after(section);section.addEventListener('click',e=>{const b=e.target.closest('[data-ready-id]');if(b)openProduct(b.dataset.readyId)});initReadyCarousel(section.querySelector('.ready-grid'))}
  document.querySelectorAll('[data-product-id]').forEach(card=>{const item=ready.find(r=>r.productId===card.dataset.productId);if(item&&!card.querySelector('.product-ready-badge'))card.insertAdjacentHTML('afterbegin',`<span class="product-ready-badge">Disponível hoje</span>`)});
  const grid=document.querySelector('.page-products-grid');
  if(grid){
    const cards=[...grid.children],catalogProducts=cards.map(c=>products[c.dataset.productId]).filter(Boolean),hasVariants=catalogProducts.some(p=>p.pricing),hasSimple=catalogProducts.some(p=>p.pricing&&Object.values(p.pricing).some(x=>x.simples));
    const toolbar=document.createElement('div');toolbar.className='catalog-toolbar';toolbar.innerHTML=`<input type="search" aria-label="Filtrar produtos" placeholder="Buscar neste catálogo"><select data-filter="availability" aria-label="Disponibilidade"><option value="all">Todos</option><option value="ready">Disponível hoje</option></select>${hasVariants?'<select data-filter="size" aria-label="Tamanho"><option value="all">Todos os tamanhos</option><option value="pequeno">Pequeno</option><option value="medio">Médio</option><option value="grande">Grande</option></select>':''}${hasSimple?'<select data-filter="finish" aria-label="Acabamento"><option value="all">Todo acabamento</option><option value="simples">Simples</option><option value="cobertura">Com cobertura</option></select>':''}<select data-filter="price" aria-label="Faixa de preço"><option value="all">Todos os preços</option><option value="0-29">Até R$ 29</option><option value="30-59">R$ 30–59</option><option value="60-999">R$ 60 ou mais</option></select><select data-filter="sort" aria-label="Ordenar produtos"><option value="original">Ordenar por</option><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="name">Nome A–Z</option></select><button class="page-button" type="button">Limpar filtros</button><span class="catalog-count"></span>`;
    grid.before(toolbar);
    const apply=()=>{const q=normalize(toolbar.querySelector('input').value),availability=toolbar.querySelector('[data-filter=availability]').value,size=toolbar.querySelector('[data-filter=size]')?.value||'all',finish=toolbar.querySelector('[data-filter=finish]')?.value||'all',range=toolbar.querySelector('[data-filter=price]').value,sort=toolbar.querySelector('[data-filter=sort]').value;let visible=cards.filter(c=>{const p=products[c.dataset.productId],[min,max]=range==='all'?[0,Infinity]:range.split('-').map(Number);return(!q||normalize(`${p.name} ${p.description}`).includes(q))&&(availability!=='ready'||ready.some(r=>r.productId===c.dataset.productId))&&(size==='all'||Boolean(p.pricing?.[size]))&&(finish==='all'||Boolean(Object.values(p.pricing||{}).some(x=>x[finish]!=null)))&&p.price>=min&&p.price<=max});cards.forEach(c=>c.hidden=!visible.includes(c));visible.sort((a,b)=>{const pa=products[a.dataset.productId],pb=products[b.dataset.productId];return sort==='price-asc'?pa.price-pb.price:sort==='price-desc'?pb.price-pa.price:sort==='name'?pa.name.localeCompare(pb.name,'pt-BR'):cards.indexOf(a)-cards.indexOf(b)}).forEach(c=>grid.append(c));toolbar.querySelector('.catalog-count').textContent=`${visible.length} produto${visible.length===1?'':'s'} encontrado${visible.length===1?'':'s'}`};toolbar.addEventListener('input',apply);toolbar.querySelector('button').addEventListener('click',()=>{toolbar.querySelector('input').value='';toolbar.querySelectorAll('select').forEach(s=>s.selectedIndex=0);apply()});apply()}
  const requested=new URLSearchParams(location.search).get('produto');if(requested&&products[requested])setTimeout(()=>openProduct(requested),200);
})();
