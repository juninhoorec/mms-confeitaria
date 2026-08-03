const menuButton = document.querySelector('.menu-toggle');
const navbar = document.querySelector('.navbar');
const mobileMenu = document.querySelector('#mobile-menu');
const cartTrigger = document.querySelector('#cart-trigger');
const cartPanel = document.querySelector('#cart-panel');
const catalogTriggers = [...document.querySelectorAll('[data-open-catalog]')];
const productsModal = document.querySelector('#products-modal');
const catalogEyebrow = document.querySelector('#catalog-eyebrow');
const catalogTitle = document.querySelector('#catalog-title');
const catalogGrid = document.querySelector('#catalog-grid');
const cartCount = document.querySelector('.cart-count');
const cartItems = document.querySelector('.cart-items');
const cartEmpty = document.querySelector('.cart-empty');
const cartSubtotal = document.querySelector('#cart-subtotal');
const cartShipping = document.querySelector('#cart-shipping');
const shippingLabel = document.querySelector('#shipping-label');
const shippingNote = document.querySelector('#shipping-note');
const cartTotal = document.querySelector('#cart-total');
const cartCheckout = document.querySelector('#cart-checkout');
const cartFeedback = document.querySelector('.cart-feedback');
const orderDate = document.querySelector('#order-date');
const orderTime = document.querySelector('#order-time');
const orderAddress = document.querySelector('#order-address');
const orderAddressField = document.querySelector('.order-address-field');
const orderPayment = document.querySelector('#order-payment');
const pickupLocal = document.querySelector('#pickup-local');
const productDetailModal = document.querySelector('#product-detail-modal');
const productDetailImage = document.querySelector('#product-detail-image');
const productDetailImageButton = document.querySelector('#product-detail-image-button');
const productDetailTitle = document.querySelector('#product-detail-title');
const productDetailPrice = document.querySelector('#product-detail-price');
const productDetailDescription = document.querySelector('#product-detail-description');
const productDetailIngredients = document.querySelector('#product-detail-ingredients');
const productVariants = document.querySelector('#product-variants');
const cakeSizeInputs = [...document.querySelectorAll('input[name="cake-size"]')];
const cakeFinishInputs = [...document.querySelectorAll('input[name="cake-finish"]')];
const productNotes = document.querySelector('#product-notes');
const productNotesCount = document.querySelector('#product-notes-count');
const detailQuantityValue = document.querySelector('#detail-quantity-value');
const detailDecrease = document.querySelector('#detail-decrease');
const detailIncrease = document.querySelector('#detail-increase');
const productDetailAdd = document.querySelector('#product-detail-add');
const imageLightbox = document.querySelector('#image-lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const zoomableImageSelector = '.product-img img, .catalog-card-image img, .story-media img';
const scrollProgress = document.querySelector('#scroll-progress');
const scrollProgressRing = document.querySelector('#scroll-progress-ring');
const scrollProgressValue = document.querySelector('#scroll-progress-value');
const scrollToTop = document.querySelector('#scroll-to-top');

const PRODUCTS = {
    'bolo-chocolatudo': {
        name: 'Bolo Chocolatudo',
        price: 40.0,
        category: 'highlights',
        leadTimeHours: 20,
        image: 'imagens mms/bolo chocolatudo.png',
        description: 'Bolo de chocolate intenso, recheado e coberto com brigadeiro cremoso preparado com chocolate belga.',
        ingredients: ['Massa de chocolate', 'Chocolate belga', 'Leite condensado', 'Granulado de chocolate'],
    },
    'bolo-baunilha-com-ninho': {
        name: 'Bolo Baunilha com Ninho',
        price: 159.9,
        category: 'highlights',
        leadTimeHours: 20,
        image: 'imagens mms/bolo baunilha com ninho.png',
        description: 'Massa leve com recheio cremoso de leite Ninho, finalizada com baunilha e creme delicado.',
        ingredients: ['Massa branca', 'Leite Ninho', 'Baunilha', 'Creme de leite'],
    },
    'ninho-nutella': {
        name: 'Ninho com Nutella',
        price: 159.9,
        category: 'highlights',
        leadTimeHours: 20,
        image: 'assets/cake-3-premium.webp',
        description: 'Combinação equilibrada de creme de leite Ninho com Nutella, coberta por raspas de chocolate branco.',
        ingredients: ['Massa branca', 'Leite Ninho', 'Nutella', 'Chocolate branco'],
    },
    'bolo-chocolate-cremoso-50%': {
        name: 'Bolo Chocolate Cremoso 50%',
        price: 139.9,
        category: 'highlights',
        leadTimeHours: 20,
        image: 'imagens mms/bolo-chocolate-cremoso-50.webp',
        description: 'Bolo de chocolate macio com recheio cremoso, ganache brilhante e brigadeiros artesanais.',
        ingredients: ['Massa de chocolate', 'Ganache', 'Brigadeiro cremoso', 'Cacau'],
    },
    'red-velvet': {
        name: 'Red Velvet com Frutas Vermelhas',
        price: 169.9,
        category: 'highlights',
        leadTimeHours: 20,
        image: 'assets/cake-5-red-velvet.webp',
        description: 'Clássico Red Velvet com creme suave e frutas vermelhas frescas, equilibrando doçura e acidez.',
        ingredients: ['Massa Red Velvet', 'Cream cheese', 'Morangos', 'Framboesas e mirtilos'],
    },
    'doce-leite-nozes': {
        name: 'Doce de Leite com Nozes',
        price: 164.9,
        category: 'highlights',
        leadTimeHours: 20,
        image: 'assets/cake-6-doce-leite-nozes.webp',
        description: 'Massa de baunilha com doce de leite cremoso, cobertura caramelizada e nozes selecionadas.',
        ingredients: ['Massa de baunilha', 'Doce de leite', 'Nozes', 'Creme de leite'],
    },
    'bolo-baunilha': {
        name: 'Bolo de Baunilha',
        price: 20,
        category: 'house',
        image: 'assets/hero-bolos-caseiros-premium.webp',
        description: 'Bolo caseiro de massa leve e perfumada, preparado artesanalmente para acompanhar o café e os encontros em família.',
        ingredients: ['Farinha de trigo', 'Baunilha', 'Leite', 'Ovos'],
        pricing: {
            pequeno: { simples: 20, cobertura: 28 },
            medio: { simples: 30, cobertura: 40 },
            grande: { simples: 40, cobertura: 55 },
        },
    },
    'bolo-chocolate-caseiro': {
        name: 'Bolo de Chocolate',
        price: 20,
        category: 'house',
        image: 'assets/cake-1-premium.webp',
        description: 'Massa caseira de chocolate, úmida e intensa, com opção de cobertura cremosa para deixar cada fatia ainda mais especial.',
        ingredients: ['Chocolate 50%', 'Farinha de trigo', 'Leite', 'Ovos'],
        pricing: {
            pequeno: { simples: 20, cobertura: 28 },
            medio: { simples: 30, cobertura: 40 },
            grande: { simples: 40, cobertura: 55 },
        },
    },
    'bolo-cenoura': {
        name: 'Bolo de Cenoura',
        price: 20,
        category: 'house',
        image: 'assets/bolo-cenoura-premium.webp',
        description: 'Clássico bolo de cenoura com massa macia e cor dourada, perfeito simples ou finalizado com cobertura de chocolate.',
        ingredients: ['Cenoura fresca', 'Farinha de trigo', 'Ovos', 'Óleo'],
        pricing: {
            pequeno: { simples: 20, cobertura: 28 },
            medio: { simples: 30, cobertura: 40 },
            grande: { simples: 40, cobertura: 55 },
        },
    },
    'bolo-laranja': {
        name: 'Bolo de Laranja',
        price: 20,
        category: 'house',
        image: 'assets/bolo-laranja-premium.webp',
        description: 'Bolo aromático preparado com laranja, textura macia e sabor equilibrado, com acabamento simples ou cobertura delicada.',
        ingredients: ['Laranja', 'Farinha de trigo', 'Leite', 'Ovos'],
        pricing: {
            pequeno: { simples: 20, cobertura: 28 },
            medio: { simples: 30, cobertura: 40 },
            grande: { simples: 40, cobertura: 55 },
        },
    },
    'bolo-fuba-cremoso': {
        name: 'Bolo de Fubá Cremoso',
        price: 20,
        category: 'house',
        image: 'assets/bolo-fuba-cremoso-premium.webp',
        description: 'Receita de fubá com interior cremoso e perfume de casa, feita para servir morna ou acompanhar um café fresco.',
        ingredients: ['Fubá', 'Leite', 'Ovos', 'Queijo ralado'],
        pricing: {
            pequeno: { simples: 20, cobertura: 28 },
            medio: { simples: 30, cobertura: 40 },
            grande: { simples: 40, cobertura: 55 },
        },
    },
    'bolo-coco': {
        name: 'Bolo de Coco',
        price: 20,
        category: 'house',
        image: 'assets/bolo-coco-premium.webp',
        description: 'Bolo caseiro de coco com massa delicada e sabor tropical, disponível simples ou com uma cobertura cremosa.',
        ingredients: ['Coco', 'Leite de coco', 'Farinha de trigo', 'Ovos'],
        pricing: {
            pequeno: { simples: 20, cobertura: 28 },
            medio: { simples: 30, cobertura: 40 },
            grande: { simples: 40, cobertura: 55 },
        },
    },
    'pote-chocolate': {
        name: 'Bolo de Pote de Chocolate 50%',
        price: 10,
        category: 'sweets',
        image: 'assets/bolo de pote chocolate.png',
        description: 'Camadas de massa de chocolate e creme intenso de chocolate 50%, montadas para uma experiência equilibrada e cremosa.',
        ingredients: ['Massa de chocolate', 'Chocolate 50%', 'Leite condensado', 'Creme de leite'],
    },
    'pote-laranja-chocolate': {
        name: 'Bolo de Pote de Laranja com Chocolate',
        price: 10,
        category: 'sweets',
        image: 'imagens mms/bolo de pote laranja.png',
        description: 'A combinação cítrica da laranja com creme de chocolate em camadas delicadas e frescas.',
        ingredients: ['Massa de laranja', 'Chocolate', 'Creme de leite', 'Raspas de laranja'],
    },
    'naked-cake': {
        name: 'Naked Cake',
        price: 75,
        category: 'sweets',
        image: 'imagens mms/naked prestigio.png',
        description: 'Massa leve, recheio cremoso e acabamento aparente com frutas frescas, ideal para celebrações intimistas.',
        ingredients: ['Massa branca', 'Creme de leite', 'Morangos', 'Leite condensado'],
    },
    'naked-red': {
        name: 'Naked Cake Massa Vermelha',
        price: 75,
        category: 'sweets',
        image: 'imagens mms/naked massa vermelha.png',
        description: 'Massa vermelha aveludada, creme suave e frutas frescas em uma composição elegante e marcante.',
        ingredients: ['Massa Red Velvet', 'Creme suave', 'Frutas vermelhas', 'Baunilha'],
    },
    'brownie-premium': {
        name: 'Brownie Belga',
        price: 12,
        category: 'sweets',
        image: 'assets/doce-brownie-belga-premium.webp',
        description: 'Brownie denso e úmido, preparado com chocolate belga e finalizado com uma casquinha delicada.',
        ingredients: ['Chocolate belga', 'Cacau', 'Manteiga', 'Ovos'],
    },
    'brigadeiro-gourmet': {
        name: 'Caixa de Brigadeiros Gourmet',
        price: 24,
        category: 'sweets',
        image: 'assets/doce-brigadeiros-gourmet-premium.webp',
        description: 'Seleção com seis brigadeiros artesanais, enrolados à mão e finalizados com confeitos premium.',
        ingredients: ['Chocolate', 'Leite condensado', 'Manteiga', 'Confeitos'],
    },
};

const scriptBaseUrl = document.currentScript?.src
    ? new URL('.', document.currentScript.src).href
    : document.baseURI;

function resolveAssetUrl(path) {
    if (!path) {
        return '';
    }

    try {
        return new URL(path, scriptBaseUrl).href;
    } catch {
        return path;
    }
}
const CART_STORAGE_KEY = 'mms-confeitaria-cart';
const CART_NOTES_STORAGE_KEY = 'mms-confeitaria-cart-notes';
const CART_OPTIONS_STORAGE_KEY = 'mms-confeitaria-cart-options';
const currency = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

let cart = loadCart();
let cartNotes = loadCartNotes();
let cartOptions = loadCartOptions();
let activeDialog = null;
let dialogTrigger = null;
let activeCatalogTrigger = null;
let feedbackTimer = null;
let detailProductId = null;
let detailQuantity = 1;
let detailOptions = null;
let lightboxParentDialog = null;

const CATALOG_PRESENTATION = {
    highlights: {
        eyebrow: 'VITRINE MMS',
        title: 'Todos os nossos destaques',
    },
    house: {
        eyebrow: 'FEITOS COMO EM CASA',
        title: 'Todos os bolos caseiros',
    },
    sweets: {
        eyebrow: 'PEQUENOS ENCANTOS',
        title: 'Todos os doces',
    },
};

function getCatalogPriceLabel(product) {
    return product.pricing
        ? `A partir de ${currency.format(product.price)}`
        : currency.format(product.price);
}

function getResponsiveVariantUrl(source, width) {
    const url = new URL(source, scriptBaseUrl);
    url.pathname = url.pathname.replace(/\.webp$/i, `-${width}.webp`);
    return url.href;
}

function enhanceImages(container = document) {
    container.querySelectorAll('img').forEach((image) => {
        const source = image.getAttribute('src') || '';

        image.decoding = 'async';

        if (!image.hasAttribute('width') || !image.hasAttribute('height')) {
            if (image.closest('.nav-logo, .footer-logo') || image.classList.contains('footer-logo')) {
                image.width = 187;
                image.height = 187;
            } else if (image.closest('.story-media-table')) {
                image.width = 1280;
                image.height = 980;
            } else if (image.closest('.product-img, .catalog-card-image, .story-media, .product-detail-image')) {
                image.width = 960;
                image.height = 720;
            }
        }

        if (/\.webp(?:\?|$)/i.test(source) && !/-(?:640|960)\.webp/i.test(source)) {
            const absoluteSource = resolveAssetUrl(source);
            image.srcset = `${getResponsiveVariantUrl(absoluteSource, 640)} 640w, ${getResponsiveVariantUrl(absoluteSource, 960)} 960w`;
            image.sizes = image.closest('.story-media')
                ? '(max-width: 767px) calc(100vw - 3rem), 50vw'
                : '(max-width: 599px) calc(100vw - 3rem), (max-width: 1023px) 50vw, 25vw';
        }

        if (image.dataset.fallbackBound === 'true') {
            return;
        }

        image.dataset.fallbackBound = 'true';
        image.addEventListener('error', () => {
            const wrapper = image.parentElement;
            wrapper?.classList.add('image-load-error');
            wrapper?.setAttribute('data-image-label', image.alt || 'Imagem indisponível');
        });
    });
}

function syncProductCards(container = document) {
    container.querySelectorAll('[data-product-id]').forEach((card) => {
        const product = PRODUCTS[card.dataset.productId];

        if (!product) {
            return;
        }

        const image = card.querySelector('.product-img img, .catalog-card-image img');
        const title = card.querySelector('.product-info h3, .catalog-card-info h3');
        const price = card.querySelector('.product-price, .catalog-card-info span');

        if (image) {
            image.src = resolveAssetUrl(product.image);
            image.alt = product.name;
        }

        if (title) {
            title.textContent = product.name;
        }

        if (price) {
            price.textContent = getCatalogPriceLabel(product);
        }

        card.dataset.productName = product.name;
        card.dataset.productPrice = product.price.toFixed(2);
    });

    enhanceImages(container);
}

function renderCatalog(category) {
    const presentation = CATALOG_PRESENTATION[category];

    if (!presentation || !catalogGrid) {
        return false;
    }

    const products = Object.entries(PRODUCTS)
        .filter(([, product]) => product.category === category);

    catalogEyebrow.textContent = presentation.eyebrow;
    catalogTitle.textContent = presentation.title;
    catalogGrid.innerHTML = products.map(([productId, product]) => `
        <article
            class="catalog-card"
            data-product-id="${productId}"
            aria-label="Ver detalhes de ${product.name}"
        >
            <div class="catalog-card-image">
                <img src="${resolveAssetUrl(product.image)}" alt="${product.name}" loading="lazy" decoding="async" role="button" tabindex="0" aria-label="Ampliar foto: ${product.name}">
                <button class="btn-add" type="button" aria-label="Escolher ${product.name}">
                    <i class="fa-solid fa-plus" aria-hidden="true"></i>
                </button>
            </div>
            <div class="catalog-card-info">
                <h3>${product.name}</h3>
                <span>${getCatalogPriceLabel(product)}</span>
            </div>
        </article>
    `).join('');

    catalogGrid.querySelectorAll('.catalog-card').forEach((card) => {
        card.addEventListener('keydown', (event) => {
            if (event.target !== card || !['Enter', ' '].includes(event.key)) {
                return;
            }

            event.preventDefault();
            openProductDetail(card.dataset.productId, card);
        });
    });

    syncProductCards(catalogGrid);
    updateCardSelectionControls();
    return true;
}

function openCatalog(category, trigger) {
    if (!renderCatalog(category)) {
        return;
    }

    activeCatalogTrigger = trigger;
    openDialog(productsModal, trigger);
}
let lightboxTrigger = null;
let pickupAtStore = false;
let lightboxScale = 1;
let lightboxTranslateX = 0;
let lightboxTranslateY = 0;
let lightboxStartDistance = 0;
let lightboxStartScale = 1;
let lightboxPanStart = null;
const lightboxPointers = new Map();

function loadCart() {
    try {
        const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '{}');

        return Object.fromEntries(
            Object.entries(savedCart)
                .filter(([id, quantity]) => PRODUCTS[id] && Number.isInteger(quantity) && quantity > 0)
                .map(([id, quantity]) => [id, Math.min(quantity, 99)]),
        );
    } catch {
        return {};
    }
}

function loadCartNotes() {
    try {
        const savedNotes = JSON.parse(localStorage.getItem(CART_NOTES_STORAGE_KEY) || '{}');

        return Object.fromEntries(
            Object.entries(savedNotes)
                .filter(([id, notes]) => PRODUCTS[id] && typeof notes === 'string' && notes.trim())
                .map(([id, notes]) => [id, notes.trim().slice(0, 240)]),
        );
    } catch {
        return {};
    }
}

function loadCartOptions() {
    try {
        const savedOptions = JSON.parse(localStorage.getItem(CART_OPTIONS_STORAGE_KEY) || '{}');

        return Object.fromEntries(
            Object.entries(savedOptions).filter(([id, options]) => (
                PRODUCTS[id]
                && options
                && typeof options === 'object'
            )),
        );
    } catch {
        return {};
    }
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    localStorage.setItem(CART_NOTES_STORAGE_KEY, JSON.stringify(cartNotes));
    localStorage.setItem(CART_OPTIONS_STORAGE_KEY, JSON.stringify(cartOptions));
}

function getCartQuantity() {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
}

function getShippingFee(quantity) {
    return 0;
}

function getProductUnitPrice(productId, options = cartOptions[productId]) {
    const product = PRODUCTS[productId];

    if (!product) {
        return 0;
    }

    if (!product.pricing) {
        return product.price;
    }

    const size = options?.size || 'pequeno';
    const finish = options?.finish || 'simples';
    return product.pricing[size]?.[finish] ?? product.price;
}

function getOptionsLabel(productId, options = cartOptions[productId]) {
    if (!PRODUCTS[productId]?.pricing || !options) {
        return '';
    }

    const sizeLabels = { pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande' };
    const finishLabels = { simples: 'Simples', cobertura: 'Com cobertura' };
    return `${sizeLabels[options.size] || 'Pequeno'} · ${finishLabels[options.finish] || 'Simples'}`;
}

function formatDate(dateValue) {
    if (!dateValue) {
        return '';
    }

    const [datePart, timePart] = dateValue.split('T');
    const [year, month, day] = datePart.split('-');

    if (!year || !month || !day) {
        return dateValue;
    }

    return timePart ? `${day}/${month}/${year} às ${timePart.slice(0, 5)}` : `${day}/${month}/${year}`;
}

function getOrderDetails() {
    const date = orderDate?.value || '';
    const time = orderTime?.value || '';

    return {
        date: date && time ? `${date}T${time}` : '',
        address: pickupAtStore ? 'Retirada no local' : (orderAddress?.value.trim() || ''),
        payment: orderPayment?.value || '',
    };
}

function toDateInputValue(date) {
    const pad = (value) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function alignToAvailableDeliverySlot(date) {
    const aligned = new Date(date);
    aligned.setSeconds(0, 0);
    aligned.setMinutes(Math.ceil(aligned.getMinutes() / 30) * 30);

    if (aligned.getHours() < 9) {
        aligned.setHours(9, 0, 0, 0);
    }

    if (aligned.getHours() > 21 || (aligned.getHours() === 21 && aligned.getMinutes() > 0)) {
        aligned.setDate(aligned.getDate() + 1);
        aligned.setHours(9, 0, 0, 0);
    }

    return aligned;
}

function getMinimumDeliveryDate(items) {
    const leadTimeHours = items.reduce(
        (maximum, { product }) => Math.max(maximum, product.leadTimeHours ?? 5),
        0,
    );
    const minimum = new Date();
    minimum.setHours(minimum.getHours() + leadTimeHours);
    return alignToAvailableDeliverySlot(minimum);
}

function updateDeliveryConstraints(items) {
    if (!orderDate || !orderTime) {
        return true;
    }

    const minimum = getMinimumDeliveryDate(items);
    const minimumDate = toDateInputValue(minimum);
    orderDate.min = minimumDate;

    [...orderTime.options].forEach((option) => {
        if (!option.value || !orderDate.value) {
            option.disabled = false;
            return;
        }

        option.disabled = new Date(`${orderDate.value}T${option.value}`) < minimum;
    });

    if (orderTime.selectedOptions[0]?.disabled) {
        orderTime.value = '';
    }

    const chosenDate = orderDate.value && orderTime.value
        ? new Date(`${orderDate.value}T${orderTime.value}`)
        : null;
    const dateIsValid = !orderDate.value || orderDate.value >= minimumDate;
    const timeIsValid = !chosenDate || chosenDate >= minimum;
    const isValid = dateIsValid && timeIsValid;
    const errorMessage = 'Escolha uma data e um horário disponíveis para os produtos do carrinho.';

    orderDate.setCustomValidity(dateIsValid ? '' : errorMessage);
    orderTime.setCustomValidity(timeIsValid ? '' : errorMessage);
    return isValid;
}

function hasCompleteOrderDetails(items) {
    if (items.length === 0) {
        return false;
    }

    const details = getOrderDetails();
    return Boolean(
        details.date
        && details.payment
        && (pickupAtStore || details.address)
        && updateDeliveryConstraints(items)
    );
}

function updateCardSelectionControls() {
    document.querySelectorAll('.product-card, .catalog-card').forEach((card) => {
        const productId = card.dataset.productId;
        let removeButton = card.querySelector('.btn-card-remove');

        if (!removeButton) {
            removeButton = document.createElement('button');
            removeButton.className = 'btn-card-remove';
            removeButton.type = 'button';
            removeButton.dataset.cardRemove = productId;
            removeButton.innerHTML = '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
            card.querySelector('.product-img, .catalog-card-image')?.append(removeButton);
        }

        const isSelected = Boolean(cart[productId]);
        removeButton.classList.toggle('is-visible', isSelected);
        removeButton.setAttribute('aria-label', `Remover ${PRODUCTS[productId]?.name || 'produto'} do carrinho`);
    });
}

function setMenuState(isOpen, restoreFocus = false) {
    if (!menuButton || !navbar || !mobileMenu) {
        return;
    }

    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    navbar.classList.toggle('menu-open', isOpen);
    document.body.classList.toggle('menu-open', isOpen && window.innerWidth < 1024);

    if (isOpen) {
        requestAnimationFrame(() => mobileMenu.querySelector('a')?.focus());
    } else if (restoreFocus) {
        menuButton.focus();
    }
}

function getFocusableElements(container) {
    return [...container.querySelectorAll(
        'button:not([disabled]), a[href]:not([aria-disabled="true"]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => !element.hasAttribute('hidden'));
}

function openDialog(dialog, trigger) {
    if (!dialog) {
        return;
    }

    if (activeDialog && activeDialog !== dialog) {
        closeDialog(activeDialog, false);
    }

    setMenuState(false);
    activeDialog = dialog;
    dialogTrigger = trigger || document.activeElement;
    dialog.classList.add('is-open');
    dialog.setAttribute('aria-hidden', 'false');
    document.body.classList.add('dialog-open');

    if (dialog === cartPanel) {
        cartTrigger?.setAttribute('aria-expanded', 'true');
    }

    if (dialog === productsModal) {
        catalogTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', String(trigger === dialogTrigger)));
    }

    requestAnimationFrame(() => {
        getFocusableElements(dialog)[0]?.focus();
    });
}

function closeDialog(dialog = activeDialog, restoreFocus = true) {
    if (!dialog) {
        return;
    }

    dialog.classList.remove('is-open');
    dialog.setAttribute('aria-hidden', 'true');

    if (dialog === cartPanel) {
        cartTrigger?.setAttribute('aria-expanded', 'false');
    }

    if (dialog === productsModal) {
        catalogTriggers.forEach((trigger) => trigger.setAttribute('aria-expanded', 'false'));
    }

    if (activeDialog === dialog) {
        activeDialog = null;
        document.body.classList.remove('dialog-open');

        if (restoreFocus && dialogTrigger instanceof HTMLElement) {
            dialogTrigger.focus();
        }

        dialogTrigger = null;
    }
}

function setDetailQuantity(quantity) {
    detailQuantity = Math.max(1, Math.min(99, quantity));

    if (detailQuantityValue) {
        detailQuantityValue.textContent = String(detailQuantity);
    }
}

function getSelectedDetailOptions() {
    if (!PRODUCTS[detailProductId]?.pricing) {
        return null;
    }

    return {
        size: cakeSizeInputs.find((input) => input.checked)?.value || 'pequeno',
        finish: cakeFinishInputs.find((input) => input.checked)?.value || 'simples',
    };
}

function updateDetailVariantPrice() {
    detailOptions = getSelectedDetailOptions();

    if (productDetailPrice && detailProductId) {
        productDetailPrice.textContent = currency.format(getProductUnitPrice(detailProductId, detailOptions));
    }
}

function openProductDetail(productId, trigger) {
    const product = PRODUCTS[productId];

    if (!product || !productDetailModal) {
        return;
    }

    detailProductId = productId;
    setDetailQuantity(1);
    detailOptions = product.pricing
        ? { ...(cartOptions[productId] || { size: 'pequeno', finish: 'simples' }) }
        : null;

    if (productDetailImage) {
        productDetailImage.src = resolveAssetUrl(product.image);
        productDetailImage.alt = `Bolo ${product.name}`;
    }

    if (productDetailImageButton) {
        productDetailImageButton.setAttribute('aria-label', `Ampliar foto de ${product.name}`);
    }

    if (productDetailTitle) {
        productDetailTitle.textContent = product.name;
    }

    if (productDetailPrice) {
        productDetailPrice.textContent = currency.format(getProductUnitPrice(productId, detailOptions));
    }

    if (productDetailDescription) {
        productDetailDescription.textContent = product.description;
    }

    if (productDetailIngredients) {
        productDetailIngredients.innerHTML = product.ingredients
            .map((ingredient) => `<li>${ingredient}</li>`)
            .join('');
    }

    if (productVariants) {
        productVariants.hidden = !product.pricing;
    }

    if (product.pricing) {
        cakeSizeInputs.forEach((input) => {
            input.checked = input.value === detailOptions.size;
        });
        cakeFinishInputs.forEach((input) => {
            input.checked = input.value === detailOptions.finish;
        });
    }

    if (productNotes) {
        productNotes.value = cartNotes[productId] || '';
        productNotesCount.textContent = String(productNotes.value.length);
    }

    const focusReturnTarget = trigger?.closest?.('#products-modal') ? activeCatalogTrigger : trigger;
    openDialog(productDetailModal, focusReturnTarget);
}

function openLightbox(source = '', alt = '', trigger = null) {
    const product = PRODUCTS[detailProductId];
    const imageSource = source || product?.image;
    const imageAlt = alt || (product ? `Foto ampliada do bolo ${product.name}` : 'Foto ampliada');

    if (!imageSource || !imageLightbox || !lightboxImage) {
        return;
    }

    lightboxTrigger = trigger instanceof HTMLElement ? trigger : document.activeElement;
    lightboxParentDialog = activeDialog;

    if (lightboxParentDialog) {
        lightboxParentDialog.inert = true;
        lightboxParentDialog.setAttribute('aria-hidden', 'true');
    }

    lightboxImage.src = resolveAssetUrl(imageSource);
    lightboxImage.alt = imageAlt;
    resetLightboxTransform();
    imageLightbox.classList.add('is-open');
    imageLightbox.setAttribute('aria-hidden', 'false');
    imageLightbox.querySelector('.lightbox-content')?.focus();
}

function openImageElementInLightbox(image) {
    if (!(image instanceof HTMLImageElement)) {
        return;
    }

    const productImage = image === productDetailImage && detailProductId
        ? PRODUCTS[detailProductId]?.image
        : '';

    openLightbox(productImage || image.currentSrc || image.src, image.alt || 'Foto ampliada', image);
}

function closeLightbox(restoreFocus = true) {
    if (!imageLightbox) {
        return;
    }

    imageLightbox.classList.remove('is-open');
    imageLightbox.setAttribute('aria-hidden', 'true');
    lightboxPointers.clear();
    resetLightboxTransform();

    if (lightboxParentDialog) {
        lightboxParentDialog.inert = false;
        lightboxParentDialog.setAttribute('aria-hidden', 'false');
        lightboxParentDialog = null;
    }

    if (restoreFocus && lightboxTrigger instanceof HTMLElement) {
        lightboxTrigger.focus();
    }

    lightboxTrigger = null;
}

function applyLightboxTransform() {
    if (!lightboxImage) {
        return;
    }

    lightboxImage.style.transform = `translate3d(${lightboxTranslateX}px, ${lightboxTranslateY}px, 0) scale(${lightboxScale})`;
}

function resetLightboxTransform() {
    lightboxScale = 1;
    lightboxTranslateX = 0;
    lightboxTranslateY = 0;
    lightboxStartDistance = 0;
    lightboxStartScale = 1;
    lightboxPanStart = null;
    lightboxImage?.classList.remove('is-dragging');
    applyLightboxTransform();
}

function setLightboxScale(nextScale) {
    lightboxScale = Math.max(1, Math.min(5, nextScale));

    if (lightboxScale === 1) {
        lightboxTranslateX = 0;
        lightboxTranslateY = 0;
    }

    applyLightboxTransform();
}

function getPointerDistance() {
    const points = [...lightboxPointers.values()];

    if (points.length < 2) {
        return 0;
    }

    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function showFeedback(message) {
    if (!cartFeedback) {
        return;
    }

    window.clearTimeout(feedbackTimer);
    cartFeedback.textContent = message;
    cartFeedback.classList.add('is-visible');
    feedbackTimer = window.setTimeout(() => {
        cartFeedback.classList.remove('is-visible');
    }, 1700);
}

function updateCheckoutLink(items, subtotal, shipping, total) {
    if (!cartCheckout) {
        return;
    }

    if (items.length === 0) {
        cartCheckout.setAttribute('aria-disabled', 'true');
        cartCheckout.dataset.ready = 'false';
        cartCheckout.href = 'https://wa.me/5581981908099';
        return;
    }

    const order = getOrderDetails();
    const isComplete = hasCompleteOrderDetails(items);
    cartCheckout.removeAttribute('aria-disabled');
    cartCheckout.dataset.ready = String(isComplete);

    if (!isComplete) {
        cartCheckout.setAttribute('aria-disabled', 'true');
        cartCheckout.removeAttribute('href');
        return;
    }

    const itemLines = items.map(({ id, product, quantity, optionsLabel }) => {
        const notes = cartNotes[id];
        const variant = optionsLabel ? ` | OPÇÃO: ${optionsLabel}` : '';
        const itemLine = `ITEM: ${product.name}${variant} | QUANTIDADE: ${quantity}`;

        return notes ? `${itemLine}\nOBSERVAÇÕES: ${notes}` : itemLine;
    });
    const message = [
        'Olá! Gostaria de finalizar este pedido:',
        '',
        ...itemLines,
        '',
        `PARA ENTREGAR: ${formatDate(order.date)}`,
        `ENDEREÇO: ${order.address}`,
        `FRETE: ${pickupAtStore ? 'R$ 0,00 — retirada no local' : 'A confirmar no atendimento'}`,
        `FORMA DE PAGAMENTO: ${order.payment}`,
        `SUBTOTAL: ${currency.format(subtotal)}`,
        `TOTAL: ${currency.format(total)}`,
    ].join('\n');

    cartCheckout.href = `https://wa.me/5581981908099?text=${encodeURIComponent(message)}`;
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    })[character]);
}

function renderCart() {
    const entries = Object.entries(cart)
        .filter(([id, quantity]) => PRODUCTS[id] && quantity > 0)
        .map(([id, quantity]) => ({
            id,
            quantity,
            product: PRODUCTS[id],
            unitPrice: getProductUnitPrice(id),
            optionsLabel: getOptionsLabel(id),
        }));
    const quantity = entries.reduce((total, item) => total + item.quantity, 0);
    const subtotal = entries.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
    const shipping = getShippingFee(quantity);
    const total = subtotal + shipping;
    updateDeliveryConstraints(entries);

    if (cartCount) {
        cartCount.textContent = quantity > 99 ? '99+' : String(quantity);
        cartCount.classList.toggle('has-items', quantity > 0);
    }

    if (cartTrigger) {
        cartTrigger.setAttribute(
            'aria-label',
            quantity === 0 ? 'Abrir carrinho, vazio' : `Abrir carrinho, ${quantity} ${quantity === 1 ? 'item' : 'itens'}`,
        );
    }

    if (cartEmpty) {
        cartEmpty.hidden = entries.length > 0;
    }

    if (cartItems) {
        cartItems.innerHTML = entries.map(({ id, quantity: itemQuantity, product, unitPrice, optionsLabel }) => `
            <article class="cart-item" data-cart-id="${id}">
                <img src="${resolveAssetUrl(product.image)}" alt="">
                <div class="cart-item-main">
                    <div class="cart-item-top">
                        <h3>${product.name}</h3>
                        <button class="cart-remove" type="button" data-cart-action="remove" aria-label="Remover ${product.name}">
                            <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="cart-item-price">${currency.format(unitPrice)} cada</div>
                    ${optionsLabel ? `<p class="cart-item-options">${escapeHTML(optionsLabel)}</p>` : ''}
                    ${cartNotes[id] ? `<p class="cart-item-notes"><strong>Observações:</strong> ${escapeHTML(cartNotes[id])}</p>` : ''}
                    <div class="cart-item-bottom">
                        <div class="quantity-control" aria-label="Quantidade de ${product.name}">
                            <button type="button" data-cart-action="decrease" aria-label="Diminuir quantidade de ${product.name}">−</button>
                            <span>${itemQuantity}</span>
                            <button type="button" data-cart-action="increase" aria-label="Aumentar quantidade de ${product.name}">+</button>
                        </div>
                        <strong class="cart-item-total">${currency.format(unitPrice * itemQuantity)}</strong>
                    </div>
                </div>
            </article>
        `).join('');
    }

    if (cartSubtotal) {
        cartSubtotal.textContent = currency.format(subtotal);
    }

    if (cartShipping) {
        cartShipping.textContent = pickupAtStore ? currency.format(0) : 'A confirmar';
    }

    if (shippingLabel) {
        shippingLabel.textContent = pickupAtStore ? 'Retirada no local' : 'Taxa de entrega';
    }

    if (shippingNote) {
        shippingNote.textContent = pickupAtStore
            ? 'A MMS confirmará pelo WhatsApp o endereço e o horário disponíveis para retirada.'
            : 'O valor será confirmado pela MMS conforme o endereço e a disponibilidade de entrega.';
    }

    if (cartTotal) {
        cartTotal.textContent = currency.format(total);
    }

    updateCheckoutLink(entries, subtotal, shipping, total);
    updateCardSelectionControls();
}

function addProduct(productId, button, quantity = 1, notes = null, options = null) {
    const product = PRODUCTS[productId];

    if (!product) {
        return;
    }

    const safeQuantity = Math.max(1, Math.min(99, Number(quantity) || 1));
    cart[productId] = Math.min((cart[productId] || 0) + safeQuantity, 99);

    if (product.pricing) {
        cartOptions[productId] = {
            size: options?.size || 'pequeno',
            finish: options?.finish || 'simples',
        };
    }

    if (typeof notes === 'string') {
        const cleanNotes = notes.trim().slice(0, 240);

        if (cleanNotes) {
            cartNotes[productId] = cleanNotes;
        } else {
            delete cartNotes[productId];
        }
    }

    saveCart();
    renderCart();
    showFeedback(`${safeQuantity}x ${product.name} adicionado ao carrinho`);

    if (button) {
        const icon = button.querySelector('i');
        button.classList.add('is-added');

        if (icon) {
            icon.className = 'fa-solid fa-check';
        }

        window.setTimeout(() => {
            button.classList.remove('is-added');

            if (icon) {
                icon.className = 'fa-solid fa-plus';
            }
        }, 700);
    }
}

menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
});

mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
});

cartTrigger?.addEventListener('click', () => openDialog(cartPanel, cartTrigger));
catalogTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openCatalog(trigger.dataset.openCatalog, trigger));
});
detailDecrease?.addEventListener('click', () => setDetailQuantity(detailQuantity - 1));
detailIncrease?.addEventListener('click', () => setDetailQuantity(detailQuantity + 1));
[...cakeSizeInputs, ...cakeFinishInputs].forEach((input) => {
    input.addEventListener('change', updateDetailVariantPrice);
});

productNotes?.addEventListener('input', () => {
    if (productNotesCount) {
        productNotesCount.textContent = String(productNotes.value.length);
    }
});

productDetailAdd?.addEventListener('click', () => {
    if (!detailProductId) {
        return;
    }

    addProduct(detailProductId, productDetailAdd, detailQuantity, productNotes?.value || '', detailOptions);
    closeDialog(productDetailModal);
});

productDetailImageButton?.addEventListener('click', () => openImageElementInLightbox(productDetailImage));

document.querySelectorAll('.lightbox-backdrop').forEach((button) => {
    button.addEventListener('click', () => closeLightbox());
});

document.querySelectorAll('.lightbox-close').forEach((button) => {
    button.addEventListener('click', () => closeLightbox());
});

lightboxImage?.addEventListener('wheel', (event) => {
    event.preventDefault();
    setLightboxScale(lightboxScale * (event.deltaY < 0 ? 1.14 : .88));
}, { passive: false });

lightboxImage?.addEventListener('dblclick', (event) => {
    event.preventDefault();
    setLightboxScale(lightboxScale > 1 ? 1 : 2.5);
});

lightboxImage?.addEventListener('pointerdown', (event) => {
    lightboxImage.setPointerCapture(event.pointerId);
    lightboxPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    lightboxImage.classList.add('is-dragging');

    if (lightboxPointers.size === 2) {
        lightboxStartDistance = getPointerDistance();
        lightboxStartScale = lightboxScale;
        lightboxPanStart = null;
    } else if (lightboxScale > 1) {
        lightboxPanStart = {
            x: event.clientX,
            y: event.clientY,
            translateX: lightboxTranslateX,
            translateY: lightboxTranslateY,
        };
    }
});

lightboxImage?.addEventListener('pointermove', (event) => {
    if (!lightboxPointers.has(event.pointerId)) {
        return;
    }

    lightboxPointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (lightboxPointers.size >= 2 && lightboxStartDistance > 0) {
        setLightboxScale(lightboxStartScale * (getPointerDistance() / lightboxStartDistance));
        return;
    }

    if (lightboxScale > 1 && lightboxPanStart) {
        lightboxTranslateX = lightboxPanStart.translateX + (event.clientX - lightboxPanStart.x);
        lightboxTranslateY = lightboxPanStart.translateY + (event.clientY - lightboxPanStart.y);
        applyLightboxTransform();
    }
});

function releaseLightboxPointer(event) {
    lightboxPointers.delete(event.pointerId);

    if (lightboxPointers.size < 2) {
        lightboxStartDistance = 0;
        lightboxStartScale = lightboxScale;
    }

    if (lightboxPointers.size === 1 && lightboxScale > 1) {
        const remainingPoint = [...lightboxPointers.values()][0];
        lightboxPanStart = {
            x: remainingPoint.x,
            y: remainingPoint.y,
            translateX: lightboxTranslateX,
            translateY: lightboxTranslateY,
        };
    } else {
        lightboxPanStart = null;
    }

    if (lightboxPointers.size === 0) {
        lightboxImage?.classList.remove('is-dragging');
    }
}

lightboxImage?.addEventListener('pointerup', releaseLightboxPointer);
lightboxImage?.addEventListener('pointercancel', releaseLightboxPointer);

document.querySelectorAll('[data-close-dialog]').forEach((button) => {
    button.addEventListener('click', () => {
        closeDialog(document.querySelector(`#${button.dataset.closeDialog}`));
    });
});

document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const cardRemoveButton = event.target.closest('[data-card-remove]');

    if (cardRemoveButton) {
        const productId = cardRemoveButton.dataset.cardRemove;

        if (PRODUCTS[productId]) {
            delete cart[productId];
            delete cartNotes[productId];
            delete cartOptions[productId];
            saveCart();
            renderCart();
            showFeedback(`${PRODUCTS[productId].name} removido do carrinho`);
        }

        return;
    }

    const addButton = event.target.closest('.btn-add');

    if (addButton) {
        const card = addButton.closest('[data-product-id]');
        openProductDetail(card?.dataset.productId, addButton);
        requestAnimationFrame(() => detailIncrease?.focus());
        return;
    }

    const zoomableImage = event.target.closest(zoomableImageSelector);

    if (zoomableImage) {
        openImageElementInLightbox(zoomableImage);
        return;
    }

    const productCard = event.target.closest('.product-card, .catalog-card');

    if (productCard && !event.target.closest('button, a')) {
        openProductDetail(productCard.dataset.productId, productCard);
        return;
    }

    if (navbar?.classList.contains('menu-open') && !navbar.contains(event.target)) {
        setMenuState(false);
    }
});

cartItems?.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) {
        return;
    }

    const actionButton = event.target.closest('[data-cart-action]');
    const item = event.target.closest('[data-cart-id]');

    if (!actionButton || !item) {
        return;
    }

    const productId = item.dataset.cartId;
    const action = actionButton.dataset.cartAction;

    if (!PRODUCTS[productId] || !cart[productId]) {
        return;
    }

    if (action === 'increase') {
        cart[productId] = Math.min(cart[productId] + 1, 99);
    }

    if (action === 'decrease') {
        cart[productId] -= 1;
    }

    if (action === 'remove' || cart[productId] <= 0) {
        delete cart[productId];
        delete cartNotes[productId];
        delete cartOptions[productId];
    }

    saveCart();
    renderCart();
});

function updatePickupState() {
    pickupAtStore = Boolean(pickupLocal?.checked);

    if (orderAddress) {
        orderAddress.disabled = pickupAtStore;
        orderAddress.required = !pickupAtStore;
    }

    orderAddressField?.classList.toggle('is-disabled', pickupAtStore);
    renderCart();
}

pickupLocal?.addEventListener('change', updatePickupState);
[orderDate, orderTime, orderAddress, orderPayment].forEach((field) => {
    field?.addEventListener('input', renderCart);
    field?.addEventListener('change', renderCart);
});

cartCheckout?.addEventListener('click', (event) => {
    if (cartCheckout.getAttribute('aria-disabled') === 'true') {
        event.preventDefault();
        return;
    }

    if (cartCheckout.dataset.ready !== 'true') {
        event.preventDefault();
        const missingField = !orderDate?.value
            ? orderDate
            : (!orderTime?.value
                ? orderTime
                : (!pickupAtStore && !orderAddress?.value.trim() ? orderAddress : orderPayment));
        missingField?.focus();
        showFeedback('Preencha os dados de entrega e pagamento para finalizar');
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (imageLightbox?.classList.contains('is-open')) {
            closeLightbox();
            return;
        }

        if (activeDialog) {
            closeDialog(activeDialog);
            return;
        }

        if (navbar?.classList.contains('menu-open')) {
            setMenuState(false, true);
        }
    }

    if (event.key === 'Tab' && (imageLightbox?.classList.contains('is-open') || activeDialog || navbar?.classList.contains('menu-open'))) {
        const focusContainer = imageLightbox?.classList.contains('is-open')
            ? imageLightbox
            : (activeDialog || mobileMenu);
        const focusable = getFocusableElements(focusContainer);

        if (focusable.length === 0) {
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && navbar?.classList.contains('menu-open')) {
        setMenuState(false);
    }
});

document.querySelectorAll('.product-card, .catalog-card').forEach((card) => {
    const product = PRODUCTS[card.dataset.productId];

    if (!product) {
        return;
    }

    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', product.name);
});

document.querySelectorAll(zoomableImageSelector).forEach((image) => {
    image.loading = image.loading || 'lazy';
    image.decoding = 'async';
    image.setAttribute('role', 'button');
    image.setAttribute('tabindex', '0');
    image.setAttribute('aria-label', `Ampliar foto: ${image.alt || 'imagem'}`);
});

document.addEventListener('keydown', (event) => {
    if (!['Enter', ' '].includes(event.key) || !(event.target instanceof HTMLImageElement)) {
        return;
    }

    if (!event.target.matches(zoomableImageSelector)) {
        return;
    }

    event.preventDefault();
    openImageElementInLightbox(event.target);
});
document.querySelectorAll('.btn-fav').forEach((button) => {
    button.setAttribute('aria-pressed', 'false');

    button.addEventListener('click', () => {
        const isFavorite = button.getAttribute('aria-pressed') === 'true';
        const icon = button.querySelector('i');
        const nextState = !isFavorite;

        button.setAttribute('aria-pressed', String(nextState));

        if (icon) {
            icon.className = nextState ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        }
    });
});

syncProductCards();

/* Aprimoramentos progressivos dos contatos compartilhados entre as páginas. */
document.querySelectorAll('.social-links a[href="#"]').forEach((link) => {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    link.setAttribute('title', 'Instagram oficial em atualização');
});

document.querySelectorAll('.contact-list li').forEach((item) => {
    const text = item.querySelector('span');

    if (!text) {
        return;
    }

    const value = text.textContent.trim();
    let href = '';

    if (value.includes('(81) 98190-8099')) {
        href = 'tel:+5581981908099';
    } else if (value.includes('@')) {
        href = `mailto:${value}`;
    }

    if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = value;
        text.replaceWith(link);
    }
});

let scrollUpdateScheduled = false;

function updateScrollInterface() {
    const root = document.documentElement;
    const scrollTop = window.scrollY || root.scrollTop;
    const scrollableHeight = Math.max(0, root.scrollHeight - root.clientHeight);
    const progress = scrollableHeight > 0
        ? Math.min(100, Math.max(0, Math.round((scrollTop / scrollableHeight) * 100)))
        : 0;

    navbar?.classList.toggle('is-scrolled', scrollTop > 24);

    if (scrollProgress) {
        const isVisible = scrollTop > 200;
        scrollProgress.classList.toggle('is-visible', isVisible);
        scrollProgress.setAttribute('aria-hidden', String(!isVisible));
    }

    if (scrollProgressRing) {
        scrollProgressRing.style.setProperty('--scroll-progress', `${progress * 3.6}deg`);
        scrollProgressRing.setAttribute('aria-label', `Progresso da página: ${progress}%`);
    }

    if (scrollProgressValue) {
        scrollProgressValue.textContent = `${progress}%`;
    }

    scrollUpdateScheduled = false;
}

window.addEventListener('scroll', () => {
    if (!scrollUpdateScheduled) {
        scrollUpdateScheduled = true;
        window.requestAnimationFrame(updateScrollInterface);
    }
}, { passive: true });

scrollToTop?.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

const revealItems = [...document.querySelectorAll('[data-reveal]')];

if ('IntersectionObserver' in window && revealItems.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: .14 });

    revealItems.forEach((item) => revealObserver.observe(item));
} else {
    revealItems.forEach((item) => item.classList.add('is-revealed'));
}

updatePickupState();
updateScrollInterface();
