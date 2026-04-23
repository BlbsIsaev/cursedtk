const API_BASE_URL = '/api';

let currentUser = null;
let token = localStorage.getItem('token');


function showPage(pageId) {
    if (pageId === 'admin' && (!currentUser || !currentUser.is_admin)) {
        alert('Требуются права администратора');
        return;
    }

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    

    const page = document.getElementById(`${pageId}-page`);
    if (page) {
        page.classList.remove('hidden');
        page.classList.add('active');
    }
    

    updateAuthUI();
    

    if (pageId === 'products') {
        loadProducts();
    } else if (pageId === 'farmers') {
        loadFarmers();
    } else if (pageId === 'dashboard' && currentUser) {
        loadDashboard();
    } else if (pageId === 'cart') {
        renderCart();
    } else if (pageId === 'orders') {
        renderOrders();
    } else if (pageId === 'admin') {
        loadAdmin?.();
    }
}


function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const addProductBtn = document.getElementById('add-product-btn');
    
    if (currentUser) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
        document.getElementById('username-display').textContent = currentUser.username;
        

        if (currentUser.is_farmer) {
            addProductBtn.classList.remove('hidden');
        } else {
            addProductBtn.classList.add('hidden');
        }

        if (currentUser.is_admin) {
            document.getElementById('admin-btn')?.classList.remove('hidden');
        } else {
            document.getElementById('admin-btn')?.classList.add('hidden');
        }
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
        addProductBtn.classList.add('hidden');
        document.getElementById('admin-btn')?.classList.add('hidden');
    }
}


document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        email: document.getElementById('register-email').value,
        username: document.getElementById('register-username').value,
        full_name: document.getElementById('register-fullname').value,
        password: document.getElementById('register-password').value,
        phone: document.getElementById('register-phone').value,
        is_farmer: document.getElementById('register-is-farmer').checked,
        farm_name: document.getElementById('register-farm-name').value,
        location: document.getElementById('register-location').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        
        if (response.ok) {
            alert('Регистрация успешна! Теперь вы можете войти.');
            showPage('login');
        } else {
            const error = await response.json();
            alert(`Ошибка регистрации: ${error.detail}`);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Ошибка соединения с сервером');
    }
});


document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('username', document.getElementById('login-username').value);
    formData.append('password', document.getElementById('login-password').value);
    
    try {
        const response = await fetch(`${API_BASE_URL}/token`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            token = data.access_token;
            localStorage.setItem('token', token);
            

            await fetchCurrentUser();
            
            showPage('home');
        } else {
            alert('Неверное имя пользователя или пароль');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Ошибка соединения с сервером');
    }
});


async function fetchCurrentUser() {
    if (!token) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            updateAuthUI();
        }
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}


function logout() {
    currentUser = null;
    token = null;
    localStorage.removeItem('token');
    showPage('home');
}


document.getElementById('register-is-farmer')?.addEventListener('change', (e) => {
    const farmerFields = document.getElementById('farmer-fields');
    if (e.target.checked) {
        farmerFields.classList.remove('hidden');
    } else {
        farmerFields.classList.add('hidden');
    }
});


document.addEventListener('DOMContentLoaded', () => {

    if (token) {
        fetchCurrentUser();
    }
    

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            if (page) {
                showPage(page);
            }
        });
    });
});

const CART_KEY = 'cart';
const ORDERS_KEY = 'orders';

function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
}
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }

function addToCart(product) {
    const cart = getCart();
    const existing = cart.find(i => i.product_id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ product_id: product.id, name: product.name, price: product.price, unit: product.unit, quantity: 1 });
    saveCart(cart);
    alert('Товар добавлен в корзину!');
}

function clearCart() { saveCart([]); renderCart(); }

function calcTotal(cart) { return cart.reduce((sum, i) => sum + i.price * i.quantity, 0); }

function renderCart() {
    const emptyBlock = document.getElementById('cart-empty');
    const filledBlock = document.getElementById('cart-filled');
    const cartItems = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const searchEl = document.getElementById('cart-search');

    if (!emptyBlock || !filledBlock || !cartItems || !totalEl) return;

    const cart = getCart();

    if (cart.length === 0) {
        emptyBlock.classList.remove('hidden');
        filledBlock.classList.add('hidden');
        return;
    }

    emptyBlock.classList.add('hidden');
    filledBlock.classList.remove('hidden');

    const q = (searchEl?.value || '').toLowerCase();
    cartItems.innerHTML = '';

    cart
        .filter(i => i.name.toLowerCase().includes(q))
        .forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-image">
                    <i class="fas fa-shopping-basket"></i>
                </div>
                <div class="product-info">
                    <h3>${item.name}</h3>
                    <div class="product-price">${item.price} ₽/${item.unit}</div>
                    <p>Количество:
                        <button class="btn btn-outline" style="padding:2px 8px" data-dec="${item.product_id}">-</button>
                        <strong>${item.quantity}</strong>
                        <button class="btn btn-outline" style="padding:2px 8px" data-inc="${item.product_id}">+</button>
                    </p>
                    <p><strong>Сумма:</strong> ${item.price * item.quantity} ₽</p>
                    <button class="btn btn-outline btn-block" data-remove="${item.product_id}">Удалить</button>
                </div>
            `;
            cartItems.appendChild(card);
        });

    totalEl.textContent = calcTotal(cart);

    cartItems.querySelectorAll('[data-inc]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-inc'));
            const cart = getCart();
            const it = cart.find(i => i.product_id === id);
            if (it) it.quantity += 1;
            saveCart(cart);
            renderCart();
        });
    });

    cartItems.querySelectorAll('[data-dec]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-dec'));
            const cart = getCart();
            const it = cart.find(i => i.product_id === id);
            if (it) it.quantity = Math.max(1, it.quantity - 1);
            saveCart(cart);
            renderCart();
        });
    });

    cartItems.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-remove'));
            const cart = getCart().filter(i => i.product_id !== id);
            saveCart(cart);
            renderCart();
        });
    });
}


document.getElementById('cart-search')?.addEventListener('input', renderCart);


document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!token) {
        alert('Войдите в аккаунт для оформления заказа');
        showPage('login');
        return;
    }

    const cart = getCart();
    if (cart.length === 0) {
        alert('Корзина пуста');
        showPage('cart');
        return;
    }

    const deliveryAddress = document.getElementById('delivery-address').value;

    try {
        const payload = {
            items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
            delivery_address: deliveryAddress
        };

        const resp = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!resp.ok) {
            const err = await resp.json().catch(() => ({}));
            alert(`Ошибка оформления: ${err.detail || 'неизвестно'}`);
            return;
        }

        const order = await resp.json();
        const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
        orders.unshift({ ...order, created_local: new Date().toISOString(), items_local: cart });
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

        saveCart([]);
        alert('Заказ оформлен!');
        showPage('orders');
    } catch (error) {
        console.error(error);
        alert('Ошибка соединения с сервером');
    }
});


function renderOrders() {
    const box = document.getElementById('orders-list');
    if (!box) return;

    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const q = (document.getElementById('orders-search')?.value || '').toLowerCase();

    box.innerHTML = '';

    if (orders.length === 0) {
        box.innerHTML = `<div class="farmer-card"><h3>Заказов пока нет</h3><p>Оформите заказ в каталоге.</p></div>`;
        return;
    }

    orders
        .filter(o => String(o.id).includes(q))
        .forEach(o => {
            const card = document.createElement('div');
            card.className = 'farmer-card';
            const items = (o.items_local || []).map(i => `${i.name} × ${i.quantity}`).join('<br>');
            card.innerHTML = `
                <h3>Заказ #${o.id}</h3>
                <p><strong>Статус:</strong> ${o.status || 'pending'}</p>
                <p><strong>Сумма:</strong> ${o.total_amount} ₽</p>
                <p><strong>Товары:</strong><br>${items || '—'}</p>
            `;
            box.appendChild(card);
        });
}
document.getElementById('orders-search')?.addEventListener('input', renderOrders);
