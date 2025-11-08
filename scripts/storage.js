window.StorageAPI = (() => {
    const KEYS = {
        menu: 'vibe.menuItems.v1',
        cart: 'vibe.cart.v1',
        tx: 'vibe.transactions.v1',
        reviews: 'vibe.reviews.v1'
    };

    function saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function getFromStorage(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
        catch { return fallback; }
    }

    function initDefaultMenu() {
        const exists = getFromStorage(KEYS.menu);
        if (exists && Array.isArray(exists) && exists.length) return exists;
        const items = [
            { id: crypto.randomUUID(), name: 'Idly', price: 20, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1628294895950-3c935d1a1b9f?q=80&w=800&auto=format&fit=crop', description: 'Steamed rice cakes' },
            { id: crypto.randomUUID(), name: 'Chappathi', price: 30, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1604908554027-321b77f21f42?q=80&w=800&auto=format&fit=crop', description: 'Whole wheat flatbread' },
            { id: crypto.randomUUID(), name: 'Poori', price: 35, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1625944526153-4d3b3d3d77f9?q=80&w=800&auto=format&fit=crop', description: 'Deep-fried bread' },
            { id: crypto.randomUUID(), name: 'Vada', price: 15, category: 'Snacks', image: 'https://images.unsplash.com/photo-1631452180519-7bf2b8fe8e94?q=80&w=800&auto=format&fit=crop', description: 'Crispy lentil fritter' },
            { id: crypto.randomUUID(), name: 'Dosa', price: 45, category: 'Breakfast', image: 'https://images.unsplash.com/photo-1630587148265-a6c2fa2a3434?q=80&w=800&auto=format&fit=crop', description: 'Crispy rice crepe' },
            { id: crypto.randomUUID(), name: 'Coffee', price: 25, category: 'Beverages', image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800&auto=format&fit=crop', description: 'Hot filter coffee' },
            { id: crypto.randomUUID(), name: 'Tea', price: 20, category: 'Beverages', image: 'https://images.unsplash.com/photo-1517705008128-361805f42e86?q=80&w=800&auto=format&fit=crop', description: 'Masala chai' }
        ];
        saveToStorage(KEYS.menu, items);
        return items;
    }

    function getMenu() { return getFromStorage(KEYS.menu, []); }
    function setMenu(items) { saveToStorage(KEYS.menu, items); }
    function getCart() { return getFromStorage(KEYS.cart, []); }
    function setCart(items) { saveToStorage(KEYS.cart, items); }
    function getTransactions() { return getFromStorage(KEYS.tx, []); }
    function addTransaction(tx) {
        const all = getTransactions();
        all.push(tx);
        saveToStorage(KEYS.tx, all);
    }

    function getReviews() { return getFromStorage(KEYS.reviews, []); }
    function addReview(review) {
        const all = getReviews();
        all.unshift(review);
        saveToStorage(KEYS.reviews, all);
    }

    return {
        KEYS,
        saveToStorage,
        getFromStorage,
        initDefaultMenu,
        getMenu,
        setMenu,
        getCart,
        setCart,
        getTransactions,
        addTransaction,
        getReviews,
        addReview,
    };
})();


