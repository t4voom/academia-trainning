#!/usr/bin/env node
/*
 * otimizar-fotos.js — Academia Trainning
 *
 * O que faz:
 *   1. Lê as fotos originais em ./fotos (nunca altera os originais).
 *   2. Gera versões WebP em ./img nas larguras de LARGURAS (480, 960, 1600 px).
 *   3. Atualiza o index.html: cada espaço <!-- FOTO:nome --> recebe a foto
 *      (com srcset, sizes, width, height e alt) ou, se a foto não existir,
 *      um bloco de cor com a legenda "FOTO: o que falta".
 *   4. Gera img/og.jpg (imagem de compartilhamento) e img/apple-touch-icon.png.
 *
 * Uso:  npm run fotos      (ou: node otimizar-fotos.js)
 *
 * O nome do arquivo em ./fotos decide onde a foto entra (veja ESPACOS abaixo).
 * Ex.: fotos/hero.jpg, fotos/galeria-1.png
 */
'use strict';

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('Falta instalar as dependências. Rode "npm install" nesta pasta e tente de novo.');
  process.exit(1);
}

const RAIZ = __dirname;
const DIR_FOTOS = path.join(RAIZ, 'fotos');
const DIR_IMG = path.join(RAIZ, 'img');
const ARQ_HTML = path.join(RAIZ, 'index.html');

const LARGURAS = [480, 960, 1600];
const QUALIDADE = 78;
const EXTENSOES = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff', '.gif'];

/*
 * ESPAÇOS DE FOTO DO SITE
 *   alt       descrição da foto para leitores de tela e Google (ajuste se a foto for diferente)
 *   falta     legenda que aparece enquanto a foto não existe
 *   sizes     largura que a foto ocupa na tela (não precisa mexer)
 *   principal true só na foto do topo (carrega com prioridade)
 *   ampliar   true nas fotos da galeria (abrem no lightbox)
 */
const ESPACOS = {
  hero: {
    alt: 'Sala de musculação da Academia Trainning, em Joinville',
    falta: 'sala de musculação em plano aberto ou fachada (horizontal)',
    sizes: '(min-width: 900px) 56vw, 100vw',
    principal: true
  },
  sobre: {
    alt: 'Recepção da Academia Trainning com a logo na parede',
    falta: 'recepção com a logo na parede (vertical)',
    sizes: '(min-width: 900px) 38vw, 88vw'
  },
  musculacao: {
    alt: 'Equipamentos da sala de musculação da Academia Trainning',
    falta: 'sala de musculação com os equipamentos',
    sizes: '(min-width: 900px) 55vw, 92vw'
  },
  'artes-marciais': {
    alt: 'Aula de artes marciais no tatame azul da Academia Trainning',
    falta: 'aula de artes marciais no tatame azul',
    sizes: '(min-width: 900px) 55vw, 92vw'
  },
  fisioterapia: {
    alt: 'Atendimento de fisioterapia na Academia Trainning',
    falta: 'atendimento ou sala de fisioterapia',
    sizes: '(min-width: 900px) 48vw, 92vw'
  },
  'galeria-1': {
    alt: 'Fachada azul e roxa da Academia Trainning com o estacionamento na frente',
    falta: 'fachada com o estacionamento',
    sizes: '(min-width: 900px) 56vw, 92vw',
    ampliar: true
  },
  'galeria-2': {
    alt: 'Visão geral da sala de musculação da Academia Trainning',
    falta: 'sala de musculação, visão geral',
    sizes: '(min-width: 900px) 40vw, 46vw',
    ampliar: true
  },
  'galeria-3': {
    alt: 'Área de tatame azul da Academia Trainning durante aula infantil',
    falta: 'tatame azul / aula infantil',
    sizes: '(min-width: 900px) 32vw, 46vw',
    ampliar: true
  },
  'galeria-4': {
    alt: 'Recepção da Academia Trainning',
    falta: 'recepção com a logo',
    sizes: '(min-width: 900px) 24vw, 46vw',
    ampliar: true
  },
  'galeria-5': {
    alt: 'Detalhe dos equipamentos de musculação da Academia Trainning',
    falta: 'equipamentos em detalhe',
    sizes: '(min-width: 900px) 40vw, 92vw',
    ampliar: true
  },
  'fisio-sala': {
    alt: 'Sala de fisioterapia da Academia Trainning',
    falta: 'sala ou atendimento de fisioterapia',
    sizes: '(min-width: 900px) 56vw, 100vw'
  }
};

/* ---------- utilidades ---------- */

const escapar = (texto) =>
  String(texto).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function listarOriginais() {
  if (!fs.existsSync(DIR_FOTOS)) fs.mkdirSync(DIR_FOTOS, { recursive: true });

  const porNome = new Map();
  const ignorados = [];

  for (const arquivo of fs.readdirSync(DIR_FOTOS).sort()) {
    const ext = path.extname(arquivo).toLowerCase();
    if (!EXTENSOES.includes(ext)) continue;

    const nome = path.basename(arquivo, path.extname(arquivo)).toLowerCase();
    if (nome !== 'og' && !ESPACOS[nome]) {
      ignorados.push(arquivo);
    } else if (porNome.has(nome)) {
      console.warn(`  ! ${arquivo}: já existe outra foto para "${nome}", esta foi ignorada.`);
    } else {
      porNome.set(nome, path.join(DIR_FOTOS, arquivo));
    }
  }

  return { porNome, ignorados };
}

function limparAntigas(nome, manter) {
  const padrao = new RegExp(`^${nome}-\\d+\\.webp$`);
  for (const arquivo of fs.readdirSync(DIR_IMG)) {
    if (padrao.test(arquivo) && !manter.includes(arquivo)) fs.unlinkSync(path.join(DIR_IMG, arquivo));
  }
}

/* Converte uma foto original para WebP nas larguras definidas. */
async function converter(nome, origem) {
  const meta = await sharp(origem).metadata();
  const deitada = (meta.orientation || 1) >= 5; // foto de celular girada pelo EXIF
  const larguraOriginal = deitada ? meta.height : meta.width;

  const maior = Math.min(larguraOriginal, LARGURAS[LARGURAS.length - 1]);
  const larguras = [...new Set([...LARGURAS.filter((l) => l < maior), maior])];

  const versoes = [];
  for (const largura of larguras) {
    const arquivo = `${nome}-${largura}.webp`;
    const info = await sharp(origem)
      .rotate() // respeita a orientação da câmera
      .resize({ width: largura, withoutEnlargement: true })
      .webp({ quality: QUALIDADE, effort: 5 })
      .toFile(path.join(DIR_IMG, arquivo));
    versoes.push({ arquivo, largura: info.width, altura: info.height, bytes: info.size });
  }

  limparAntigas(nome, versoes.map((v) => v.arquivo));
  return versoes;
}

/* ---------- HTML de cada espaço ---------- */

function htmlFoto(nome, espaco, versoes) {
  const maior = versoes[versoes.length - 1];
  const padrao = versoes.find((v) => v.largura >= 960) || maior;
  const srcset = versoes.map((v) => `img/${v.arquivo} ${v.largura}w`).join(', ');
  const carga = espaco.principal ? 'loading="eager" fetchpriority="high"' : 'loading="lazy"';

  const img =
    `<img src="img/${padrao.arquivo}" srcset="${srcset}" sizes="${espaco.sizes}" ` +
    `width="${maior.largura}" height="${maior.altura}" alt="${escapar(espaco.alt)}" ${carga} decoding="async">`;

  if (!espaco.ampliar) return [img];

  return [
    `<a class="galeria__link" href="img/${maior.arquivo}" data-lightbox data-legenda="${escapar(espaco.alt)}" aria-label="Ampliar foto: ${escapar(espaco.alt)}">`,
    `  ${img}`,
    '</a>'
  ];
}

function htmlVazio(nome, espaco) {
  return [
    `<div class="foto-vazia" role="img" aria-label="Foto pendente: ${escapar(espaco.falta)}">`,
    `  <span class="foto-vazia__rotulo"><b>FOTO:</b> ${escapar(espaco.falta)}</span>`,
    `  <span class="foto-vazia__arquivo">fotos/${nome}.jpg</span>`,
    '</div>'
  ];
}

function atualizarHtml(resultados) {
  let html = fs.readFileSync(ARQ_HTML, 'utf8');
  const quebra = html.includes('\r\n') ? '\r\n' : '\n';
  const faltando = [];

  for (const nome of Object.keys(ESPACOS)) {
    const marcador = new RegExp(`^([ \\t]*)<!-- FOTO:${nome} -->[\\s\\S]*?<!-- /FOTO:${nome} -->`, 'm');
    if (!marcador.test(html)) {
      faltando.push(nome);
      continue;
    }

    html = html.replace(marcador, (_tudo, recuo) => {
      const versoes = resultados.get(nome);
      const linhas = versoes ? htmlFoto(nome, ESPACOS[nome], versoes) : htmlVazio(nome, ESPACOS[nome]);
      return [`<!-- FOTO:${nome} -->`, ...linhas, `<!-- /FOTO:${nome} -->`].map((l) => recuo + l).join(quebra);
    });
  }

  fs.writeFileSync(ARQ_HTML, html);
  return faltando;
}

/* ---------- imagem de compartilhamento (Open Graph) e ícone ---------- */

// Cartão só com cores e nome, usado enquanto não existe foto para o og.jpg.
const CARTAO_OG = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0E1A3A"/>
  <polygon points="1030,0 1200,0 1200,630 900,630" fill="#5A5E96"/>
  <polygon points="1000,0 1030,0 900,630 870,630" fill="#F0872A"/>
  <text x="80" y="250" font-family="Arial Narrow, Arial, sans-serif" font-size="44" font-weight="700" letter-spacing="8" fill="#A9ACD3">ACADEMIA</text>
  <text x="74" y="395" font-family="Arial Narrow, Arial, sans-serif" font-size="136" font-weight="700" font-style="italic" fill="#FFFFFF">TRAINNING</text>
  <text x="80" y="470" font-family="Arial, sans-serif" font-size="34" fill="#F0872A">Academia e Fisio · Joinville/SC</text>
</svg>`;

async function gerarOg(porNome) {
  const destino = path.join(DIR_IMG, 'og.jpg');
  const origem = porNome.get('og') || porNome.get('hero');

  const base = origem
    ? sharp(origem).rotate().resize(1200, 630, { fit: 'cover', position: 'attention' })
    : sharp(Buffer.from(CARTAO_OG));

  await base.jpeg({ quality: 82, mozjpeg: true }).toFile(destino);
  return origem ? path.basename(origem) : 'cartão com as cores da marca (sem foto)';
}

async function gerarIcone() {
  const svg = path.join(RAIZ, 'favicon.svg');
  if (!fs.existsSync(svg)) return false;
  await sharp(svg, { density: 384 }).resize(180, 180).png().toFile(path.join(DIR_IMG, 'apple-touch-icon.png'));
  return true;
}

/* ---------- execução ---------- */

async function principal() {
  fs.mkdirSync(DIR_IMG, { recursive: true });

  const { porNome, ignorados } = listarOriginais();
  const resultados = new Map();

  console.log('\nFotos (./fotos -> ./img)\n');

  for (const nome of Object.keys(ESPACOS)) {
    const origem = porNome.get(nome);
    if (!origem) {
      limparAntigas(nome, []);
      console.log(`  -  ${nome.padEnd(15)} sem foto (fica o bloco "FOTO: ${ESPACOS[nome].falta}")`);
      continue;
    }

    try {
      const versoes = await converter(nome, origem);
      resultados.set(nome, versoes);
      const resumo = versoes.map((v) => `${v.largura}px ${Math.round(v.bytes / 1024)}KB`).join(' | ');
      console.log(`  ok ${nome.padEnd(15)} ${path.basename(origem)} -> ${resumo}`);
    } catch (erro) {
      console.error(`  !! ${nome.padEnd(15)} não deu para ler ${path.basename(origem)}: ${erro.message}`);
    }
  }

  const fonteOg = await gerarOg(porNome);
  console.log(`\n  ok og.jpg (1200x630) a partir de: ${fonteOg}`);
  if (await gerarIcone()) console.log('  ok apple-touch-icon.png (180x180)');

  const faltando = atualizarHtml(resultados);
  console.log(`\nindex.html atualizado: ${resultados.size} foto(s), ${Object.keys(ESPACOS).length - resultados.size} espaço(s) vazio(s).`);

  if (faltando.length) {
    console.warn(`\nAtenção: não achei no index.html os marcadores de: ${faltando.join(', ')}`);
  }

  if (ignorados.length) {
    console.warn('\nArquivos em ./fotos que não entraram no site (o nome não corresponde a nenhum espaço):');
    ignorados.forEach((arquivo) => console.warn(`  - ${arquivo}`));
    console.warn(`Nomes aceitos: ${Object.keys(ESPACOS).join(', ')}, og`);
  }

  console.log('');
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
