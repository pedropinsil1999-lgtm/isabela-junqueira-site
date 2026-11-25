import op from 'opentype.js';
import fs from 'node:fs';
import path from 'node:path';
import { paraD } from './serializar.mjs';

const RAIZ = path.resolve(process.cwd(), '..');
const f = op.parse(fs.readFileSync(path.join(RAIZ, 'fontes/Gambetta-Italic.ttf')).buffer.slice(0));
const TAM = 200, BASE = TAM * 0.74;
const TEXTO = 'Isabela Junqueira';

let x = 0;
const partes = [];
let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
for (const ch of TEXTO) {
  const g = f.charToGlyph(ch);
  const av = Number.isFinite(g.advanceWidth) ? g.advanceWidth : f.unitsPerEm * 0.26;
  if (ch !== ' ') {
    const p = g.getPath(x, BASE, TAM);
    partes.push(paraD(p));
    const b = p.getBoundingBox();
    x1 = Math.min(x1, b.x1); y1 = Math.min(y1, b.y1);
    x2 = Math.max(x2, b.x2); y2 = Math.max(y2, b.y2);
  }
  x += av * (TAM / f.unitsPerEm) - TAM * 0.012;
}

const d = partes.join(' ');
if (d.includes('NaN')) throw new Error('ainda há NaN no caminho');
const m = TAM * 0.12;
const vb = `${(x1 - m).toFixed(1)} ${(y1 - m).toFixed(1)} ${(x2 - x1 + m * 2).toFixed(1)} ${(y2 - y1 + m * 2).toFixed(1)}`;

fs.writeFileSync(path.join(RAIZ, 'site/lib/assinatura.ts'),
`// Assinatura: "Isabela Junqueira" em Instrument Serif Italic, em contorno.
// Gerado por ferramentas/assinatura.mjs. Traçada no scroll e depois preenchida.
export const ASSINATURA_VIEWBOX = '${vb}';
export const ASSINATURA_PATH = '${d}';
`);
fs.writeFileSync(path.join(RAIZ, 'marca/assinatura.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><path d="${d}" fill="currentColor"/></svg>`);
console.log('viewBox', vb, '| path', d.length, 'chars | sem NaN');
