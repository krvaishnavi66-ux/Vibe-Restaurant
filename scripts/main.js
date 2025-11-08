window.App = (() => {
    const els = {};

    function qs(sel, root = document) { return root.querySelector(sel); }
    function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }
    const fmt = n => `₹${n.toFixed(2)}`;

    function init() {
        StorageAPI.initDefaultMenu();
        cacheElements();
        bindEvents();
        renderFilters();
        renderMenu();
        renderCart();
        renderReviews();
        if (els.reviewForm) els.reviewForm.addEventListener('submit', onSubmitReview);
    }

    function cacheElements() {
        els.menuGrid = qs('#menuGrid');
        els.categoryFilters = qs('#categoryFilters');
        els.cartPanel = qs('#cartPanel');
        els.cartItems = qs('#cartItems');
        els.cartCount = qs('#cartCount');
        els.totalAmt = qs('#totalAmt');
        els.modal = qs('#modal');
        els.modalTitle = qs('#modalTitle');
        els.modalBody = qs('#modalBody');
        els.billTemplate = qs('#billTemplate');
        els.reviewsList = qs('#reviewsList');
        els.reviewForm = qs('#reviewForm');
    }

    function bindEvents() {
        qs('#toggleCartBtn').addEventListener('click', () => toggleCart(true));
        qs('#closeCartBtn').addEventListener('click', () => toggleCart(false));
        qs('#clearCartBtn').addEventListener('click', clearCart);
        qs('#printBillBtn').addEventListener('click', printBill);
        qs('#payNowBtn').addEventListener('click', payNow);
        qs('#modalCloseBtn').addEventListener('click', closeModal);
        els.modal.addEventListener('click', (e) => {
            if (e.target === els.modal) closeModal();
        });
    }

    function renderMenu(category = 'All') {
        const items = StorageAPI.getMenu();
        const filtered = category === 'All' ? items : items.filter(i => (i.category || 'Other') === category);
        els.menuGrid.innerHTML = filtered.map(renderMenuCard).join('');
        qsa('[data-add]').forEach(btn => btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-add');
            const item = items.find(i => i.id === id);
            addToCart(item);
        }));
    }

    function renderFilters() {
        if (!els.categoryFilters) return;
        const items = StorageAPI.getMenu();
        const cats = Array.from(new Set(items.map(i => i.category || 'Other')));
        const all = ['All', ...cats];
        els.categoryFilters.innerHTML = all.map((c, idx) => `<button class="chip${idx===0?' active':''}" data-cat="${c}">${c}</button>`).join('');
        qsa('[data-cat]').forEach(btn => btn.addEventListener('click', () => {
            qsa('.chip', els.categoryFilters).forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderMenu(btn.dataset.cat);
        }));
    }

    function renderMenuCard(item) {
        const { id, name, price, image, description } = item;
        return `
        <article class="card">
            <img src="${image}" alt="${name}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/600x400?text=Food';" />
            <div class="content">
                <h3>${name}</h3>
                <p class="muted">${description ?? ''}</p>
                <div class="row" style="justify-content:space-between;align-items:center">
                    <span class="price">${fmt(price)}</span>
                    <button class="btn" data-add="${id}">Add</button>
                </div>
            </div>
        </article>`;
    }

    function getCart() { return StorageAPI.getCart(); }
    function setCart(cart) { StorageAPI.setCart(cart); }

    function addToCart(item) {
        const cart = getCart();
        const existing = cart.find(c => c.id === item.id);
        if (existing) existing.qty += 1; else cart.push({ id: item.id, name: item.name, price: item.price, image: item.image, qty: 1 });
        setCart(cart);
        renderCart();
        toggleCart(true);
    }

    function updateQty(id, delta) {
        const cart = getCart().map(c => c.id === id ? { ...c, qty: Math.max(0, c.qty + delta) } : c).filter(c => c.qty > 0);
        setCart(cart);
        renderCart();
    }

    function removeFromCart(id) {
        setCart(getCart().filter(c => c.id !== id));
        renderCart();
    }

    function clearCart() {
        setCart([]);
        renderCart();
    }

    function calculateTotals() {
        const cart = getCart();
        const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
        return { total };
    }

    function renderCart() {
        const cart = getCart();
        els.cartCount.textContent = cart.reduce((s, c) => s + c.qty, 0);
        els.cartItems.innerHTML = cart.length ? cart.map(renderCartItem).join('') : `<p class="muted">Your cart is empty.</p>`;
        qsa('[data-qty]')
            .forEach(btn => btn.addEventListener('click', () => updateQty(btn.dataset.id, Number(btn.dataset.qty))));
        qsa('[data-remove]')
            .forEach(btn => btn.addEventListener('click', () => removeFromCart(btn.dataset.remove)));

        const { total } = calculateTotals();
        els.totalAmt.textContent = fmt(total);
    }

    function renderCartItem(item) {
        return `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='https://placehold.co/80?text=Food';" />
            <div>
                <p class="title">${item.name}</p>
                <p class="muted">${fmt(item.price)}</p>
                <div class="qty">
                    <button class="btn" data-qty="-1" data-id="${item.id}">-</button>
                    <span>${item.qty}</span>
                    <button class="btn" data-qty="1" data-id="${item.id}">+</button>
                    <button class="btn ghost" data-remove="${item.id}">Remove</button>
                </div>
            </div>
            <div style="font-weight:600">${fmt(item.qty * item.price)}</div>
        </div>`;
    }

    function toggleCart(open) {
        if (typeof open === 'boolean') {
            els.cartPanel.classList.toggle('open', open);
            els.cartPanel.setAttribute('aria-hidden', String(!open));
        } else {
            els.cartPanel.classList.toggle('open');
        }
    }

    function payNow() {
        const { total } = calculateTotals();
        if (total <= 0) { alert('Cart is empty'); return; }
        els.modalTitle.textContent = 'Scan to Pay';
        const wrap = document.createElement('div');
        wrap.innerHTML = `
            <p class="center muted">Amount: <strong>${fmt(total)}</strong></p>
            <div class="center" id="qrWrap" style="padding:12px"></div>
            <div class="center" style="margin-top:8px">
                <button class="btn primary" id="markPaidBtn">Mark as Paid</button>
            </div>
        `;
        els.modalBody.innerHTML = '';
        els.modalBody.appendChild(wrap);
        const qrEl = wrap.querySelector('#qrWrap');
        const payload = `VibeRestaurant|AMOUNT=${total.toFixed(2)}|TS=${Date.now()}`;
        QRCode.toCanvas(payload, { width: 220 }, (err, canvas) => {
            if (!err) qrEl.appendChild(canvas);
        });
        wrap.querySelector('#markPaidBtn').addEventListener('click', () => processPayment());
        openModal();
    }

    function processPayment() {
        const cart = getCart();
        const { total } = calculateTotals();
        const tx = {
            id: crypto.randomUUID(),
            items: cart,
            total,
            createdAt: new Date().toISOString(),
        };
        StorageAPI.addTransaction(tx);
        closeModal();
        printBill();
        clearCart();
        alert('Payment recorded. Bill printed.');
    }

    function openModal() { els.modal.classList.add('open'); els.modal.setAttribute('aria-hidden', 'false'); }
    function closeModal() { els.modal.classList.remove('open'); els.modal.setAttribute('aria-hidden', 'true'); }

    function generateBillFragment() {
        const tpl = els.billTemplate.content.cloneNode(true);
        const rowsEl = tpl.querySelector('#billRows');
        const cart = getCart();
        const { total } = calculateTotals();
        tpl.querySelector('#billDate').textContent = new Date().toLocaleString();
        rowsEl.innerHTML = cart.map(i => `
            <tr>
                <td>${i.name}</td>
                <td>${i.qty}</td>
                <td>${fmt(i.price)}</td>
                <td>${fmt(i.price * i.qty)}</td>
            </tr>
        `).join('');
        tpl.querySelector('#billGrand').textContent = fmt(total);
        return tpl;
    }

    function printBill() {
        const frag = generateBillFragment();
        const w = window.open('', 'PRINT', 'height=650,width=900,top=100,left=150');
        if (!w) return;
        w.document.write('<html><head><title>Bill - Vibe Restaurant</title>');
        w.document.write('<link rel="stylesheet" href="styles/main.css">');
        w.document.write('</head><body>');
        const holder = document.createElement('div');
        holder.appendChild(frag);
        w.document.write(holder.innerHTML);
        w.document.write('</body></html>');
        w.document.close();
        w.focus();
        w.print();
        w.close();
    }

    function renderReviews() {
        if (!els.reviewsList) return;
        const reviews = StorageAPI.getReviews();
        els.reviewsList.innerHTML = reviews.length ? reviews.map(renderReview).join('') : `<p class="muted">No reviews yet. Be the first!</p>`;
    }

    function renderReview(r) {
        const stars = '★★★★★'.slice(0, r.rating);
        const avatar = r.avatar || `https://i.pravatar.cc/80?u=${encodeURIComponent(r.name)}`;
        return `
            <div class="review">
                <img src="${avatar}" alt="${r.name}" onerror="this.onerror=null;this.src='https://placehold.co/80?text=User';" />
                <div>
                    <div class="name">${r.name} <span class="stars">${stars}</span></div>
                    <div class="muted">${new Date(r.createdAt).toLocaleString()}</div>
                    <p style="margin:6px 0 0 0">${r.comment || ''}</p>
                </div>
            </div>
        `;
    }

    function onSubmitReview(e) {
        e.preventDefault();
        const name = qs('#revName').value.trim() || 'Guest';
        const rating = Number(qs('#revRating').value || 5);
        const comment = qs('#revComment').value.trim();
        StorageAPI.addReview({ id: crypto.randomUUID(), name, rating, comment, createdAt: new Date().toISOString() });
        e.target.reset();
        renderReviews();
        alert('Thanks for your review!');
    }

    return { init };
})();


