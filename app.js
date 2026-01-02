// PRODUTOS DE TESTE (Depois trocaremos pelo Firebase)
const products = [
    { id: 1, name: "Colar Banhado Ouro", price: 159.90 },
    { id: 2, name: "Brinco Zircônia", price: 89.90 },
    { id: 3, name: "Anel Prata 925", price: 120.00 },
    { id: 4, name: "Pulseira Delicada", price: 75.00 }
];

let cart = [];

// Carregar Produtos
function loadProducts() {
    const grid = document.getElementById('products-grid');
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="https://via.placeholder.com/250x250/FFF0F5/D4AF37?text=Joia" class="img-placeholder">
            <h3>${product.name}</h3>
            <span class="price">R$ ${product.price.toFixed(2).replace('.', ',')}</span>
            <button class="btn-add" onclick="addToCart(${product.id})">Comprar</button>
        `;
        grid.appendChild(card);
    });
}

// Carrinho
function addToCart(id) {
    const product = products.find(p => p.id === id);
    cart.push(product);
    renderCart();
    document.getElementById('cart-modal').classList.remove('hidden');
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    const countEl = document.getElementById('cart-count');
    
    container.innerHTML = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <span>${item.name}</span>
            <span>R$ ${item.price.toFixed(2)} <i class="fas fa-trash" onclick="removeItem(${index})" style="color:red; cursor:pointer; margin-left:5px;"></i></span>
        `;
        container.appendChild(div);
    });

    totalEl.innerText = total.toFixed(2).replace('.', ',');
    countEl.innerText = cart.length;
}

function removeItem(index) {
    cart.splice(index, 1);
    renderCart();
}

function toggleModal() {
    document.getElementById('cart-modal').classList.toggle('hidden');
}

function checkoutWhatsApp() {
    if(cart.length === 0) return alert("Carrinho vazio!");
    
    const phone = "5511999999999"; // Depois você edita aqui
    let text = "Olá! Gostaria de pedir:\n";
    let total = 0;
    
    cart.forEach(p => {
        text += `- ${p.name}: R$ ${p.price.toFixed(2)}\n`;
        total += p.price;
    });
    
    text += `\n*Total: R$ ${total.toFixed(2)}*`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`);
}

loadProducts();
