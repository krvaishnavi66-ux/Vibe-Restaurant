window.Admin = (() => {
    const els = {};

    function qs(sel, root = document) { return root.querySelector(sel); }
    function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }
    const fmt = n => `₹${Number(n).toFixed(2)}`;

    function init() {
        StorageAPI.initDefaultMenu();
        cacheElements();
        bindEvents();
        renderTable();
        initMonthPicker();
    }

    function cacheElements() {
        els.form = qs('#itemForm');
        els.itemId = qs('#itemId');
        els.itemName = qs('#itemName');
        els.itemPrice = qs('#itemPrice');
        els.itemCategory = qs('#itemCategory');
        els.itemImage = qs('#itemImage');
        els.itemDesc = qs('#itemDesc');
        els.menuTableBody = qs('#menuTable tbody');
        els.resetBtn = qs('#resetBtn');
        els.monthPicker = qs('#monthPicker');
        els.loadReportBtn = qs('#loadReportBtn');
        els.salesTBody = qs('#salesTable tbody');
        els.reportSummary = qs('#reportSummary');
    }

    function bindEvents() {
        els.form.addEventListener('submit', onSaveItem);
        els.resetBtn.addEventListener('click', resetForm);
        els.loadReportBtn.addEventListener('click', loadReport);
    }

    function renderTable() {
        const items = StorageAPI.getMenu();
        els.menuTableBody.innerHTML = items.map(i => `
            <tr>
                <td>${i.name}</td>
                <td>${fmt(i.price)}</td>
                <td>${i.category ?? ''}</td>
                <td><img src="${i.image}" alt="${i.name}" /></td>
                <td>
                    <button class="btn" data-edit="${i.id}">Edit</button>
                    <button class="btn ghost" data-del="${i.id}">Delete</button>
                </td>
            </tr>
        `).join('');
        qsa('[data-edit]').forEach(b => b.addEventListener('click', () => editItem(b.dataset.edit)));
        qsa('[data-del]').forEach(b => b.addEventListener('click', () => deleteItem(b.dataset.del)));
    }

    function onSaveItem(e) {
        e.preventDefault();
        const id = els.itemId.value || crypto.randomUUID();
        const data = {
            id,
            name: els.itemName.value.trim(),
            price: Number(els.itemPrice.value || 0),
            category: els.itemCategory.value.trim(),
            image: els.itemImage.value.trim() || 'https://placehold.co/600x400?text=Food',
            description: els.itemDesc.value.trim(),
        };
        let items = StorageAPI.getMenu();
        const idx = items.findIndex(x => x.id === id);
        if (idx >= 0) items[idx] = data; else items.push(data);
        StorageAPI.setMenu(items);
        renderTable();
        resetForm();
    }

    function editItem(id) {
        const i = StorageAPI.getMenu().find(x => x.id === id);
        if (!i) return;
        els.itemId.value = i.id;
        els.itemName.value = i.name;
        els.itemPrice.value = i.price;
        els.itemCategory.value = i.category ?? '';
        els.itemImage.value = i.image ?? '';
        els.itemDesc.value = i.description ?? '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function deleteItem(id) {
        if (!confirm('Delete this item?')) return;
        const items = StorageAPI.getMenu().filter(x => x.id !== id);
        StorageAPI.setMenu(items);
        renderTable();
    }

    function resetForm() {
        els.form.reset();
        els.itemId.value = '';
    }

    function initMonthPicker() {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        els.monthPicker.value = `${y}-${m}`;
        loadReport();
    }

    function loadReport() {
        const val = els.monthPicker.value;
        if (!val) return;
        const [year, month] = val.split('-').map(Number);
        const txs = StorageAPI.getTransactions().filter(tx => {
            const d = new Date(tx.createdAt);
            return d.getFullYear() === year && (d.getMonth() + 1) === month;
        });
        els.salesTBody.innerHTML = txs.map(tx => `
            <tr>
                <td>${new Date(tx.createdAt).toLocaleString()}</td>
                <td>${tx.items.map(i => `${i.name} x ${i.qty}`).join(', ')}</td>
                <td>${fmt(tx.total)}</td>
            </tr>
        `).join('');
        const totalRevenue = txs.reduce((s, t) => s + Number(t.total || 0), 0);
        els.reportSummary.textContent = `${txs.length} orders • Revenue ${fmt(totalRevenue)}`;
    }

    return { init };
})();





