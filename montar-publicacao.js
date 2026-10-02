#!/usr/bin/env node
/*
 * montar-publicacao.js — copia para ./dist só o que vai para a hospedagem
 * (sem fotos originais, sem node_modules, sem scripts).
 * Uso: npm run publicar
 */
'use strict';

const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const DIST = path.join(RAIZ, 'dist');
const ITENS = ['index.html', 'favicon.svg', 'robots.txt', 'sitemap.xml', 'css', 'js', 'img'];

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST);

for (const item of ITENS) {
  const origem = path.join(RAIZ, item);
  if (!fs.existsSync(origem)) {
    console.warn(`  ! ${item} não existe, ficou de fora`);
    continue;
  }
  fs.cpSync(origem, path.join(DIST, item), { recursive: true });
  console.log(`  ok ${item}`);
}

const html = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const pendentes = (html.match(/\[CONFIRMAR[^\]]*\]/g) || []).length;
const fotos = (html.match(/class="foto-vazia"/g) || []).length;
const dominio = html.includes('SEU-DOMINIO.com.br');

console.log('\nPasta ./dist pronta para publicar.');
if (pendentes || fotos || dominio) {
  console.log('\nAinda pendente antes de divulgar o site:');
  if (pendentes) console.log(`  - ${pendentes} item(ns) [CONFIRMAR] no index.html`);
  if (fotos) console.log(`  - ${fotos} espaço(s) de foto vazio(s)`);
  if (dominio) console.log('  - trocar SEU-DOMINIO.com.br pelo domínio real (index.html, sitemap.xml, robots.txt)');
}
console.log('');
