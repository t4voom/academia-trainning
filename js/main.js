/* ==========================================================================
   Academia Trainning — comportamento do site (JavaScript puro, sem bibliotecas)
   ========================================================================== */

/*
 * NÚMERO DO WHATSAPP
 * TODO: confirmar número de WhatsApp.
 * O número é lido do atributo data-whatsapp da tag <html>, no index.html.
 * Troque LÁ (um lugar só) e todos os botões do site passam a usar o novo número.
 * Formato: 55 + DDD + número, só dígitos. Ex.: 5547999998888
 */
const WHATSAPP_NUMBER = (document.documentElement.dataset.whatsapp || '').replace(/\D/g, '');

/*
 * MAPA DO GOOGLE
 * false = o mapa só carrega quando a pessoa clica em "Mostrar o mapa"
 *         (nenhum dado vai para o Google antes disso; melhor para a LGPD).
 * true  = o mapa carrega sozinho quando a seção de contato aparece na tela.
 */
const CARREGAR_MAPA_AUTOMATICO = false;

const MOVIMENTO_REDUZIDO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Links de WhatsApp ---------- */
// Todo elemento com data-wa="mensagem" vira um link wa.me com a mensagem pronta.
function ligarWhatsApp() {
  if (!WHATSAPP_NUMBER) return;

  document.querySelectorAll('[data-wa]').forEach((link) => {
    const mensagem = encodeURIComponent(link.dataset.wa);
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensagem}`;
    link.target = '_blank';
    link.rel = 'noopener';
  });
}

/* ---------- Topo: fundo ao rolar e menu do celular ---------- */
function ligarTopo() {
  const topo = document.querySelector('[data-topo]');
  const botao = document.querySelector('[data-menu-botao]');
  const menu = document.querySelector('[data-menu]');
  if (!topo || !botao || !menu) return;

  const rotulo = botao.querySelector('[data-menu-rotulo]');
  const telaLarga = window.matchMedia('(min-width: 1000px)');

  const aoRolar = () => topo.classList.toggle('topo--solido', window.scrollY > 24);
  aoRolar();
  window.addEventListener('scroll', aoRolar, { passive: true });

  function definirMenu(aberto) {
    botao.setAttribute('aria-expanded', String(aberto));
    menu.classList.toggle('menu--aberto', aberto);
    topo.classList.toggle('topo--aberto', aberto);
    document.documentElement.style.overflow = aberto ? 'hidden' : '';
    if (rotulo) rotulo.textContent = aberto ? 'Fechar' : 'Menu';
  }

  botao.addEventListener('click', () => {
    definirMenu(botao.getAttribute('aria-expanded') !== 'true');
  });

  menu.addEventListener('click', (evento) => {
    if (evento.target.closest('a')) definirMenu(false);
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && botao.getAttribute('aria-expanded') === 'true') {
      definirMenu(false);
      botao.focus();
    }
  });

  telaLarga.addEventListener('change', () => definirMenu(false));
}

/* ---------- Entrada dos blocos ao rolar ---------- */
function ligarRevelar() {
  const blocos = document.querySelectorAll('.revela');
  if (!blocos.length) return;

  if (MOVIMENTO_REDUZIDO || !('IntersectionObserver' in window)) {
    blocos.forEach((bloco) => bloco.classList.add('visivel'));
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;
        entrada.target.classList.add('visivel');
        observador.unobserve(entrada.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  blocos.forEach((bloco) => observador.observe(bloco));
}

/* ---------- Faixa de texto: anda conforme a rolagem ---------- */
function ligarFaixa() {
  const trilho = document.querySelector('[data-faixa]');
  if (!trilho || MOVIMENTO_REDUZIDO) return;

  const INICIO = 48; // px já deslocados no CSS
  let agendado = false;
  let limite = 0;

  const medir = () => {
    limite = Math.max(0, trilho.scrollWidth - window.innerWidth * 1.1);
  };
  window.addEventListener('load', medir);
  window.addEventListener('resize', medir);

  const mover = () => {
    if (!limite) medir();
    const deslocamento = Math.min(INICIO + window.scrollY * 0.28, limite);
    trilho.style.transform = `translate3d(${-deslocamento}px, 0, 0)`;
    agendado = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (agendado) return;
      agendado = true;
      requestAnimationFrame(mover);
    },
    { passive: true }
  );
}

/* ---------- Galeria: lightbox ---------- */
function ligarLightbox() {
  const links = Array.from(document.querySelectorAll('a[data-lightbox]'));
  if (!links.length || typeof HTMLDialogElement === 'undefined') return;

  const janela = document.createElement('dialog');
  janela.className = 'lightbox';
  janela.setAttribute('aria-label', 'Foto ampliada');
  janela.innerHTML = `
    <button class="lightbox__botao lightbox__fechar" type="button" data-acao="fechar" aria-label="Fechar foto">×</button>
    <div class="lightbox__palco">
      <figure class="lightbox__figura"><img alt=""></figure>
      <div class="lightbox__base">
        <button class="lightbox__botao lightbox__botao--voltar" type="button" data-acao="voltar" aria-label="Foto anterior">
          <svg class="icone" aria-hidden="true"><use href="#i-seta"/></svg>
        </button>
        <p class="lightbox__legenda" aria-live="polite"></p>
        <button class="lightbox__botao" type="button" data-acao="avancar" aria-label="Próxima foto">
          <svg class="icone" aria-hidden="true"><use href="#i-seta"/></svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(janela);

  const imagem = janela.querySelector('img');
  const legenda = janela.querySelector('.lightbox__legenda');
  let atual = 0;

  function mostrar(indice) {
    atual = (indice + links.length) % links.length;
    const link = links[atual];
    const texto = link.dataset.legenda || '';
    imagem.src = link.href;
    imagem.alt = texto;
    legenda.textContent = `${texto} (${atual + 1} de ${links.length})`;
  }

  links.forEach((link, indice) => {
    link.addEventListener('click', (evento) => {
      evento.preventDefault();
      mostrar(indice);
      janela.showModal();
    });
  });

  janela.addEventListener('click', (evento) => {
    const acao = evento.target.closest('[data-acao]');
    if (acao) {
      if (acao.dataset.acao === 'fechar') janela.close();
      if (acao.dataset.acao === 'voltar') mostrar(atual - 1);
      if (acao.dataset.acao === 'avancar') mostrar(atual + 1);
      return;
    }
    // clique fora da foto fecha
    if (evento.target !== imagem) janela.close();
  });

  janela.addEventListener('keydown', (evento) => {
    if (evento.key === 'ArrowLeft') mostrar(atual - 1);
    if (evento.key === 'ArrowRight') mostrar(atual + 1);
  });

  janela.addEventListener('close', () => {
    imagem.removeAttribute('src');
    links[atual].focus();
  });
}

/* ---------- Mapa do Google ---------- */
function ligarMapa() {
  const mapa = document.querySelector('[data-mapa]');
  if (!mapa) return;

  const capa = mapa.querySelector('[data-mapa-capa]');
  const botao = mapa.querySelector('[data-mapa-abrir]');

  function carregar(focar) {
    if (mapa.querySelector('iframe')) return;

    const quadro = document.createElement('iframe');
    quadro.className = 'mapa__quadro';
    quadro.title = 'Mapa: Academia Trainning, R. João Bertoli, 129, Joinville';
    quadro.src = mapa.dataset.src;
    quadro.loading = 'lazy';
    quadro.referrerPolicy = 'no-referrer-when-downgrade';
    quadro.allowFullscreen = true;

    if (capa) capa.hidden = true;
    mapa.appendChild(quadro);
    if (focar) quadro.focus();
  }

  if (botao) botao.addEventListener('click', () => carregar(true));

  if (CARREGAR_MAPA_AUTOMATICO && 'IntersectionObserver' in window) {
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          carregar(false);
          observador.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    observador.observe(mapa);
  }
}

/* ---------- Ano do rodapé ---------- */
function ligarAno() {
  const ano = document.querySelector('[data-ano]');
  if (ano) ano.textContent = new Date().getFullYear();
}

ligarWhatsApp();
ligarTopo();
ligarRevelar();
ligarFaixa();
ligarLightbox();
ligarMapa();
ligarAno();
