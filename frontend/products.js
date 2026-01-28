// Дополнительные функции для работы с продуктами

// Применение фильтров
document.getElementById('category-filter')?.addEventListener('change', function() {
    loadProducts(this.value);
});

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Если мы на странице продуктов, загружаем их
    if (document.getElementById('products-page').classList.contains('active')) {
        loadProducts();
    }
    
    // Обработка навигации по категориям
    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            loadProducts(category);
        });
    });
});