document.getElementById('category-filter')?.addEventListener('change', function() {
    loadProducts(this.value);
});


document.addEventListener('DOMContentLoaded', function() {

    if (document.getElementById('products-page').classList.contains('active')) {
        loadProducts();
    }
    

    const categoryLinks = document.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            loadProducts(category);
        });
    });
});