// Gera o monograma IJ a partir dos contornos reais da Instrument Serif.
import op from 'opentype.js';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const SAIDA = path.join(RAIZ, 'entrada', 'provas');
fs.mkdirSync(SAIDA, { recursive: true });

const carregar = (a) => op.parse(fs.readFileSync(path.join(RAIZ, 'fontes', a)).buffer.slice(0));
const regular = carregar('Gambetta-Regular.ttf');
const italico = carregar('Gambetta-Italic.ttf');

const UPEM = 1000, CAP = 680, DESC = 220;

function glifo(fonte, ch, dx, dy = 0) {
  return fonte.charToGlyph(ch).getPath(dx, CAP + dy, UPEM).toPathData(2);
}

/** Uma variante de cruzamento: I romano + J (romano ou italico) deslocado. */
function comporMonograma({ jItalico = false, dx = 130, dyJ = 0, margem = 40 } = {}) {
  const fJ = jItalico ? italico : regular;
  const bI = regular.charToGlyph('I').getBoundingBox();
  const bJ = fJ.charToGlyph('J').getBoundingBox();

  const x0 = Math.min(bI.x1, bJ.x1 + dx) - margem;
  const x1 = Math.max(bI.x2, bJ.x2 + dx) + margem;
  const yTopo = -margem;
  const yBase = DESC + margem + Math.max(0, dyJ);

  return {
    d: [glifo(regular, 'I', 0), glifo(fJ, 'J', dx, dyJ)],
    viewBox: `${x0} ${yTopo} ${x1 - x0} ${CAP + yBase - yTopo}`,
    largura: x1 - x0,
    altura: CAP + yBase - yTopo,
  };
}

function svgMonograma(v, cor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${v.viewBox}" role="img" aria-label="Isabela Junqueira">
  <title>Isabela Junqueira</title>
  ${v.d.map((d) => `<path d="${d}" fill="${cor}"/>`).join('\n  ')}
</svg>`;
}

// ---- folha de comparacao ----
const opcoes = (process.env.REFINO ? [
  { nome: 'A — dx 250 · dy 20', cfg: { jItalico: true, dx: 250, dyJ: 20 } },
  { nome: 'B — dx 285 · dy 25', cfg: { jItalico: true, dx: 285, dyJ: 25 } },
  { nome: 'C — dx 320 · dy 30', cfg: { jItalico: true, dx: 320, dyJ: 30 } },
  { nome: 'D — dx 355 · dy 30', cfg: { jItalico: true, dx: 355, dyJ: 30 } },
  { nome: 'E — dx 320 · dy 60', cfg: { jItalico: true, dx: 320, dyJ: 60 } },
] : [
  { nome: 'A — J romano, cruzamento curto', cfg: { jItalico: false, dx: 95 } },
  { nome: 'B — J romano, bojo sob o I',     cfg: { jItalico: false, dx: 130 } },
  { nome: 'C — J italico, varredura longa', cfg: { jItalico: true,  dx: 150 } },
  { nome: 'D — J italico, mais fechado',    cfg: { jItalico: true,  dx: 110 } },
  { nome: 'E — J italico, descido',         cfg: { jItalico: true,  dx: 135, dyJ: 55 } },
]);

const cartoes = opcoes.map((o) => {
  const v = comporMonograma(o.cfg);
  return `<figure><div class="caixa">${svgMonograma(v, '#FAF7F2')}</div><figcaption>${o.nome}</figcaption></figure>`;
}).join('\n');

fs.writeFileSync(path.join(SAIDA, 'monograma-opcoes.html'), `<!doctype html><meta charset="utf-8">
<style>
 body{background:#0D1A14;color:#E6DACA;font-family:ui-sans-serif,system-ui;margin:0;padding:48px}
 h1{font-weight:400;font-size:13px;letter-spacing:.22em;text-transform:uppercase;opacity:.65;margin:0 0 36px}
 .grade{display:grid;grid-template-columns:repeat(5,1fr);gap:28px}
 .caixa{background:#16281F;border:1px solid rgba(230,218,202,.14);aspect-ratio:1;display:grid;place-items:center;padding:26px}
 svg{width:100%;height:100%;object-fit:contain}
 figcaption{margin-top:12px;font-size:11px;letter-spacing:.1em;opacity:.7}
 figure{margin:0}
</style>
<h1>Monograma IJ — opções de cruzamento</h1>
<div class="grade">${cartoes}</div>`);

console.log('> monograma-opcoes.html');
export { comporMonograma, svgMonograma };
