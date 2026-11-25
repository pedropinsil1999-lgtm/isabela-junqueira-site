// Gera a marca final: monograma IJ (C3) + lockups, em contornos.
import op from 'opentype.js';
import fs from 'node:fs';
import path from 'node:path';
import { paraD } from './serializar.mjs';

const RAIZ = path.resolve(process.cwd(), '..');
const MARCA = path.join(RAIZ, 'marca');
const PROVAS = path.join(RAIZ, 'entrada', 'provas');
fs.mkdirSync(MARCA, { recursive: true });
fs.mkdirSync(PROVAS, { recursive: true });

const ler = (a) => op.parse(fs.readFileSync(path.join(RAIZ, 'fontes', a)).buffer.slice(0));
const serif = ler('Gambetta-Regular.ttf');
const serifIt = ler('Gambetta-Italic.ttf');
const sans = ler('GeneralSans-500.ttf');

const CAP = 680, DESC = 220;
const DX = 320, DYJ = 30;   // reescolhido para a Gambetta

// ---------- monograma ----------
function monogramaPaths() {
  return [
    serif.charToGlyph('I').getPath(0, CAP, 1000).toPathData(2),
    serifIt.charToGlyph('J').getPath(DX, CAP + DYJ, 1000).toPathData(2),
  ];
}
const bI = serif.charToGlyph('I').getBoundingBox();
const bJ = serifIt.charToGlyph('J').getBoundingBox();
const MONO = {
  x0: Math.min(bI.x1, bJ.x1 + DX),
  x1: Math.max(bI.x2, bJ.x2 + DX),
  y0: 0,                              // topo da caixa alta
  y1: CAP + DESC + DYJ,               // base do bojo do J
};
MONO.w = MONO.x1 - MONO.x0;
MONO.h = MONO.y1 - MONO.y0;

/** Texto em caixa alta com tracking, em contornos. Retorna {d, largura}. */
function textoEspacado(texto, tamanho, tracking) {
  const partes = [];
  let x = 0;
  for (const ch of texto) {
    if (ch === ' ') { x += sans.charToGlyph(' ').advanceWidth * (tamanho / 1000) + tracking; continue; }
    const g = sans.charToGlyph(ch);
    partes.push(paraD(g.getPath(x, 0, tamanho)));
    x += g.advanceWidth * (tamanho / 1000) + tracking;
  }
  return { d: partes.join(' '), largura: x - tracking };
}

const CAIXA_ALTA_SANS = 0.715;   // altura de caixa alta da Satoshi, fracao do em

function svg(viewBox, corpo, titulo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${titulo}">
  <title>${titulo}</title>
${corpo}
</svg>`;
}

// ---------- 1. monograma isolado ----------
function svgMonograma(cor) {
  const m = 44;
  const vb = `${MONO.x0 - m} ${MONO.y0 - m} ${MONO.w + m * 2} ${MONO.h + m * 2}`;
  const corpo = monogramaPaths().map((d) => `  <path d="${d}" fill="${cor}"/>`).join('\n');
  return svg(vb, corpo, 'Isabela Junqueira Arquitetura');
}

// ---------- 2. lockup horizontal ----------
function svgHorizontal(cor) {
  const escala = 0.62;                       // monograma menor que a caixa alta do nome? nao: maior
  const alturaMono = MONO.h;
  const nome = textoEspacado('ISABELA JUNQUEIRA', 150, 23);
  const sub = textoEspacado('ARQUITETURA', 92, 30);

  const gap = 120;
  const xTexto = MONO.w + gap;
  // alinha o bloco de texto ao centro optico do monograma
  const alturaTexto = 150 * CAIXA_ALTA_SANS + 54 + 92 * CAIXA_ALTA_SANS;
  const yNome = (alturaMono - alturaTexto) / 2 + 150 * CAIXA_ALTA_SANS;
  const ySub = yNome + 54 + 92 * CAIXA_ALTA_SANS;

  const largura = xTexto + Math.max(nome.largura, sub.largura);
  const m = 40;
  const corpo = [
    `  <g transform="translate(${-MONO.x0},0)">`,
    ...monogramaPaths().map((d) => `    <path d="${d}" fill="${cor}"/>`),
    `  </g>`,
    `  <g transform="translate(${xTexto},${yNome})"><path d="${nome.d}" fill="${cor}"/></g>`,
    `  <g transform="translate(${xTexto},${ySub})"><path d="${sub.d}" fill="${cor}" opacity="0.72"/></g>`,
  ].join('\n');
  return svg(`${-m} ${-m} ${largura + m * 2} ${alturaMono + m * 2}`, corpo, 'Isabela Junqueira Arquitetura');
}

// ---------- 3. lockup vertical ----------
function svgVertical(cor) {
  const nome = textoEspacado('ISABELA JUNQUEIRA', 122, 19);
  const sub = textoEspacado('ARQUITETURA', 76, 26);
  const gap = 150;
  const yNome = MONO.h + gap + 122 * CAIXA_ALTA_SANS;
  const ySub = yNome + 48 + 76 * CAIXA_ALTA_SANS;
  const largura = Math.max(MONO.w, nome.largura, sub.largura);
  const m = 40;
  const corpo = [
    `  <g transform="translate(${(largura - MONO.w) / 2 - MONO.x0},0)">`,
    ...monogramaPaths().map((d) => `    <path d="${d}" fill="${cor}"/>`),
    `  </g>`,
    `  <g transform="translate(${(largura - nome.largura) / 2},${yNome})"><path d="${nome.d}" fill="${cor}"/></g>`,
    `  <g transform="translate(${(largura - sub.largura) / 2},${ySub})"><path d="${sub.d}" fill="${cor}" opacity="0.72"/></g>`,
  ].join('\n');
  return svg(`${-m} ${-m} ${largura + m * 2} ${ySub + m * 2}`, corpo, 'Isabela Junqueira Arquitetura');
}

const CLARA = '#FAF7F2';   // sobre fundo escuro
const ESCURA = '#15120E';  // sobre fundo claro

const saidas = {
  'monograma-clara.svg': svgMonograma(CLARA),
  'monograma-escura.svg': svgMonograma(ESCURA),
  'horizontal-clara.svg': svgHorizontal(CLARA),
  'horizontal-escura.svg': svgHorizontal(ESCURA),
  'vertical-clara.svg': svgVertical(CLARA),
  'vertical-escura.svg': svgVertical(ESCURA),
};
for (const [n, c] of Object.entries(saidas)) fs.writeFileSync(path.join(MARCA, n), c);

// usa currentColor para o site
fs.writeFileSync(path.join(MARCA, 'monograma.svg'), svgMonograma('currentColor'));
fs.writeFileSync(path.join(MARCA, 'horizontal.svg'), svgHorizontal('currentColor'));
fs.writeFileSync(path.join(MARCA, 'vertical.svg'), svgVertical('currentColor'));

// ---------- folha de prova ----------
const cel = (t, conteudo, claro) =>
  `<figure class="${claro ? 'claro' : 'escuro'}"><div class="caixa">${conteudo}</div><figcaption>${t}</figcaption></figure>`;

fs.writeFileSync(path.join(PROVAS, 'marca.html'), `<!doctype html><meta charset="utf-8">
<style>
 body{background:#0D1A14;color:#E6DACA;font-family:ui-sans-serif,system-ui;margin:0;padding:48px}
 h1{font-weight:400;font-size:13px;letter-spacing:.22em;text-transform:uppercase;opacity:.65;margin:0 0 8px}
 p.n{font-size:12px;opacity:.5;margin:0 0 36px;letter-spacing:.04em}
 .grade{display:grid;grid-template-columns:1fr 1fr 1fr;gap:26px;margin-bottom:26px}
 .caixa{aspect-ratio:16/9;display:grid;place-items:center;padding:34px;border:1px solid rgba(230,218,202,.14)}
 .escuro .caixa{background:#0D1A14}
 .claro .caixa{background:#FAF7F2}
 svg{max-width:100%;max-height:100%}
 figcaption{margin-top:10px;font-size:11px;letter-spacing:.1em;opacity:.7}
 figure{margin:0}
 .pequeno .caixa{aspect-ratio:3/1;padding:14px}
</style>
<h1>Marca Isabela Junqueira — monograma IJ e lockups</h1>
<p class="n">I romano + J itálico da Instrument Serif · lockup em Satoshi 500 caixa alta · contornos, sem dependência de fonte</p>
<div class="grade">
 ${cel('monograma · fundo escuro', saidas['monograma-clara.svg'], false)}
 ${cel('horizontal · fundo escuro', saidas['horizontal-clara.svg'], false)}
 ${cel('vertical · fundo escuro', saidas['vertical-clara.svg'], false)}
</div>
<div class="grade">
 ${cel('monograma · fundo claro', saidas['monograma-escura.svg'], true)}
 ${cel('horizontal · fundo claro', saidas['horizontal-escura.svg'], true)}
 ${cel('vertical · fundo claro', saidas['vertical-escura.svg'], true)}
</div>
<div class="grade pequeno">
 ${cel('horizontal a 220 px (teste de redução)', `<div style="width:220px">${saidas['horizontal-clara.svg']}</div>`, false)}
 ${cel('monograma a 34 px (favicon / header)', `<div style="width:34px">${saidas['monograma-clara.svg']}</div>`, false)}
 ${cel('monograma a 34 px sobre claro', `<div style="width:34px">${saidas['monograma-escura.svg']}</div>`, true)}
</div>`);

console.log('> marca/ e provas/marca.html');
