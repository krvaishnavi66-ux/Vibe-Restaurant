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
            { id: crypto.randomUUID(), name: 'Idly', price: 20, category: 'Breakfast', image: 'https://raw.githubusercontent.com/krvaishnavi66-ux/Vibe-Restaurant-Images/main/idli.jpg', description: 'Steamed rice cakes' },
            { id: crypto.randomUUID(), name: 'Chappathi', price: 30, category: 'Breakfast', image: 'https://raw.githubusercontent.com/krvaishnavi66-ux/Vibe-Restaurant-Images/main/chapathi.png', description: 'Whole wheat flatbread' },
            { id: crypto.randomUUID(), name: 'Poori', price: 35, category: 'Breakfast', image: 'https://raw.githubusercontent.com/krvaishnavi66-ux/Vibe-Restaurant-Images/main/poori.jpg', description: 'Deep-fried bread' },
            { id: crypto.randomUUID(), name: 'Vada', price: 15, category: 'Snacks', image: 'https://raw.githubusercontent.com/krvaishnavi66-ux/Vibe-Restaurant-Images/main/vada.jpg', description: 'Crispy lentil fritter' },
            { id: crypto.randomUUID(), name: 'Dosa', price: 45, category: 'Breakfast', image: 'https://raw.githubusercontent.com/krvaishnavi66-ux/Vibe-Restaurant-Images/main/dosa.jpg', description: 'Crispy rice crepe' },
            { id: crypto.randomUUID(), name: 'Coffee', price: 25, category: 'Beverages', image: 'https://raw.githubusercontent.com/krvaishnavi66-ux/Vibe-Restaurant-Images/main/coffee.jpg', description: 'Hot filter coffee' },
            { id: crypto.randomUUID(), name: 'Tea', price: 20, category: 'Beverages', image: 'https://raw.githubusercontent.com/krvaishnavi66-ux/Vibe-Restaurant-Images/main/tea.jpg', description: 'Masala chai' }
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


