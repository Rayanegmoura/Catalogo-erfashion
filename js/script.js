// 1. MENU HAMBURGUER MOBILE
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

// ==========================================
// 2. SISTEMA DE PRODUTOS E FILTROS EXCLUSIVE
// ==========================================

let produtosOriginais = []; 

async function carregarProdutos() {
    const container = document.getElementById('container-produtos');
    if (!container) return;

    try {
        const resposta = await fetch('produtos.json');
        const dados = await resposta.json();

        if (dados.site_em_manutencao === true) {
            window.location.href = 'manutencao.html';
            return;
        }

        const agora = new Date();
        const hora = agora.getHours();
        const horarioVip = (hora >= 21 || hora < 11);
        const temSenha = localStorage.getItem('acessoVip') === 'true';

        if (dados.modo_vip === true && horarioVip && !temSenha) {
            window.location.href = 'vip.html';
            return;
        }

        produtosOriginais = dados.produtos;
        aplicarFiltros(); 

    } catch (erro) {
        console.error("Erro ao carregar JSON:", erro);
    }
}

function aplicarFiltros() {
    const container = document.getElementById('container-produtos');
    const filtroTag = document.getElementById('filtro-tag')?.value || "todos";
    const filtroPreco = document.getElementById('filtro-preco')?.value || "padrao";
    const ehPaginaHome = container.getAttribute('data-page') === 'home';

    let resultado = [...produtosOriginais];

    // 1. FILTRAR POR TAG
    if (filtroTag !== "todos") {
        resultado = resultado.filter(p => p.tags && p.tags.includes(filtroTag));
    }

    // 2. ORDENAÇÃO INTELIGENTE
    const PESOS = { "Coleção Nova": 1, "Destaque": 2, "Promoção": 3 };

    resultado.sort((a, b) => {
        // Se o usuário selecionou uma ordem de preço, o preço MANDA em tudo (Global)
        if (filtroPreco === "menor") return a.preco - b.preco;
        if (filtroPreco === "maior") return b.preco - a.preco;

        // Se estiver no "padrao", mantém a hierarquia Coleção > Destaque > Promo
        const pesoA = PESOS[a.tags?.[0]] || 99;
        const pesoB = PESOS[b.tags?.[0]] || 99;
        return pesoA - pesoB;
    });

    // 3. LIMITAR PARA A HOME (Apenas se não houver filtro ativo para não bugar a navegação)
    if (ehPaginaHome && filtroTag === "todos" && filtroPreco === "padrao") {
        resultado = resultado
            .filter(p => p.tags && p.tags.includes("Coleção Nova"))
            .slice(0, 12);
    }

    renderizarNoHTML(resultado);
}

function renderizarNoHTML(produtos) {
    const container = document.getElementById('container-produtos');
    container.innerHTML = ""; 

    produtos.forEach(produto => {
        const tagTexto = produto.tags && produto.tags.length > 0 ? produto.tags[0] : "";
        const tagClasse = tagTexto.toLowerCase().replace(/\s+/g, '-'); 
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
}

// LIGA OS FILTROS AOS EVENTOS
document.getElementById('filtro-tag')?.addEventListener('change', aplicarFiltros);
document.getElementById('filtro-preco')?.addEventListener('change', aplicarFiltros);

// 3. SLIDERS (PRODUTOS)
function inicializarSliders() {
    const containers = document.querySelectorAll('.tela-produto');
    containers.forEach(container => {
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
    carregarProdutos();
});

// 5. MOSAICO DE FOTOS - LOJA FÍSICA
function trocarFoto(elemento) {
    document.getElementById('foto-foco').src = elemento.src;
    const minis = document.querySelectorAll('.miniatura');
    minis.forEach(m => m.classList.remove('active'));
    elemento.classList.add('active');
}