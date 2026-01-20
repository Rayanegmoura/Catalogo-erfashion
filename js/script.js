// MENU HAMBURGUER

// Seleciona o botão e o menu
let btnMenu = document.getElementById('btn-hamburguer');
let menu = document.querySelector('.menu-mobile');

// Abre/Fecha o menu ao clicar no botão
btnMenu.addEventListener('click', () => {
    menu.classList.toggle('abrir-menu');
});

// Fecha o menu ao clicar em qualquer link
menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        menu.classList.remove('abrir-menu');
    });
});


// MULTIPLAS IMAGENS POR PRODUTO - SLIDER

document.querySelectorAll('.tela-produto').forEach(produto => {
  const imgs = produto.querySelectorAll('.slider-produto img');
  const dots = produto.querySelectorAll('.slider-dots .dot');
  let index = 0;

  const showImg = i => {
    imgs.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    imgs[i].classList.add('active');
    dots[i].classList.add('active');
  };

  // clicar na imagem para avançar
  produto.querySelector('.slider-produto').addEventListener('click', () => {
    index = (index + 1) % imgs.length;
    showImg(index);
  });

  // clicar nos dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      index = i;
      showImg(index);
    });
  });
});

// MULTIPLAS IMAGENS - SLIDER LOJA FISICA

document.querySelectorAll('.loja-fisica').forEach(produto => {
  const imgs = produto.querySelectorAll('.slider-produto img');
  const dots = produto.querySelectorAll('.slider-dots .dot');
  let index = 0;

  const showImg = i => {
    imgs.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    imgs[i].classList.add('active');
    dots[i].classList.add('active');
  };

  // clicar na imagem para avançar
  produto.querySelector('.slider-produto').addEventListener('click', () => {
    index = (index + 1) % imgs.length;
    showImg(index);
  });

  // clicar nos dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      index = i;
      showImg(index);
    });
  });
});


// LINK AUTOMATICA WHATSAPP

const numeroWhats = "5521987209252"; // seu WhatsApp

document.querySelectorAll('.tela-produto').forEach(produto => {
    const nome = produto.querySelector('h3').innerText;
    const valor = produto.querySelector('p').innerText;
    const primeiraImagem = produto.querySelector('.slider-produto img.active')?.src || produto.querySelector('.slider-produto img')?.src;
    const botao = produto.querySelector('.comprar-agora');

    botao.addEventListener('click', () => {
        // Monta mensagem completa com link da imagem
        let mensagem = `Oi! Quero comprar o produto: ${nome} - ${valor}`;
        if(primeiraImagem) {
            mensagem += `\nImagem: ${primeiraImagem}`;
        }
        const link = `https://wa.me/${numeroWhats}?text=${encodeURIComponent(mensagem)}`;
        window.open(link, '_blank');
    });
});








