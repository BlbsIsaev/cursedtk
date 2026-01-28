const API_BASE_URL = 'http://localhost:8000';

let currentUser = null;
let token = localStorage.getItem('token');

// Управление видимостью страниц
function showPage(pageId) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    
    // Показать выбранную страницу
    const page = document.getElementById(`${pageId}-page`);
    if (page) {
        page.classList.remove('hidden');
        page.classList.add('active');
    }
    
    // Обновить UI в зависимости от авторизации
    updateAuthUI();
    
    // Загрузить данные для страницы
    if (pageId === 'products') {
        loadProducts();
    } else if (pageId === 'farmers') {
        loadFarmers();
    } else if (pageId === 'dashboard' && currentUser) {
        loadDashboard();
    }
}

// Обновление UI в зависимости от статуса авторизации
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const addProductBtn = document.getElementById('add-product-btn');
    
    if (currentUser) {
        authButtons.classList.add('hidden');
        userMenu.classList.remove('hidden');
        document.getElementById('username-display').textContent = currentUser.username;
        
        // Показывать кнопку добавления продукта только для фермеров
        if (currentUser.is_farmer) {
            addProductBtn.classList.remove('hidden');
        } else {
            addProductBtn.classList.add('hidden');
        }
    } else {
        authButtons.classList.remove('hidden');
        userMenu.classList.add('hidden');
        addProductBtn.classList.add('hidden');
    }
}

// Регистрация
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

// Вход
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
            
            // Получить информацию о пользователе
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

// Получение информации о текущем пользователе
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

// Выход
function logout() {
    currentUser = null;
    token = null;
    localStorage.removeItem('token');
    showPage('home');
}

// Показать/скрыть поля фермера при регистрации
document.getElementById('register-is-farmer')?.addEventListener('change', (e) => {
    const farmerFields = document.getElementById('farmer-fields');
    if (e.target.checked) {
        farmerFields.classList.remove('hidden');
    } else {
        farmerFields.classList.add('hidden');
    }
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    // Если есть токен, получить информацию о пользователе
    if (token) {
        fetchCurrentUser();
    }
    
    // Установить обработчики для навигации
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