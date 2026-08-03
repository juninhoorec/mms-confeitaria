(() => {
    if (document.querySelector('#product-detail-modal')) {
        return;
    }

    document.body.insertAdjacentHTML('beforeend', `
        <div class="product-detail-modal" id="product-detail-modal" aria-hidden="true">
            <button class="dialog-backdrop" type="button" aria-label="Fechar detalhes do produto" data-close-dialog="product-detail-modal"></button>
            <section class="product-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
                <button class="dialog-close product-detail-close" type="button" aria-label="Fechar detalhes do produto" data-close-dialog="product-detail-modal">
                    <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
                <div class="product-detail-layout">
                    <button class="product-detail-image" id="product-detail-image-button" type="button" aria-label="Ampliar foto do produto">
                        <img id="product-detail-image" src="" alt="">
                    </button>
                    <div class="product-detail-content">
                        <span class="section-tag">DETALHES DO PRODUTO</span>
                        <h2 class="product-detail-title" id="product-detail-title"></h2>
                        <strong class="product-detail-price" id="product-detail-price"></strong>
                        <p class="product-detail-description" id="product-detail-description"></p>
                        <div class="product-detail-ingredients">
                            <h3>Ingredientes principais</h3>
                            <ul id="product-detail-ingredients"></ul>
                        </div>
                        <div class="product-variants" id="product-variants" hidden>
                            <fieldset>
                                <legend>Tamanho</legend>
                                <div class="variant-options">
                                    <label><input type="radio" name="cake-size" value="pequeno" checked><span>Pequeno<small>8 a 10 fatias</small></span></label>
                                    <label><input type="radio" name="cake-size" value="medio"><span>Médio</span></label>
                                    <label><input type="radio" name="cake-size" value="grande"><span>Grande</span></label>
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend>Acabamento</legend>
                                <div class="variant-options variant-options-finish">
                                    <label><input type="radio" name="cake-finish" value="simples" checked><span>Simples</span></label>
                                    <label><input type="radio" name="cake-finish" value="cobertura"><span>Com cobertura</span></label>
                                </div>
                            </fieldset>
                        </div>
                        <label class="product-notes-label" for="product-notes">
                            Deseja informar ou retirar algum ingrediente?
                            <textarea id="product-notes" rows="3" maxlength="240" placeholder="Ex.: retirar nozes ou escrever uma mensagem..."></textarea>
                            <small><span id="product-notes-count">0</span>/240 caracteres</small>
                        </label>
                        <div class="product-detail-actions">
                            <div class="detail-quantity" aria-label="Quantidade do produto">
                                <button id="detail-decrease" type="button" aria-label="Diminuir quantidade">−</button>
                                <span id="detail-quantity-value">1</span>
                                <button id="detail-increase" type="button" aria-label="Aumentar quantidade">+</button>
                            </div>
                            <button class="product-detail-add" id="product-detail-add" type="button">
                                ADICIONAR AO CARRINHO <i class="fa-solid fa-plus" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div class="image-lightbox" id="image-lightbox" aria-hidden="true">
            <button class="lightbox-backdrop" type="button" aria-label="Fechar foto ampliada"></button>
            <div class="lightbox-content" role="dialog" aria-modal="true" aria-label="Foto ampliada do produto" tabindex="-1">
                <button class="lightbox-close" type="button" aria-label="Fechar foto ampliada"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
                <img id="lightbox-image" src="" alt="" draggable="false">
                <span class="lightbox-hint">Toque duas vezes ou use dois dedos para ampliar</span>
            </div>
        </div>

        <div class="cart-panel" id="cart-panel" aria-hidden="true">
            <button class="dialog-backdrop" type="button" aria-label="Fechar carrinho" data-close-dialog="cart-panel"></button>
            <aside class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
                <div class="dialog-header">
                    <div><span class="section-tag">SEU PEDIDO</span><h2 class="dialog-title" id="cart-title">Carrinho</h2></div>
                    <button class="dialog-close" type="button" aria-label="Fechar carrinho" data-close-dialog="cart-panel">
                        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
                    </button>
                </div>
                <div class="cart-content">
                    <p class="cart-empty">Seu carrinho está vazio. Adicione um produto para começar.</p>
                    <div class="cart-items" aria-live="polite"></div>
                </div>
                <div class="cart-summary">
                    <div class="cart-order-details">
                        <div class="delivery-schedule">
                            <label>Data da entrega<input id="order-date" type="date" required></label>
                            <label>Horário desejado<select id="order-time" required>
                                <option value="">Selecione o horário</option>
                                <option value="09:00">09:00</option><option value="09:30">09:30</option>
                                <option value="10:00">10:00</option><option value="10:30">10:30</option>
                                <option value="11:00">11:00</option><option value="11:30">11:30</option>
                                <option value="12:00">12:00</option><option value="12:30">12:30</option>
                                <option value="13:00">13:00</option><option value="13:30">13:30</option>
                                <option value="14:00">14:00</option><option value="14:30">14:30</option>
                                <option value="15:00">15:00</option><option value="15:30">15:30</option>
                                <option value="16:00">16:00</option><option value="16:30">16:30</option>
                                <option value="17:00">17:00</option><option value="17:30">17:30</option>
                                <option value="18:00">18:00</option><option value="18:30">18:30</option>
                                <option value="19:00">19:00</option><option value="19:30">19:30</option>
                                <option value="20:00">20:00</option><option value="20:30">20:30</option>
                                <option value="21:00">21:00</option>
                            </select></label>
                        </div>
                        <small class="delivery-schedule-note"><i class="fa-regular fa-clock" aria-hidden="true"></i> Horários entre 9h e 21h. As opções respeitam automaticamente o prazo de preparo.</small>
                        <label class="order-address-field">Endereço de entrega<textarea id="order-address" rows="2" maxlength="180" placeholder="Rua, número, bairro e referência" required></textarea></label>
                        <label>Forma de pagamento<select id="order-payment" required>
                            <option value="">Selecione</option><option value="Pix">Pix</option><option value="Cartão">Cartão</option><option value="Dinheiro">Dinheiro</option>
                        </select></label>
                    </div>
                    <label class="pickup-option">
                        <input id="pickup-local" type="checkbox">
                        <span class="pickup-check" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                        <span><strong>Retirada no local</strong><small>A MMS confirmará pelo WhatsApp o endereço e o horário disponíveis.</small></span>
                    </label>
                    <div><span>Subtotal</span><strong id="cart-subtotal">R$ 0,00</strong></div>
                    <div><span id="shipping-label">Taxa de entrega</span><strong id="cart-shipping">A confirmar</strong></div>
                    <small id="shipping-note">O valor será confirmado pela MMS conforme o endereço e a disponibilidade de entrega.</small>
                    <div class="cart-total"><span>Total</span><strong id="cart-total">R$ 0,00</strong></div>
                    <a class="cart-checkout" id="cart-checkout" href="https://wa.me/5581981908099" target="_blank" rel="noopener noreferrer" aria-disabled="true">
                        FINALIZAR PELO WHATSAPP <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
                    </a>
                </div>
            </aside>
        </div>

        <div class="cart-feedback" role="status" aria-live="polite"></div>
        <div class="scroll-progress" id="scroll-progress" aria-hidden="true">
            <div class="scroll-progress-ring" id="scroll-progress-ring" aria-label="Progresso da página: 0%">
                <span id="scroll-progress-value">0%</span>
            </div>
            <button class="scroll-to-top" id="scroll-to-top" type="button" aria-label="Voltar ao topo">
                <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
            </button>
        </div>
    `);
})();
