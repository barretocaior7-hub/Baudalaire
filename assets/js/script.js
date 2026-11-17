/**
 * CARDÁPIO DIGITAL PREMIUM — BAUDALAIRE (SABOR EM CADA DETALHE)
 * Vanilla JavaScript (ES6+), Modular, Sem Frameworks
 * Fidelidade Total à Ficha de Projeção de Vendas da Cafeteria
 */

// =============================================================================
// 1. BASE DE DADOS DOS PRODUTOS (EXTRAÍDA DIRETAMENTE DA IMAGEM DE REFERÊNCIA)
// =============================================================================
const ORIGINAL_PRODUCTS = [
  {
    id: 'tortas-doces-salgadas',
    name: 'Tortas doces e salgadas',
    category: 'tortas',
    categoryName: 'Tortas & Especiais',
    price: 25.00,
    originalQty: 70, // Quantidade da ficha de projeção
    description: 'Fatia nobre de torta artesanal Baudalaire com crosta folhada dourada e recheios autorais com ingredientes frescos e especiarias refinadas.',
    ingredients: 'Massa brisée amanteigada, recheios nobres doces e salgados, tomatinho cereja, manjericão fresco e flor de sal.',
    image: 'assets/images/products/tortas-doces-salgadas.jpg',
    badge: 'Especialidade Baudalaire',
    available: true
  },
  {
    id: 'cafe',
    name: 'Café',
    category: 'bebidas',
    categoryName: 'Cafés & Bebidas Quentes',
    price: 8.00,
    originalQty: 90, // Quantidade da ficha de projeção
    description: 'Café especial 100% arábica de microlote selecionado, torra artesanal média com notas de cacau e avelã, finalizado com crema densa dourada.',
    ingredients: 'Grãos 100% arábica selecionados de origem controlada, água purificada na temperatura exata de extração.',
    image: 'assets/images/products/cafe.jpg',
    badge: 'Microlote Exclusivo',
    available: true
  },
  {
    id: 'sucos',
    name: 'Sucos',
    category: 'bebidas',
    categoryName: 'Sucos Naturais',
    price: 17.00,
    originalQty: 40, // Quantidade da ficha de projeção
    description: 'Sucos naturais refrescantes preparados na hora com frutas nobres puras, servidos bem gelados em cristal com toque de manjericão e gelo translúcido.',
    ingredients: 'Frutas frescas da estação selecionadas (laranja, maracujá, frutas vermelhas), água mineral purificada, folhas de manjericão e gelo cristalino.',
    image: 'assets/images/products/sucos.jpg',
    badge: '100% Natural',
    available: true
  },
  {
    id: 'doces-e-salgados',
    name: 'Doces e salgados',
    category: 'doces-salgados',
    categoryName: 'Doces & Salgados Finos',
    price: 5.00,
    originalQty: 80, // Quantidade da ficha de projeção
    description: 'Seleção impecável de folhados dourados amanteigados, petit fours e docinhos clássicos da vitrine de alta confeitaria Baudalaire.',
    ingredients: 'Farinha de trigo premium, manteiga pura, queijos nobres, recheios doces e salgados artesanais e especiarias.',
    image: 'assets/images/products/doces-e-salgados.jpg',
    badge: 'Alta Confeitaria',
    available: true
  },
  {
    id: 'bolo-em-fatias',
    name: 'Bolo em fatias',
    category: 'bolos',
    categoryName: 'Bolos & Confeitaria',
    price: 15.00,
    originalQty: 25, // Quantidade da ficha de projeção
    description: 'Fatia generosa de bolo gourmet com massa macia e aveludada, finalizada com ganache cremosa e acabamento artesanal sofisticado.',
    ingredients: 'Ovos caipiras frescos, cacau puro nobre, manteiga de fazenda, calda aveludada e cobertura sedosa de chocolate belga.',
    image: 'assets/images/products/bolo-em-fatias.jpg',
    badge: 'Receita Autoral',
    available: true
  }
];

// =============================================================================
// 2. GERENCIADOR DE ESTADO (STATE & LOCALSTORAGE)
// =============================================================================
class MenuStateManager {
  constructor() {
    this.storageKeyPrices = 'baudalaire_custom_prices';
    this.storageKeyCart = 'baudalaire_cart_items';
    this.products = this.loadProducts();
  }

  loadProducts() {
    try {
      const savedPrices = localStorage.getItem(this.storageKeyPrices);
      if (savedPrices) {
        const pricesMap = JSON.parse(savedPrices);
        return ORIGINAL_PRODUCTS.map(p => ({
          ...p,
          price: pricesMap[p.id] !== undefined ? parseFloat(pricesMap[p.id]) : p.price
        }));
      }
    } catch (e) {
      console.warn('Erro ao carregar preços personalizados do localStorage:', e);
    }
    return JSON.parse(JSON.stringify(ORIGINAL_PRODUCTS));
  }

  updatePrice(productId, newPrice) {
    const val = parseFloat(newPrice);
    if (isNaN(val) || val <= 0) return false;

    const prod = this.products.find(p => p.id === productId);
    if (prod) {
      prod.price = val;
      this.savePrices();
      return true;
    }
    return false;
  }

  savePrices() {
    try {
      const pricesMap = {};
      this.products.forEach(p => { pricesMap[p.id] = p.price; });
      localStorage.setItem(this.storageKeyPrices, JSON.stringify(pricesMap));
    } catch (e) {
      console.warn('Erro ao salvar preços:', e);
    }
  }

  resetPrices() {
    localStorage.removeItem(this.storageKeyPrices);
    this.products = JSON.parse(JSON.stringify(ORIGINAL_PRODUCTS));
  }

  getProduct(id) {
    return this.products.find(p => p.id === id);
  }

  getAllProducts() {
    return this.products;
  }
}

// =============================================================================
// 3. CARRINHO DE COMPRAS INTERATIVO (LOCALSTORAGE & CÁLCULOS)
// =============================================================================
class ShoppingCart {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.storageKey = 'baudalaire_cart_v2';
    this.items = this.loadCart();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar carrinho:', e);
    }
    return [];
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Erro ao salvar carrinho:', e);
    }
  }

  addItem(productId, quantity = 1) {
    const product = this.stateManager.getProduct(productId);
    if (!product) return false;

    const qty = Math.max(1, parseInt(quantity) || 1);
    const existingIndex = this.items.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += qty;
    } else {
      this.items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty
      });
    }

    this.saveCart();
    this.syncCartPrices();
    return true;
  }

  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.saveCart();
    }
  }

  removeItem(productId) {
    this.items = this.items.filter(i => i.id !== productId);
    this.saveCart();
  }

  clear() {
    this.items = [];
    this.saveCart();
  }

  syncCartPrices() {
    this.items.forEach(item => {
      const prod = this.stateManager.getProduct(item.id);
      if (prod) {
        item.price = prod.price;
      }
    });
    this.saveCart();
  }

  getTotalItemsCount() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  getTotal() {
    return this.getSubtotal();
  }
}

// =============================================================================
// 4. CONTROLADOR DA INTERFACE E RENDERIZAÇÃO
// =============================================================================
class MenuUIController {
  constructor() {
    this.state = new MenuStateManager();
    this.cart = new ShoppingCart(this.state);
    this.activeCategory = 'all';
    this.searchQuery = '';

    this.initDOMElements();
    this.bindEvents();
    this.renderCatalog();
    this.renderCart();
  }

  initDOMElements() {
    this.productsGrid = document.getElementById('productsGrid');
    this.cartCountBadges = document.querySelectorAll('.cart-count-badge');
    this.cartItemsContainer = document.getElementById('cartItemsContainer');
    this.cartEmptyState = document.getElementById('cartEmptyState');
    this.cartSubtotalEl = document.getElementById('cartSubtotal');
    this.cartTotalEl = document.getElementById('cartTotal');
    this.checkoutWhatsappBtn = document.getElementById('btnCheckoutWhatsapp');
    this.searchInput = document.getElementById('searchInput');
    this.categoryBtns = document.querySelectorAll('.category-btn');
    this.toastContainer = document.getElementById('toastContainer');
  }

  bindEvents() {
    // Scroll na navbar
    window.addEventListener('scroll', () => {
      const navbar = document.querySelector('.navbar-custom');
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Filtros de categoria
    this.categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCategory = btn.getAttribute('data-category');
        this.renderCatalog();
      });
    });

    // Campo de busca
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderCatalog();
      });
    }

    // Botão Limpar Carrinho
    const btnClearCart = document.getElementById('btnClearCart');
    if (btnClearCart) {
      btnClearCart.addEventListener('click', () => {
        if (confirm('Deseja realmente esvaziar o seu pedido?')) {
          this.cart.clear();
          this.renderCart();
          this.showToast('Pedido esvaziado com sucesso.');
        }
      });
    }

    // Finalizar via WhatsApp
    if (this.checkoutWhatsappBtn) {
      this.checkoutWhatsappBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleCheckout();
      });
    }
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Renderização da Grade de Cards dos Produtos Baudalaire
  renderCatalog() {
    if (!this.productsGrid) return;

    const products = this.state.getAllProducts();
    const filtered = products.filter(product => {
      const matchesCategory = this.activeCategory === 'all' || product.category === this.activeCategory;
      const matchesSearch = !this.searchQuery || 
        product.name.toLowerCase().includes(this.searchQuery) ||
        product.description.toLowerCase().includes(this.searchQuery) ||
        product.ingredients.toLowerCase().includes(this.searchQuery);
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      this.productsGrid.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="p-4 rounded-4 border" style="background: #141419; border-color: var(--gold-border) !important;">
            <h4 class="font-luxury mb-2 text-gold" style="color: var(--gold-light);">Nenhum produto encontrado</h4>
            <p class="text-secondary small mb-0">Tente buscar por outro termo ou selecione a categoria "Todos os Itens".</p>
          </div>
        </div>
      `;
      return;
    }

    this.productsGrid.innerHTML = filtered.map(product => `
      <div class="col-12 col-md-6 col-lg-4 mb-4">
        <article class="product-card" id="card-${product.id}">
          <div class="product-img-wrapper">
            <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy">
            <span class="product-badge-category">${product.categoryName}</span>
            <span class="product-badge-projecao">${product.badge}</span>
          </div>
          
          <div class="product-content">
            <h3 class="product-title font-luxury">${product.name}</h3>
            <p class="product-desc">${product.description}</p>
            
            <div class="product-ingredients-box">
              <span class="ingredients-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Ingredientes & Composição
              </span>
              <p class="ingredients-text">${product.ingredients}</p>
            </div>

            <div class="product-footer">
              <div class="price-display-group">
                <span class="price-label">Preço Individual</span>
                <div class="price-value-container">
                  <span class="price-currency">R$</span>
                  <span class="price-amount" id="price-val-${product.id}">${product.price.toFixed(2).replace('.', ',')}</span>
                  <button class="btn-edit-price ms-1" onclick="menuApp.openPriceModal('${product.id}')" title="Editar Preço">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              </div>

              <div class="d-flex align-items-center gap-2">
                <div class="qty-stepper">
                  <button class="qty-btn" type="button" onclick="menuApp.adjustCardQty('${product.id}', -1)" aria-label="Diminuir">-</button>
                  <input type="number" id="qty-${product.id}" class="qty-input" value="1" min="1" max="99" readonly>
                  <button class="qty-btn" type="button" onclick="menuApp.adjustCardQty('${product.id}', 1)" aria-label="Aumentar">+</button>
                </div>

                <button class="btn-add-cart" id="btn-add-${product.id}" onclick="menuApp.handleAddToCart('${product.id}')" title="Adicionar ao Pedido">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="8" cy="21" r="1.5"/><circle cx="19" cy="21" r="1.5"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    `).join('');
  }

  adjustCardQty(productId, delta) {
    const input = document.getElementById(`qty-${productId}`);
    if (input) {
      let current = parseInt(input.value) || 1;
      current = Math.max(1, Math.min(99, current + delta));
      input.value = current;
    }
  }

  handleAddToCart(productId) {
    const input = document.getElementById(`qty-${productId}`);
    const quantity = input ? parseInt(input.value) || 1 : 1;
    const product = this.state.getProduct(productId);

    if (this.cart.addItem(productId, quantity)) {
      const btn = document.getElementById(`btn-add-${productId}`);
      if (btn) {
        btn.classList.add('added');
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
        setTimeout(() => {
          btn.classList.remove('added');
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1.5"/><circle cx="19" cy="21" r="1.5"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;
        }, 1200);
      }

      if (input) input.value = 1;

      this.bumpCartBadges();
      this.renderCart();
      this.showToast(`<strong>${product.name}</strong> (${quantity}x) adicionado ao pedido!`);
    }
  }

  bumpCartBadges() {
    this.cartCountBadges.forEach(badge => {
      badge.classList.remove('bump');
      void badge.offsetWidth;
      badge.classList.add('bump');
    });
  }

  renderCart() {
    const totalCount = this.cart.getTotalItemsCount();
    const subtotal = this.cart.getSubtotal();
    const total = this.cart.getTotal();

    this.cartCountBadges.forEach(badge => {
      badge.textContent = totalCount;
    });

    if (this.cart.items.length === 0) {
      if (this.cartEmptyState) this.cartEmptyState.classList.remove('d-none');
      if (this.cartItemsContainer) this.cartItemsContainer.innerHTML = '';
      if (this.cartSubtotalEl) this.cartSubtotalEl.textContent = this.formatCurrency(0);
      if (this.cartTotalEl) this.cartTotalEl.textContent = this.formatCurrency(0);
      if (this.checkoutWhatsappBtn) {
        this.checkoutWhatsappBtn.classList.add('disabled', 'opacity-50');
        this.checkoutWhatsappBtn.style.pointerEvents = 'none';
      }
      return;
    }

    if (this.cartEmptyState) this.cartEmptyState.classList.add('d-none');
    if (this.checkoutWhatsappBtn) {
      this.checkoutWhatsappBtn.classList.remove('disabled', 'opacity-50');
      this.checkoutWhatsappBtn.style.pointerEvents = 'auto';
    }

    if (this.cartItemsContainer) {
      this.cartItemsContainer.innerHTML = this.cart.items.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          
          <div class="cart-item-details">
            <h5 class="cart-item-title">${item.name}</h5>
            <div class="cart-item-price">${this.formatCurrency(item.price)} cada</div>
            <div class="small text-muted mt-1">Subtotal: <strong class="text-white">${this.formatCurrency(item.price * item.quantity)}</strong></div>
          </div>

          <div class="cart-item-actions">
            <div class="qty-stepper me-2">
              <button class="qty-btn" onclick="menuApp.cart.updateQuantity('${item.id}', -1); menuApp.renderCart();" aria-label="Diminuir">-</button>
              <span class="qty-input d-flex align-items-center justify-content-center">${item.quantity}</span>
              <button class="qty-btn" onclick="menuApp.cart.updateQuantity('${item.id}', 1); menuApp.renderCart();" aria-label="Aumentar">+</button>
            </div>

            <button class="btn-cart-remove" onclick="menuApp.cart.removeItem('${item.id}'); menuApp.renderCart();" title="Remover item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
          </div>
        </div>
      `).join('');
    }

    if (this.cartSubtotalEl) this.cartSubtotalEl.textContent = this.formatCurrency(subtotal);
    if (this.cartTotalEl) this.cartTotalEl.textContent = this.formatCurrency(total);
  }

  handleCheckout() {
    if (this.cart.items.length === 0) return;

    let message = `👑 *PEDIDO — BAUDALAIRE (SABOR EM CADA DETALHE)*\n`;
    message += `────────────────────────────\n`;
    
    this.cart.items.forEach((item, index) => {
      const lineTotal = item.price * item.quantity;
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Qtd: ${item.quantity}x | R$ ${item.price.toFixed(2).replace('.', ',')} | Subtotal: R$ ${lineTotal.toFixed(2).replace('.', ',')}\n`;
    });

    message += `────────────────────────────\n`;
    message += `*Total de Itens:* ${this.cart.getTotalItemsCount()}\n`;
    message += `*VALOR TOTAL:* ${this.formatCurrency(this.cart.getTotal())}\n`;
    message += `────────────────────────────\n`;
    message += `Olá! Gostaria de confirmar meu pedido na Baudalaire. Por favor, me informe a previsão. Obrigado!`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=5511999999999&text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  }

  showToast(message) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast-custom mb-2';
    toast.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      <div>${message}</div>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  openPriceModal(productId) {
    const product = this.state.getProduct(productId);
    if (!product) return;

    const modalInput = document.getElementById('editPriceInput');
    const modalProductName = document.getElementById('editPriceProductName');
    const modalConfirmBtn = document.getElementById('btnConfirmPriceEdit');

    if (modalProductName) modalProductName.textContent = product.name;
    if (modalInput) modalInput.value = product.price.toFixed(2);

    if (modalConfirmBtn) {
      modalConfirmBtn.onclick = () => {
        const newPrice = parseFloat(modalInput.value);
        if (newPrice > 0) {
          this.state.updatePrice(productId, newPrice);
          this.cart.syncCartPrices();
          this.renderCatalog();
          this.renderCart();
          this.showToast(`Preço de <strong>${product.name}</strong> atualizado para ${this.formatCurrency(newPrice)}`);
          
          const modalEl = document.getElementById('priceEditModal');
          const modalInstance = bootstrap.Modal.getInstance(modalEl);
          if (modalInstance) modalInstance.hide();
        } else {
          alert('Por favor, informe um valor numérico válido maior que zero.');
        }
      };
    }

    const modalEl = document.getElementById('priceEditModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }
}

// Inicialização Global
let menuApp;
document.addEventListener('DOMContentLoaded', () => {
  menuApp = new MenuUIController();
});
