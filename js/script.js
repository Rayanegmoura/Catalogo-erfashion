// ==========================================
// 0. CONTROLE DE ACESSO GLOBAL (MANUTENÇÃO E VIP)
// ==========================================

async function controlarAcesso() {
    try {
        // Busca o JSON sempre do servidor, nunca do cache
        const resposta = await fetch('produtos.json', { cache: "no-store" });
        const dados = await resposta.json();

        const agora = new Date();
        const horaBrasilia = new Date(agora.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
        const horaAtual = horaBrasilia.getHours();

        // 1. Verificação de Manutenção
        if (dados.site_em_manutencao) {
            window.location.href = 'manutencao.html';
            return;
        }

        const inicio = dados.hora_inicio_vip;
        const fim = dados.hora_fim_vip;

        // --- ONDE COLOCAR O NOVO TRECHO ---
        // Se o modo VIP for desligado MANUALMENTE ou o HORÁRIO acabar, limpa o acesso
        if (!dados.modo_vip || (horaAtual < inicio || horaAtual >= fim)) {
            sessionStorage.removeItem('acesso_vip_concedido');
            
            // Se ele estiver em uma página que não seja a index ou vip, manda pra home
            // (Opcional: garante que ninguém fique "preso" em páginas VIP após o fim do horário)
        }
        // ----------------------------------

        // 2. Lógica de Redirecionamento VIP
        if (dados.modo_vip && (horaAtual >= inicio && horaAtual < fim)) {
            const jaLogouVip = sessionStorage.getItem('acesso_vip_concedido');
            
            if (!jaLogouVip) {
                // Se não está logado e não está na página VIP, redireciona para lá
                if (!window.location.pathname.includes('vip.html')) {
                    window.location.href = 'vip.html';
                }
            }
        }
    } catch (erro) {
        console.error("Erro na validação:", erro);
    }
}

controlarAcesso();


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

        // Aqui ele apenas carrega os produtos. 
        // A decisão de "quem pode ver a página" fica no <head> do HTML ou na vip.html
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

    // 1. Filtro de categoria
    if (filtroTag !== "todos") {
        resultado = resultado.filter(p => p.tags && p.tags.includes(filtroTag));
    }

    // 2. Ordenação Inteligente
    resultado.sort((a, b) => {
        if (filtroPreco === "menor") return a.preco - b.preco;
        if (filtroPreco === "maior") return b.preco - a.preco;

        // Função para definir a prioridade
        const getPeso = (produto) => {
            const tag = produto.tags && produto.tags[0];
            if (tag === "Coleção Nova") return 1;
            if (tag === "Promoção") return 3;
            return 2; // Produtos sem tag ou com tags comuns (Destaque, etc)
        };

        return getPeso(a) - getPeso(b);
    });

    // 3. Regra da Home (Mantém seus 12 produtos de Coleção Nova)
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
        const tagTexto = produto.tags?.[0] || "";
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
                <div class="slider-produto">${imgsHTML}</div>
                <div class="slider-dots">${dotsHTML}</div>
                <h3>${produto.nome}</h3>
                <p>R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                <button class="comprar-agora"> <i class="bi bi-whatsapp"></i> Comprar Agora</button>
            </div>
        `;
    });

    inicializarSliders();
    inicializarWhatsApp();
}

// FILTROS
document.getElementById('filtro-tag')?.addEventListener('change', aplicarFiltros);
document.getElementById('filtro-preco')?.addEventListener('change', aplicarFiltros);

// 3. SLIDERS
function inicializarSliders() {
    const containers = document.querySelectorAll('.tela-produto');
    containers.forEach(container => {
        const imgs = container.querySelectorAll('.slider-produto img');
        const dots = container.querySelectorAll('.slider-dots .dot');
        const clickArea = container.querySelector('.slider-produto');
        let index = 0;
        if (!clickArea || imgs.length === 0) return;

        clickArea.onclick = () => {
            index = (index + 1) % imgs.length;
            imgs.forEach(img => img.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            imgs[index].classList.add('active');
            if (dots[index]) dots[index].classList.add('active');
        };
    });
}

// 4. WHATSAPP
function inicializarWhatsApp() {
    const numeroWhats = "5521987209252";
    document.querySelectorAll('.comprar-agora').forEach(botao => {
        botao.onclick = function () {
            const card = this.closest('.tela-produto');
            const nome = card.querySelector('h3').innerText;
            const valor = card.querySelector('p').innerText;
            const img = card.querySelector('img.active').src;
            let msg = `Oi! Quero comprar: ${nome} - ${valor}\nImagem: ${img}`;
            window.open(`https://wa.me/${numeroWhats}?text=${encodeURIComponent(msg)}`, '_blank');
        };
    });
}

// INICIAR
document.addEventListener('DOMContentLoaded', carregarProdutos);

// 5. MOSAICO DE FOTOS - LOJA FÍSICA
function trocarFoto(elemento) {
    document.getElementById('foto-foco').src = elemento.src;
    const minis = document.querySelectorAll('.miniatura');
    minis.forEach(m => m.classList.remove('active'));
    elemento.classList.add('active');
}