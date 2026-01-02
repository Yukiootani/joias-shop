// --- CONFIGURAÇÃO DO FIREBASE ---
// Cole suas chaves do Firebase Console aqui:
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER",
    appId: "SEU_APP_ID"
};

// Inicializar
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// --- VARIÁVEIS GLOBAIS ---
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('joiasCart')) || [];
let currentFilter = 'pronta-entrega';
let currentSecao = 'todos';

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAllProducts();
    updateCartUI();
});

// --- BUSCAR PRODUTOS DO FIREBASE ---
async function fetchAllProducts() {
    const grid = document.getElementById('products-grid');
    const loading = document.getElementById('loading-message');

    try {
        const snap = await db.collection("products").get();
        
        if(snap.empty){
            loading.innerHTML = "Nenhum produto cadastrado.";
            return;
        }

        allProducts = [];
        snap.forEach(doc => {
            let data = doc.data();
            // Normalizar dados para busca
            data.id = doc.id;
            data.searchSource = (data.source || '').toLowerCase().replace(' ', '-');
            data.searchSecao = (data.secao || '').toLowerCase(); // ex: 'colares', 'brincos'
            allProducts.push(data);
        });

        renderProducts();

    } catch(e) {
        console.error(e);
        loading.innerHTML = "Erro ao carregar produtos. Verifique sua conexão.";
    }
}

// --- RENDERIZAR NA TELA ---
function renderProducts() {
    const grid = document.getElementById('products-grid');
    const loading = document.getElementById('loading-message');
    const searchTerm = document.getElementById('search-input').value.toLowerCase();

    loading.style.display = 'none';
    grid.innerHTML = '';

    // Filtragem
    let filtered = allProducts.filter(p => {
        // Filtro por Tipo (Pronta entrega / Encomenda)
        let matchSource = p.searchSource.includes(currentFilter) || p.searchSource === '';
        // Filtro por Categoria (Colar, Brinco...)
        let matchSecao = currentSecao === 'todos' || p.searchSecao === currentSecao;
        // Filtro por Texto (Busca)
        let matchText = p.name.toLowerCase().includes(searchTerm);

        return matchSource && matchSecao && matchText;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:#999;">Nenhum item encontrado.</p>';
        return;
    }

    // Criar Cards
    filtered.forEach(p => {
        const price = parseFloat(p.price || 0);
        let badge = '';
        if(p.isFeatured === 'novo') badge = '<span class="badge badge-novo">Novo</span>';
        if(p.estoqueTotal <= 0 && currentFilter === 'pronta-entrega') badge = '<span class="badge badge-esgotado">Esgotado</span>';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            ${badge}
            <div class="product-image-container">
                <img src="${p.imageUrl || 'https://via.placeholder.com/300?text=Joia'}" class="product-image">
            </div>
            <div class="product-info">
                <div>
                    <h3 class="product-name">${p.name}</h3>
                    <span class="product-price">R$ ${price.toFixed(2).replace('.', ',')}</span>
                </div>
                <button class="btn-add" onclick="addToCart('${p.id}')">
                    Adicionar <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- LÓGICA DO CARRINHO ---

function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    if(!product) return;

    cart.push(product);
    saveCart();
    updateCartUI();
    toggleCart(); // Abre o modal
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('joiasCart', JSON.stringify(cart));
}

function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const itemsContainer = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    
    // Atualiza bolinha
    countEl.innerText = cart.length;
    countEl.style.display = cart.length > 0 ? 'flex' : 'none';

    // Lista itens
    itemsContainer.innerHTML = '';
    let total = 0;

    if(cart.length === 0) {
        itemsContainer.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">Sua sacola está vazia.</p>';
    } else {
        cart.forEach((item, index) => {
            let price = parseFloat(item.price);
            total += price;
            
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    <small>R$ ${price.toFixed(2).replace('.', ',')}</small>
                </div>
                <i class="fas fa-trash" style="color:red; cursor:pointer;" onclick="removeFromCart(${index})"></i>
            `;
            itemsContainer.appendChild(div);
        });
    }

    totalEl.innerText = 'R$ ' + total.toFixed(2).replace('.', ',');
}

// --- CONTROLES DE INTERFACE ---

function toggleCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.toggle('show');
}

// Botões de Categoria (Colares, Brincos...)
document.querySelectorAll('.secao-button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.secao-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSecao = btn.dataset.secao;
        renderProducts();
    });
});

// Botões de Filtro (Pronta Entrega / Encomenda)
document.querySelectorAll('.filter-button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderProducts();
    });
});

// Busca
document.getElementById('search-input').addEventListener('input', renderProducts);

// --- CHECKOUT WHATSAPP ---
function checkoutWhatsApp() {
    if(cart.length === 0) return alert('Sua sacola está vazia!');

    const phone = "5511999999999"; // COLOQUE SEU NÚMERO AQUI (apenas números)
    
    let msg = "Olá! Gostaria de finalizar meu pedido na Lumière Joias:\n\n";
    let total = 0;

    cart.forEach(item => {
        let price = parseFloat(item.price);
        msg += `▪ ${item.name} - R$ ${price.toFixed(2).replace('.', ',')}\n`;
        total += price;
    });

    msg += `\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;
    msg += "\n\nAguardo instruções de pagamento.";

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
}
