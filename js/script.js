// 1. MENU HAMBURGUER
let btnMenu = document.getElementById('btn-hamburguer');
let menu = document.querySelector('.menu-mobile');

btnMenu.addEventListener('click', () => {
    menu.classList.toggle('abrir-menu');
});

menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('abrir-menu');
    });
});

// 2. CARREGAR PRODUTOS DO JSON EXTERNO

async function carregarProdutos() {
    const container = document.getElementById('container-produtos');
    if (!container) return;

    // Detecta se estamos na página inicial ou na página geral
    const ehPaginaHome = container.getAttribute('data-page') === 'home';

    try {
        const resposta = await fetch('produtos.json');
        let produtos = await resposta.json();

        // --- LÓGICA DE FILTRAGEM PARA A HOME ---
        if (ehPaginaHome) {
            produtos = produtos
                .filter(produto => 
                    produto.tags && produto.tags.includes("Coleção Nova")
                ) // Apenas os que têm a tag exata
                .slice(0, 12); // No máximo 12 itens
        }
        // ---------------------------------------

        container.innerHTML = ""; 

        produtos.forEach(produto => {
            const tagTexto = produto.tags && produto.tags.length > 0 ? produto.tags[0] : "";
            const tagClasse = tagTexto.toLowerCase().replace(/\s+/g, '-'); // Evita espaços em classes CSS
            const classesProduto = `tela-produto ${tagTexto ? 'tag ' + tagClasse : ''}`;

            const dotsHTML = produto.imagens.map((_, i) => 
                `<span class="dot ${i === 0 ? 'active' : ''}"></span>`
            ).join('');

            const imgsHTML = produto.imagens.map((img, i) => 
                `<img src="${img}" alt="${produto.nome}" class="${i === 0 ? 'active' : ''}">`
            ).join('');

            container.innerHTML += `
                <div class="${classesProduto}" data-label="${tagTexto}">
                    <div class="slider-produto">
                        ${imgsHTML}
                    </div>
                    <div class="slider-dots">
                        ${dotsHTML}
                    </div>
                    <h3>${produto.nome}</h3>
                    <p>R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                    <button class="comprar-agora"> <i class="bi bi-whatsapp"></i> Comprar Agora</button>
                </div>
            `;
        });

        inicializarSliders();
        inicializarWhatsApp();

    } catch (erro) {
        console.error("Erro ao carregar JSON:", erro);
    }
}

// 3. SLIDERS (PRODUTOS)

function inicializarSliders() {
    // Agora seleciona APENAS os cards de produtos
    const containers = document.querySelectorAll('.tela-produto');

    containers.forEach(container => {
        // Busca imagens APENAS do slider de produtos
        const imgs = container.querySelectorAll('.slider-produto img');
        const dots = container.querySelectorAll('.slider-dots .dot');
        const clickArea = container.querySelector('.slider-produto');
        let index = 0;

        if (!clickArea || imgs.length === 0) return;

        const mostrar = i => {
            imgs.forEach(img => img.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            imgs[i].classList.add('active');
            if (dots[i]) dots[i].classList.add('active');
        };

        clickArea.onclick = () => {
            index = (index + 1) % imgs.length;
            mostrar(index);
        };

        dots.forEach((dot, i) => {
            dot.onclick = (e) => {
                e.stopPropagation();
                index = i;
                mostrar(index);
            };
        });
    });
}

// 4. WHATSAPP
function inicializarWhatsApp() {
    const numeroWhats = "5521987209252";
    
    document.querySelectorAll('.comprar-agora').forEach(botao => {
        botao.onclick = function() {
            const card = this.closest('.tela-produto');
            const nome = card.querySelector('h3').innerText;
            const valor = card.querySelector('p').innerText;
            const img = card.querySelector('img.active').src;

            let msg = `Oi! Quero comprar: ${nome} - ${valor}\nImagem: ${img}`;
            window.open(`https://wa.me/${numeroWhats}?text=${encodeURIComponent(msg)}`, '_blank');
        };
    });
}

// INICIAR TUDO
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos(); // Carrega o JSON e inicia sliders dos produtos
    // Se a Loja Física não depende do JSON, garantimos que o slider dela inicie aqui também
    inicializarSliders(); 
});

// 5. MOSAICO DE FOTOS - LOJA FÍSICA

function trocarFoto(elemento) {
    // 1. Pega o caminho da imagem clicada
    const novaSrc = elemento.src;
    
    // 2. Altera a imagem principal
    document.getElementById('foto-foco').src = novaSrc;
    
    // 3. Remove a classe 'active' de todas as miniaturas
    const minis = document.querySelectorAll('.miniatura');
    minis.forEach(m => m.classList.remove('active'));
    
    // 4. Adiciona 'active' na que foi clicada
    elemento.classList.add('active');
}

