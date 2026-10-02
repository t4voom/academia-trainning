#!/usr/bin/env node
/*
 * Servidor estático simples, só para conferir o site no computador.
 * Uso: npm start  (abre em http://localhost:5173)
 * Não é usado na hospedagem.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const RAIZ = __dirname;
const PORTA = Number(process.env.PORT) || 5173;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

http
  .createServer((req, res) => {
    let caminho = decodeURIComponent(req.url.split('?')[0]);
    if (caminho.endsWith('/')) caminho += 'index.html';

    const arquivo = path.join(RAIZ, path.normalize(caminho));
    if (!arquivo.startsWith(RAIZ)) {
      res.writeHead(403).end('Proibido');
      return;
    }

    fs.readFile(arquivo, (erro, dados) => {
      if (erro) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Não encontrado');
        return;
      }
      res.writeHead(200, {
        'Content-Type': TIPOS[path.extname(arquivo).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-cache'
      });
      res.end(dados);
    });
  })
  .listen(PORTA, () => {
    console.log(`Site da Trainning em http://localhost:${PORTA}`);
  });
