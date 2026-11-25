// Contact sheets numeradas das imagens >= 1080px, para curadoria visual.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const BRUTO = path.join(RAIZ, 'entrada', 'instagram', '_bruto');
const SAIDA = path.join(RAIZ, 'entrada', 'instagram');

const MIN = +(process.env.MIN || 1080);
const POR_FOLHA = 12;
const COL = 4, CEL = 460, ROT = 34;

const arquivos = fs.readdirSync(BRUTO).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
const itens = [];
for (const f of arquivos) {
  try {
    const m = await sharp(path.join(BRUTO, f)).metadata();
    if (Math.min(m.width, m.height) < MIN) continue;
    if (process.env.MAX && Math.min(m.width, m.height) > +process.env.MAX) continue;
    itens.push({ f, w: m.width, h: m.height });
  } catch {}
}
itens.sort((a, b) => a.f.localeCompare(b.f));
console.log(`${itens.length} imagens >= ${MIN}px`);

const indice = [];
let folha = 0;
for (let i = 0; i < itens.length; i += POR_FOLHA) {
  const lote = itens.slice(i, i + POR_FOLHA);
  const linhas = Math.ceil(lote.length / COL);
  const W = COL * CEL, H = linhas * (CEL + ROT) + 56;

  const camadas = [];
  for (let k = 0; k < lote.length; k++) {
    const it = lote[k];
    const n = i + k + 1;
    indice.push({ n, ...it });
    const cx = (k % COL) * CEL, cy = Math.floor(k / COL) * (CEL + ROT) + 56;
    const buf = await sharp(path.join(BRUTO, it.f))
      .resize(CEL - 12, CEL - 12, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
    camadas.push({ input: buf, left: cx + 6, top: cy });
    const rot = `<svg width="${CEL}" height="${ROT}"><text x="8" y="22" font-family="monospace" font-size="17" fill="#E6DACA">${String(n).padStart(2, '0')} · ${it.w}×${it.h}</text></svg>`;
    camadas.push({ input: Buffer.from(rot), left: cx, top: cy + CEL - 10 });
  }
  const tit = `<svg width="${W}" height="56"><text x="8" y="36" font-family="monospace" font-size="26" fill="#D9A871">CONTACT SHEET ${++folha} — acervo Instagram (>=${MIN}px)</text></svg>`;
  camadas.unshift({ input: Buffer.from(tit), left: 0, top: 0 });

  const nome = `${process.env.PREFIXO || "contact-sheet"}-${String(folha).padStart(2, '0')}.jpg`;
  await sharp({ create: { width: W, height: H, channels: 3, background: '#0D1A14' } })
    .composite(camadas).jpeg({ quality: 82 }).toFile(path.join(SAIDA, nome));
  console.log('>', nome);
}
fs.writeFileSync(path.join(SAIDA, 'indice-contact.json'), JSON.stringify(indice, null, 1));
