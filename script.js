(() => {
  const products = [...document.querySelectorAll('.product-card')];
  const grid = document.querySelector('#product-grid');
  const filters = [...document.querySelectorAll('.filter-chip')];
  const resultCount = document.querySelector('#result-count');
  const emptyState = document.querySelector('#empty-state');
  const resetFilters = document.querySelector('#reset-filters');
  const sortSelect = document.querySelector('#sort-select');
  const searchInputs = [document.querySelector('#site-search'), document.querySelector('#mobile-search')].filter(Boolean);
  const bagCount = document.querySelector('#bag-count');
  const cartPanel = document.querySelector('#cart-panel');
  const overlay = document.querySelector('#overlay');
  const cartItems = document.querySelector('#cart-items');
  const cartEmpty = document.querySelector('#cart-empty');
  const cartFooter = document.querySelector('#cart-footer');
  const toast = document.querySelector('#toast');
  const quickview = document.querySelector('#quickview-dialog');
  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  let activeCategory = 'all';
  let query = '';
  let cart = {};
  let toastTimeout;
  try { cart = JSON.parse(localStorage.getItem('morrow-cart') || '{}') || {}; } catch { cart = {}; }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('is-visible'), 2350);
  }
  function saveCart() {
    try { localStorage.setItem('morrow-cart', JSON.stringify(cart)); } catch { /* private browsing may disable storage */ }
    renderCart();
  }
  function cardById(id) { return products.find(card => card.dataset.id === id); }
  function cartQuantity() { return Object.values(cart).reduce((sum, item) => sum + item.qty, 0); }

  function applyFilters() {
    let visible = 0;
    products.forEach(card => {
      const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
      const matchesQuery = !query || `${card.dataset.name} ${card.dataset.category} ${card.dataset.description}`.toLowerCase().includes(query);
      const show = matchesCategory && matchesQuery;
      card.hidden = !show;
      if (show) visible++;
    });
    resultCount.textContent = `${visible} ${visible === 1 ? 'find' : 'finds'}`;
    emptyState.hidden = visible !== 0;
    grid.hidden = visible === 0;
    document.querySelector('.catalog-note').hidden = visible === 0;
  }
  filters.forEach(button => button.addEventListener('click', () => {
    activeCategory = button.dataset.category;
    filters.forEach(item => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    applyFilters();
  }));
  searchInputs.forEach(input => input.addEventListener('input', () => {
    query = input.value.trim().toLowerCase();
    searchInputs.forEach(other => { if (other !== input) other.value = input.value; });
    applyFilters();
  }));
  document.querySelector('#search-form').addEventListener('submit', event => event.preventDefault());
  sortSelect.addEventListener('change', () => {
    const sorted = [...products].sort((a, b) => {
      const diff = Number(a.dataset.price) - Number(b.dataset.price);
      return sortSelect.value === 'low' ? diff : sortSelect.value === 'high' ? -diff : products.indexOf(a) - products.indexOf(b);
    });
    sorted.forEach(card => grid.appendChild(card));
  });
  resetFilters.addEventListener('click', () => {
    activeCategory = 'all'; query = '';
    filters.forEach((button, index) => { button.classList.toggle('is-active', index === 0); button.setAttribute('aria-pressed', String(index === 0)); });
    searchInputs.forEach(input => input.value = '');
    applyFilters();
  });

  document.querySelectorAll('[data-nav-category]').forEach(link => link.addEventListener('click', () => {
    const category = link.dataset.navCategory;
    const chip = filters.find(item => item.dataset.category === category);
    if (chip) chip.click();
    document.querySelector('#primary-nav').classList.remove('is-open');
    document.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
  }));

  function addToCart(id, qty = 1) {
    const card = cardById(id);
    if (!card) return;
    if (!cart[id]) cart[id] = { qty: 0 };
    cart[id].qty += qty;
    saveCart();
    showToast(`${card.dataset.name} added to your bag`);
  }
  products.forEach(card => {
    card.querySelector('.quick-add').addEventListener('click', () => addToCart(card.dataset.id));
    card.querySelector('.favorite-button').addEventListener('click', event => {
      const button = event.currentTarget;
      const saved = button.getAttribute('aria-pressed') !== 'true';
      button.setAttribute('aria-pressed', String(saved));
      showToast(saved ? 'A good one, saved for later.' : 'Removed from your saved finds.');
    });
    card.querySelector('.product-card__quickview').addEventListener('click', () => openQuickview(card));
    card.querySelector('img').addEventListener('click', () => openQuickview(card));
    card.querySelector('img').style.cursor = 'pointer';
  });

  function openQuickview(card) {
    document.querySelector('#quickview-image').src = card.dataset.image;
    document.querySelector('#quickview-image').alt = card.querySelector('img').alt;
    document.querySelector('#quickview-category').textContent = `${card.dataset.category.toUpperCase()} / MORROW MARKET`;
    document.querySelector('#quickview-badge').textContent = card.dataset.badge;
    document.querySelector('#quickview-title').textContent = card.dataset.name;
    document.querySelector('#quickview-price').textContent = money.format(Number(card.dataset.price));
    document.querySelector('#quickview-description').textContent = card.dataset.description;
    document.querySelector('#quickview-add').onclick = () => { addToCart(card.dataset.id); quickview.close(); };
    quickview.showModal();
  }
  document.querySelector('.quickview-close').addEventListener('click', () => quickview.close());
  quickview.addEventListener('click', event => { if (event.target === quickview) quickview.close(); });
  quickview.addEventListener('close', () => document.body.classList.remove('is-locked'));
  quickview.addEventListener('close', () => { if (cartPanel.classList.contains('is-open')) document.body.classList.add('is-locked'); });
  quickview.addEventListener('close', () => {});

  function renderCart() {
    const totalQty = cartQuantity();
    bagCount.textContent = totalQty;
    document.querySelector('#cart-title-count').textContent = `(${totalQty})`;
    cartItems.innerHTML = '';
    let subtotal = 0;
    Object.entries(cart).forEach(([id, item]) => {
      const card = cardById(id);
      if (!card || item.qty < 1) { delete cart[id]; return; }
      const price = Number(card.dataset.price);
      subtotal += price * item.qty;
      const line = document.createElement('div');
      line.className = 'cart-line';
      line.innerHTML = `<img class="cart-line__image" src="${card.dataset.image}" alt=""><div class="cart-line__info"><p class="cart-line__name"></p><span class="cart-line__category">${card.dataset.category.toUpperCase()}</span><div class="quantity-control"><button type="button" aria-label="Decrease quantity"><svg class="icon"><use href="#i-minus"/></svg></button><span>${item.qty}</span><button type="button" aria-label="Increase quantity"><svg class="icon"><use href="#i-plus"/></svg></button><button class="remove-line" type="button">Remove</button></div></div><span class="cart-line__price">${money.format(price * item.qty)}</span>`;
      line.querySelector('.cart-line__name').textContent = card.dataset.name;
      const quantityButtons = line.querySelectorAll('.quantity-control button');
      quantityButtons[0].addEventListener('click', () => updateQty(id, -1));
      quantityButtons[1].addEventListener('click', () => updateQty(id, 1));
      quantityButtons[2].addEventListener('click', () => { delete cart[id]; saveCart(); });
      cartItems.appendChild(line);
    });
    const isEmpty = totalQty === 0;
    cartEmpty.hidden = !isEmpty;
    cartFooter.hidden = isEmpty;
    document.querySelector('#cart-subtotal').textContent = money.format(subtotal);
    const target = 2500;
    const remaining = Math.max(0, target - subtotal);
    document.querySelector('#shipping-message').textContent = remaining === 0 ? 'You’ve unlocked free shipping!' : 'A little more for free shipping';
    document.querySelector('#shipping-remaining').textContent = remaining === 0 ? 'Lovely.' : `${money.format(remaining)} to go`;
    document.querySelector('#progress-fill').style.width = `${Math.min(100, subtotal / target * 100)}%`;
  }
  function updateQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    saveCart();
  }
  function openCart() {
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
    cartPanel.classList.add('is-open');
    cartPanel.setAttribute('aria-hidden', 'false');
    cartPanel.inert = false;
    document.body.classList.add('is-locked');
    document.querySelector('.close-panel').focus();
  }
  function closeCart() {
    overlay.classList.remove('is-visible');
    cartPanel.classList.remove('is-open');
    cartPanel.setAttribute('aria-hidden', 'true');
    cartPanel.inert = true;
    document.body.classList.remove('is-locked');
    setTimeout(() => { if (!cartPanel.classList.contains('is-open')) overlay.hidden = true; }, 260);
  }
  document.querySelector('.bag-trigger').addEventListener('click', openCart);
  document.querySelector('.close-panel').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.querySelector('#continue-shopping').addEventListener('click', closeCart);
  document.querySelector('#checkout-button').addEventListener('click', () => showToast('This is a portfolio demo — no payment is processed.'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && cartPanel.classList.contains('is-open')) closeCart();
    if (event.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); document.querySelector('#site-search').focus(); }
  });
  document.querySelector('.menu-toggle').addEventListener('click', event => {
    const nav = document.querySelector('#primary-nav');
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    event.currentTarget.setAttribute('aria-expanded', String(open));
    event.currentTarget.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  document.querySelector('#newsletter-form').addEventListener('submit', event => {
    event.preventDefault();
    const email = document.querySelector('#email');
    if (!email.checkValidity()) { email.reportValidity(); return; }
    showToast('You’re on the list. Thanks for stopping by!');
    event.currentTarget.reset();
  });
  renderCart();
  applyFilters();
})();
