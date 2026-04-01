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
    
    card.innerHTML = `
        <div class="product-image">
            <i class="fas ${getProductIcon(product.category)}"></i>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description || ''}</p>
            <div class="product-price">${product.price} ₽/${product.unit}</div>
            <p>В наличии: ${product.stock_quantity} ${product.unit}</p>
            ${product.organic_certified ? 
                '<span class="organic-badge">Органический</span>' : ''}
            <p><small>Продавец: ${product.farmer_id}</small></p>
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
        
        farmers.forEach(farmer => {
            const farmerCard = document.createElement('div');
            farmerCard.className = 'farmer-card';
            
            farmerCard.innerHTML = `
                <i class="fas fa-user-tie fa-3x" style="color: #40916c; margin-bottom: 1rem;"></i>
                <h3>${farmer.farm_name || farmer.full_name || farmer.username}</h3>
                <p>${farmer.farm_description || 'Локальный фермер'}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${farmer.location || 'Не указано'}</p>
                <p><i class="fas fa-envelope"></i> ${farmer.email}</p>
                ${farmer.phone ? `<p><i class="fas fa-phone"></i> ${farmer.phone}</p>` : ''}
                <button class="btn btn-outline" onclick="viewFarmerProducts(${farmer.id})">
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

    alert(`Просмотр продуктов фермера ID: ${farmerId}`);
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
        alert('Только фермеры могут добавлять продукты');
        return;
    }
    
    const productData = {
        name: document.getElementById('product-name').value,
        description: document.getElementById('product-description').value,
        price: parseFloat(document.getElementById('product-price').value),
        category: document.getElementById('product-category').value,
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
            alert('Продукт успешно добавлен!');
            showPage('products');
        } else {
            const error = await response.json();
            alert(`Ошибка: ${error.detail}`);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Ошибка соединения с сервером');
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
