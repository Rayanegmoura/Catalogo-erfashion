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
                <button class="comprar-agora"> <i class="bi bi-whatsapp"></i> Quero esse look</button>
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




// 6. CARRINHO
let carrinho = JSON.parse(localStorage.getItem('carrinho_erfashion')) || [];

// Mantendo sua função principal
function renderizarNoHTML(produtos) {
    const container = document.getElementById('container-produtos');
    const ehPaginaTodos = container && container.getAttribute('data-page') === 'todos';
    
    if (ehPaginaTodos) container.classList.add('pag-produtos');
    if (!container) return;

    container.innerHTML = "";

    produtos.forEach((produto, index) => {
        const tagTexto = produto.tags?.[0] || "";
        const tagClasse = tagTexto.toLowerCase().replace(/\s+/g, '-');
        
        let botoesHTML = `<button class="comprar-agora" onclick="enviarUmProduto('${produto.nome}', '${produto.preco}', '${produto.imagens[0]}')"> 
                            <i class="bi bi-whatsapp"></i> Quero esse look
                          </button>`;

        if (ehPaginaTodos) {
            botoesHTML = `
                <div class="botoes-container">
                    <button class="comprar-agora" onclick="enviarUmProduto('${produto.nome}', '${produto.preco}', '${produto.imagens[0]}')">Quero esse look</button>
                    <button class="add-carrinho" onclick="adicionarAoCarrinho(${JSON.stringify(produto).replace(/"/g, '&quot;')})">
                        <i class="bi bi-cart-plus"></i>
                    </button>
                </div>`;
        }

        container.innerHTML += `
            <div class="tela-produto ${tagTexto ? 'tag ' + tagClasse : ''}" data-label="${tagTexto}">
                <div class="slider-produto">
                    ${produto.imagens.map((img, i) => `<img src="${img}" class="${i === 0 ? 'active' : ''}">`).join('')}
                </div>
                <div class="slider-dots">
                    ${produto.imagens.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
                </div>
                <h3>${produto.nome}</h3>
                <p>R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                ${botoesHTML}
            </div>
        `;
    });

    inicializarSliders();
    
    // 2. ADIÇÃO AQUI: Garante que o carrinho apareça se já houver itens salvos
    atualizarBotaoCarrinho();
    renderizarItensCarrinho();
}

function toggleCarrinho() {
    const lateral = document.getElementById('carrinho-lateral');
    const overlay = document.getElementById('overlay-carrinho');
    if(lateral) lateral.classList.toggle('aberto');
    if(overlay) overlay.style.display = lateral.classList.contains('aberto') ? 'block' : 'none';
}

function adicionarAoCarrinho(produto) {
    carrinho.push(produto);
    atualizarBotaoCarrinho(); 
    renderizarItensCarrinho();
    mostrarToast(produto.nome); // 3. CHAMA O AVISO AQUI
}

function atualizarBotaoCarrinho() {
    const btn = document.getElementById('carrinho-flutuante');
    if (!btn) return;

    if (carrinho.length > 0) {
        btn.style.display = 'flex';
        btn.innerHTML = `<i class="bi bi-cart-fill"></i> ${carrinho.length} itens - Ver sacola`;
        
        // 4. SALVA NO NAVEGADOR AQUI
        localStorage.setItem('carrinho_erfashion', JSON.stringify(carrinho));
    } else {
        btn.style.display = 'none';
        localStorage.removeItem('carrinho_erfashion');
    }
}

function renderizarItensCarrinho() {
    const lista = document.getElementById('itens-carrinho-lista');
    const totalElemento = document.getElementById('carrinho-total-valor');
    
    if(!lista) return;

    lista.innerHTML = "";
    let total = 0;

    carrinho.forEach((item, index) => {
        total += item.preco;
        lista.innerHTML += `
            <div class="item-carrinho">
                <img src="${item.imagens[0]}" alt="${item.nome}">
                <div class="item-info">
                    <h4>${item.nome}</h4>
                    <p>R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                    <button onclick="removerItem(${index})" class="btn-remover">Remover</button>
                </div>
            </div>
        `;
    });

    if(totalElemento) totalElemento.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

function removerItem(index) {
    carrinho.splice(index, 1);
    atualizarBotaoCarrinho();
    renderizarItensCarrinho();
}

function enviarCarrinho() {
    const numeroWhats = "5521987209252";
    if (carrinho.length === 0) return;

    const baseLink = window.location.href.includes("github.io") 
        ? window.location.href.split('/produtos.html')[0] 
        : window.location.origin;

    let texto = "✨ *NOVO PEDIDO - ER FASHION* ✨\n";
    texto += "------------------------------------------\n";
    
    let total = 0;
    carrinho.forEach((item, i) => {
        const precoFormatado = item.preco.toFixed(2).replace('.', ',');
        const caminhoLimpo = item.imagens[0].startsWith('/') ? item.imagens[0].substring(1) : item.imagens[0];
        const linkImagem = `${baseLink}/${caminhoLimpo}`;
        
        texto += `*${i + 1}. ${item.nome.toUpperCase()}*\n`;
        texto += `💰 Preço: R$ ${precoFormatado}\n`;
        texto += `🔗 Ver foto: ${linkImagem}\n`;
        texto += `------------------------------------------\n`;
        total += item.preco;
    });

    const totalFinal = total.toFixed(2).replace('.', ',');
    texto += `\n🛍️ *RESUMO DO PEDIDO*\n`;
    texto += `🔢 Quantidade: ${carrinho.length} itens\n`;
    texto += `\n💳 *TOTAL: R$ ${totalFinal}*`;

    window.open(`https://wa.me/${numeroWhats}?text=${encodeURIComponent(texto)}`, '_blank');

    // 5. LIMPA O CARRINHO APÓS O ENVIO (OPCIONAL - COM CONFIRMAÇÃO)
    setTimeout(() => {
        if(confirm("Deseja esvaziar sua sacola para uma nova compra?")) {
            carrinho = [];
            localStorage.removeItem('carrinho_erfashion');
            atualizarBotaoCarrinho();
            renderizarItensCarrinho();
            toggleCarrinho();
        }
    }, 2000);
}

function enviarUmProduto(nome, preco, img) {
    const numeroWhats = "5521987209252";
    const precoFormatado = parseFloat(preco).toFixed(2).replace('.', ',');
    const linkImagem = `${window.location.origin}/${img}`;

    let msg = `✨ *INTERESSE EM PRODUTO ÚNICO* ✨\n\n`;
    msg += `👗 *Look:* ${nome.toUpperCase()}\n`;
    msg += `💰 *Valor:* R$ ${precoFormatado}\n\n`;
    msg += `📸 *Imagem:* ${linkImagem}\n\n`;
    msg += `Poderia me informar a disponibilidade de tamanhos?`;

    window.open(`https://wa.me/${numeroWhats}?text=${encodeURIComponent(msg)}`, '_blank');
}

function mostrarToast(nome) {
    const toast = document.createElement('div');
    toast.className = 'toast-sucesso';
    toast.innerHTML = `✅ <b>${nome}</b> adicionado ao carrinho`;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
