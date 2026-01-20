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






