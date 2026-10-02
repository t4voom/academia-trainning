# Site da Academia Trainning (Academia e Fisio)

Site institucional de uma página, em HTML, CSS e JavaScript puros. Não precisa de build para funcionar: os arquivos já estão prontos para qualquer hospedagem estática.

```
index.html              página (toda a copy e os dados estão aqui)
css/style.css           estilos
js/main.js              WhatsApp, menu, galeria, mapa
img/                    imagens otimizadas (geradas pelo script, não edite à mão)
fotos/                  fotos ORIGINAIS (coloque aqui; nunca são alteradas)
otimizar-fotos.js       converte ./fotos em ./img e atualiza o index.html
montar-publicacao.js    monta a pasta ./dist só com o que vai para o ar
servidor-local.js       servidor para conferir o site no computador
favicon.svg, robots.txt, sitemap.xml
```

## Rodar no computador

Precisa do Node.js 18 ou mais novo.

```bash
npm install
```

```bash
npm start
```

Abra http://localhost:5173.

## Fotos

Hoje todos os espaços de foto mostram um bloco `FOTO: descrição do que falta`. Para trocar:

1. Coloque a foto original em `fotos/` com o **nome do espaço** (a extensão pode ser `.jpg`, `.jpeg`, `.png` ou `.webp`).
2. Rode `npm run fotos`.

O script gera as versões WebP (480, 960 e 1600 px), escreve `srcset`, `width`, `height` e `alt` no `index.html` e apaga as versões antigas. Se você apagar uma foto de `fotos/` e rodar de novo, o bloco `FOTO:` volta.

| Nome do arquivo | Onde aparece | Foto ideal |
|---|---|---|
| `hero` | Topo | Sala de musculação em plano aberto ou fachada, horizontal |
| `sobre` | Sobre | Recepção com a logo na parede, vertical |
| `musculacao` | Modalidades | Sala de musculação com os equipamentos |
| `artes-marciais` | Modalidades | Aula no tatame azul |
| `fisioterapia` | Modalidades | Atendimento ou sala de fisioterapia |
| `galeria-1` | Estrutura | Fachada com o estacionamento |
| `galeria-2` | Estrutura | Sala de musculação, visão geral |
| `galeria-3` | Estrutura | Tatame azul / aula infantil |
| `galeria-4` | Estrutura | Recepção com a logo |
| `galeria-5` | Estrutura | Equipamentos em detalhe |
| `fisio-sala` | Fisioterapia | Sala ou atendimento de fisioterapia |
| `og` (opcional) | Prévia do link no WhatsApp e redes | Qualquer foto boa, horizontal |

Observações:

- **Texto alternativo (alt):** cada espaço já tem um `alt` em português, escrito para a foto esperada. Se a foto for diferente, ajuste o texto em `otimizar-fotos.js`, na lista `ESPACOS`, e rode `npm run fotos` de novo.
- **Arquivo com outro nome** (ex.: `IMG_1234.jpg`) não entra no site: o script avisa e lista os nomes aceitos.
- **Imagem de compartilhamento (`img/og.jpg`):** sai de `fotos/og.*`; se não existir, da foto `hero`; se também não existir, vira um cartão com as cores e o nome da academia.
- Só entram no site fotos que estiverem em `fotos/`. Não há imagens de banco nem geradas.

## WhatsApp

O número fica em **um lugar só**: o atributo `data-whatsapp` da tag `<html>`, no começo do `index.html`.

```html
<html lang="pt-BR" data-whatsapp="554734651710">
```

Formato: `55` + DDD + número, só dígitos. O `js/main.js` lê esse valor na constante `WHATSAPP_NUMBER` e monta todos os links `https://wa.me/...`. Hoje está o fixo (47) 3465-1710, que ainda precisa ser confirmado.

A mensagem de cada botão fica no atributo `data-wa` do próprio botão:

```html
<a class="btn" href="#contato" data-wa="Olá! Vi o site da Trainning e quero saber mais sobre o plano Mensal.">
```

## Planos e preços

No `index.html`, procure por `5. PLANOS`. Cada plano é um bloco `<article class="plano">`:

- **Nome:** dentro de `<h3 class="plano__nome">`.
- **Preço:** troque `<mark class="confirmar">[CONFIRMAR]</mark>` pelo valor (ex.: `129,90`).
- **O que inclui:** troque o `<mark>` da linha `plano__inclui` por um texto curto.
- **Mensagem do WhatsApp:** atributo `data-wa` do botão (troque também o nome do plano no texto do botão).

Para criar um plano, copie um `<article>` inteiro; para remover, apague. As classes `plano--a`, `plano--b` e `plano--c` só mudam a cor do cartão.

## Horário

No `index.html`, procure por `HORÁRIO:` (seção Contato) e troque cada `[CONFIRMAR]` pelo horário, por exemplo `6h às 22h`.

Depois, para o Google entender o horário, cole no JSON-LD (dentro do `<head>`) o bloco `openingHoursSpecification` que está pronto no comentário logo acima dele, com os horários reais.

## Outros ajustes

- **Modalidade de artes marciais:** procure por `MODALIDADE:` no `index.html`.
- **Facebook:** o link atual (`facebook.com/academiatrainning`) é um palpite; confirme e troque nos dois lugares em que aparece.
- **Link das avaliações:** hoje aponta para a busca da academia no Google Maps. O ideal é o link direto do Perfil da Empresa no Google (procure por `TODO: trocar pelo link direto`).
- **Depoimentos:** há um modelo comentado na seção Avaliações. Use só depoimentos reais.
- **Mapa:** por privacidade, o mapa do Google só carrega quando a pessoa clica em "Mostrar o mapa". Para carregar sozinho, mude `CARREGAR_MAPA_AUTOMATICO` para `true` em `js/main.js`.
- **Crédito "Site por Gustavo":** no rodapé há um comentário mostrando como transformar em link.
- **Cores e fontes:** variáveis no começo do `css/style.css`.

## Publicar

### Antes de publicar

1. Resolva os itens da lista de pendências abaixo.
2. Troque `https://SEU-DOMINIO.com.br` pelo endereço real em `index.html`, `sitemap.xml` e `robots.txt` (localizar e substituir).
3. Rode:

```bash
npm run publicar
```

Isso atualiza as fotos e cria a pasta `dist/` só com o que vai para o ar. O comando também avisa quantos `[CONFIRMAR]` e espaços de foto ainda restam.

### Netlify

Arraste a pasta `dist/` em https://app.netlify.com/drop. Ou, pela linha de comando:

```bash
npx netlify deploy --prod --dir=dist
```

### Vercel

```bash
npx vercel dist --prod
```

### Cloudflare Pages

```bash
npx wrangler pages deploy dist --project-name=academia-trainning
```

Em qualquer uma delas, depois é só apontar o domínio no painel. Para atualizar o site, rode `npm run publicar` e publique a pasta `dist/` de novo.

## Decisões de design

- **Conceito:** fachada e placa de academia de bairro. Cortes em ângulo nas fotos, faixa laranja inclinada, números grandes e blocos desalinhados, em vez de seções centralizadas.
- **Paleta:** marinho `#0E1A3A` / `#091129`, roxo-azulado acinzentado `#5A5E96` / `#A9ACD3`, névoa `#E3E4F0`, papel `#F5F2EC`, laranja queimado `#F0872A` (sempre com texto marinho, contraste 6,8:1) e ferrugem `#A8470C` para destaques em fundo claro.
- **Tipografia:** *Barlow Condensed* nos títulos e *Work Sans* no texto. A Barlow Condensed nasceu de placas e letreiros, é estreita e pesada: cabe um título enorme em tela de celular e lembra a fachada de uma academia. A Work Sans foi desenhada para leitura em tela, tem formas abertas e um tom amigável, o que equilibra o peso dos títulos. As duas vêm do Google Fonts com `font-display: swap` e são carregadas sem travar a primeira pintura.
- **Ícones:** poucos, em SVG inline, todos do mesmo traço. Sem emojis.

## Notas técnicas

- **SEO local:** `<title>` e description com "academia em Joinville", Open Graph, JSON-LD `HealthClub`/`LocalBusiness` com endereço, telefone e `aggregateRating` (4,8 / 137), `sitemap.xml` e `robots.txt`. Atualize a nota e o número de avaliações no `index.html` de vez em quando (aparecem no topo, na seção Avaliações e no JSON-LD).
- **Acessibilidade:** HTML semântico, link "Pular para o conteúdo", foco visível, menu e lightbox navegáveis por teclado (Esc fecha, setas trocam a foto), contraste AA, `prefers-reduced-motion` respeitado.
- **LGPD:** o site não usa cookies nem rastreadores. O mapa do Google só carrega com clique. As fontes vêm do Google Fonts (o navegador do visitante faz uma requisição ao Google para baixá-las). Se for usar Google Analytics, há um comentário no `<head>` do `index.html` indicando onde colar o código, e aí é preciso avisar o visitante e pedir consentimento.
- **Desempenho:** Lighthouse medido no servidor local em 02/10/2026, ainda sem fotos: celular 100 / 100 / 100 / 100 e desktop 98 / 100 / 100 / 100 (desempenho, acessibilidade, boas práticas, SEO). Vale medir de novo depois de colocar as fotos reais e publicar.
- **Sem JavaScript:** o site continua legível; os botões de WhatsApp levam à seção de contato, onde está o telefone.

## Pendências com o cliente

- [ ] **Fotos:** 11 espaços vazios (tabela acima).
- [ ] **Logo oficial** em SVG ou PNG (hoje o nome está escrito com a fonte dos títulos).
- [ ] **Número de WhatsApp** (por ora o fixo 47 3465-1710).
- [ ] **Planos:** nomes (Mensal, Trimestral e Anual são sugestão), valores e o que cada um inclui.
- [ ] **Valores de artes marciais e fisioterapia** (hoje o site só manda perguntar no WhatsApp).
- [ ] **Modalidade de artes marciais:** judô, jiu-jitsu ou outra; dias e horários das turmas.
- [ ] **Horário completo:** segunda a sexta, sábado, domingo e feriados (só "até as 22h" está confirmado).
- [ ] **Fisioterapia:** tipos de atendimento, especialidades e convênios.
- [ ] **Endereço da página no Facebook.**
- [ ] **Link direto das avaliações no Google.**
- [ ] **Depoimentos reais** (opcional).
- [ ] **Domínio do site** (trocar `SEU-DOMINIO.com.br`).
- [ ] **Link do crédito "Site por Gustavo"** (opcional).
