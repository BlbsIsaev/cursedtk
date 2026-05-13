async function loadProducts(category = '') {
    try {
        const url = category ? 
            `${API_BASE_URL}/products?category=${category}` : 
            `${API_BASE_URL}/products`;
            
        const response = await fetch(url);
        const products = await response.json();
        
        const productsList = document.getElementById('products-list');
        productsList.innerHTML = '';
        
        products.forEach(product => {
            const productCard = createProductCard(product);
            productsList.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('products-list').innerHTML = 
            '<p>Ошибка загрузки продуктов</p>';
    }
}


function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const categoryImages = {
        'овощи': 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&w=400&q=80',
        'фрукты': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80',
        'молочные': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80',
        'мясо': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc18f?auto=format&fit=crop&w=400&q=80',
        'зерновые': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
        'default': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=400&q=80'
    };
    
    const imageUrl = product.image_url || categoryImages[product.category] || categoryImages['default'];
    
    card.innerHTML = `
        <div class="product-image" style="background-image: url('${imageUrl}')">
            ${product.organic_certified ? '<div class="product-badge"><i class="fas fa-leaf text-primary"></i> Эко</div>' : ''}
        </div>
        <div class="product-info">
            <div class="product-category">${product.category || 'Продукт'}</div>
            <h3>${product.name}</h3>
            <p class="text-muted" style="margin-bottom: 1rem; font-size: 0.9rem; flex-grow: 1;">${product.description || ''}</p>
            <div class="product-farmer"><i class="fas fa-user-circle"></i> Фермер #${product.farmer_id}</div>
            
            <div class="product-price-row">
                <div class="product-price">${product.price} ₽ <span class="product-unit">/ ${product.unit}</span></div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">В наличии: ${product.stock_quantity}</div>
            </div>
        </div>
    `;

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary btn-block';
    addBtn.textContent = 'Добавить в корзину';
    addBtn.addEventListener('click', () => {
        addToCart(product);
        if (document.getElementById('cart-page')?.classList.contains('active')) {
            renderCart();
        }
    });
    card.querySelector('.product-info')?.appendChild(addBtn);
    
    return card;
}


function getProductIcon(category) {
    const icons = {
        'овощи': 'fa-carrot',
        'фрукты': 'fa-apple-alt',
        'молочные': 'fa-egg',
        'мясо': 'fa-drumstick-bite',
        'зерновые': 'fa-wheat-alt'
    };
    
    return icons[category] || 'fa-shopping-basket';
}


async function loadFarmers() {
    try {
        const response = await fetch(`${API_BASE_URL}/farmers`);
        const farmers = await response.json();
        
        const farmersList = document.getElementById('farmers-list');
        farmersList.innerHTML = '';
        
        const farmerImages = [
            'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1595859702882-9f6974fb1661?auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
        ];

        farmers.forEach((farmer, index) => {
            const farmerCard = document.createElement('div');
            farmerCard.className = 'farmer-card';
            
            const avatarUrl = farmerImages[index % farmerImages.length];
            
            farmerCard.innerHTML = `
                <div class="farmer-avatar" style="background-image: url('${avatarUrl}'); background-size: cover; background-position: center; border: none;"></div>
                <h3>${farmer.farm_name || farmer.full_name || farmer.username}</h3>
                <p class="text-muted" style="margin-bottom: 1rem;">${farmer.farm_description || 'Локальный производитель эко-продуктов'}</p>
                <div class="farmer-location"><i class="fas fa-map-marker-alt" style="color: var(--primary-color);"></i> ${farmer.location || 'Местоположение не указано'}</div>
                <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1.5rem;">
                    <div><i class="fas fa-envelope"></i> ${farmer.email}</div>
                    ${farmer.phone ? `<div><i class="fas fa-phone"></i> ${farmer.phone}</div>` : ''}
                </div>
                <button class="btn btn-outline btn-block" onclick="viewFarmerProducts(${farmer.id})">
                    Смотреть продукты
                </button>
            `;
            
            farmersList.appendChild(farmerCard);
        });
    } catch (error) {
        console.error('Error loading farmers:', error);
        document.getElementById('farmers-list').innerHTML = 
            '<p>Ошибка загрузки списка фермеров</p>';
    }
}


function viewFarmerProducts(farmerId) {
    if (typeof showToast === 'function') {
        showToast(`Просмотр продуктов фермера ID: ${farmerId} (в разработке)`, 'success');
    } else {
        alert(`Просмотр продуктов фермера ID: ${farmerId}`);
    }
}


async function loadDashboard() {
    if (!currentUser) return;
    

    const userInfoContent = document.getElementById('user-info-content');
    userInfoContent.innerHTML = `
        <p><strong>Имя пользователя:</strong> ${currentUser.username}</p>
        <p><strong>Email:</strong> ${currentUser.email}</p>
        <p><strong>Полное имя:</strong> ${currentUser.full_name || 'Не указано'}</p>
        ${currentUser.is_farmer ? `
            <p><strong>Статус:</strong> Фермер</p>
            <p><strong>Название фермы:</strong> ${currentUser.farm_name || 'Не указано'}</p>
            <p><strong>Местоположение:</strong> ${currentUser.location || 'Не указано'}</p>
        ` : '<p><strong>Статус:</strong> Покупатель</p>'}
    `;
    

    if (currentUser.is_farmer) {
        try {
            const response = await fetch(`${API_BASE_URL}/farmers/${currentUser.id}/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const products = await response.json();
                const productsList = document.getElementById('user-products-list');
                productsList.innerHTML = '';
                
                if (products.length === 0) {
                    productsList.innerHTML = '<p>У вас пока нет продуктов</p>';
                } else {
                    products.forEach(product => {
                        const productElement = document.createElement('div');
                        productElement.className = 'product-item';
                        productElement.innerHTML = `
                            <h4>${product.name}</h4>
                            <p>Цена: ${product.price} ₽/${product.unit}</p>
                            <p>Количество: ${product.stock_quantity}</p>
                        `;
                        productsList.appendChild(productElement);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading user products:', error);
        }
    }
}


document.getElementById('add-product-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser || !currentUser.is_farmer) {
        if (typeof showToast === 'function') showToast('Только фермеры могут добавлять продукты', 'error');
        else alert('Только фермеры могут добавлять продукты');
        return;
    }
    
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value,
        image_url: document.getElementById('product-image-url')?.value || null,
        organic_certified: document.getElementById('product-organic').checked,
        stock_quantity: parseInt(document.getElementById('product-quantity').value),
        unit: document.getElementById('product-unit').value
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            if (typeof showToast === 'function') showToast('Продукт успешно добавлен!');
            else alert('Продукт успешно добавлен!');
            showPage('products');
        } else {
            const error = await response.json();
            if (typeof showToast === 'function') showToast(`Ошибка: ${error.detail}`, 'error');
            else alert(`Ошибка: ${error.detail}`);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        if (typeof showToast === 'function') showToast('Ошибка соединения с сервером', 'error');
        else alert('Ошибка соединения с сервером');
    }
});

async function loadAdmin() {
    if (!currentUser || !currentUser.is_admin) return;

    const usersBox = document.getElementById('admin-users');
    const productsBox = document.getElementById('admin-products');
    const ordersBox = document.getElementById('admin-orders');

    if (!usersBox || !productsBox || !ordersBox) return;

    try {
        const [usersResp, productsResp, ordersResp] = await Promise.all([
            fetch(`${API_BASE_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/admin/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/admin/orders`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (usersResp.ok) {
            const users = await usersResp.json();
            usersBox.innerHTML = '';
            users.forEach(u => {
                const card = document.createElement('div');
                card.className = 'farmer-card';
                card.innerHTML = `
                    <h3>${u.username}</h3>
                    <p>${u.email}</p>
                    <p>Роль: ${u.is_admin ? 'Админ' : (u.is_farmer ? 'Фермер' : 'Покупатель')}</p>
                `;
                usersBox.appendChild(card);
            });
        } else {
            usersBox.innerHTML = '<p>Ошибка загрузки пользователей</p>';
        }

        if (productsResp.ok) {
            const products = await productsResp.json();
            productsBox.innerHTML = '';
            products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <p>${p.description || ''}</p>
                        <div class="product-price">${p.price} ₽/${p.unit}</div>
                        <p>Фермер ID: ${p.farmer_id}</p>
                    </div>
                `;
                productsBox.appendChild(card);
            });
        } else {
            productsBox.innerHTML = '<p>Ошибка загрузки товаров</p>';
        }

        if (ordersResp.ok) {
            const orders = await ordersResp.json();
            ordersBox.innerHTML = '';
            orders.forEach(o => {
                const card = document.createElement('div');
                card.className = 'farmer-card';
                const items = (o.items || []).map(i => `#${i.product_id} × ${i.quantity}`).join('<br>') || '—';
                card.innerHTML = `
                    <h3>Заказ #${o.id}</h3>
                    <p>Покупатель ID: ${o.customer_id}</p>
                    <p>Статус: ${o.status}</p>
                    <p>Сумма: ${o.total_amount} ₽</p>
                    <p><strong>Товары:</strong><br>${items}</p>
                `;
                ordersBox.appendChild(card);
            });
        } else {
            ordersBox.innerHTML = '<p>Ошибка загрузки заказов</p>';
        }
    } catch (error) {
        console.error('Admin load error:', error);
        usersBox.innerHTML = '<p>Ошибка соединения с сервером</p>';
        productsBox.innerHTML = '<p>Ошибка соединения с сервером</p>';
        ordersBox.innerHTML = '<p>Ошибка соединения с сервером</p>';
    }
}
