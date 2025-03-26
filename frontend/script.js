document.getElementById('searchInput')?.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        searchGadget();
    }
});

function searchGadget() {
    let query = document.getElementById('searchInput').value.trim();
    if (query) {
        alert('Searching for ' + query);
    }
}

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function () {
        alert('Added to cart: ' + this.dataset.name);
    });
});
