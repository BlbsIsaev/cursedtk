// Загрузка продуктов
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

// Создание карточки продукта
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
    
    return card;
}

// Получение иконки для категории продукта
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

// Загрузка фермеров
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

// Просмотр продуктов фермера
function viewFarmerProducts(farmerId) {
    // Реализация просмотра продуктов конкретного фермера
    alert(`Просмотр продуктов фермера ID: ${farmerId}`);
}

// Загрузка дашборда
async function loadDashboard() {
    if (!currentUser) return;
    
    // Загрузка информации о пользователе
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
    
    // Загрузка продуктов фермера
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

// Добавление нового продукта
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