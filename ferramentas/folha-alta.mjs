import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const RAIZ = path.resolve(process.cwd(), '..');
const DIR = path.join(RAIZ, 'entrada', 'alta');
const arqs = fs.readdirSync(DIR).filter(f => f.startsWith('ij__')).sort();
const COL = 6, CEL = 300, ROT = 30;
const linhas = Math.ceil(arqs.length / COL);
const W = COL * CEL, H = linhas * (CEL + ROT) + 44;
const camadas = [{ input: Buffer.from(`<svg width="${W}" height="44"><text x="8" y="30" font-family="monospace" font-size="22" fill="#D9A871">ACERVO EM ALTA — sessao logada (${arqs.length} imagens, 1080x1920)</text></svg>`), left: 0, top: 0 }];
for (let i = 0; i < arqs.length; i++) {
  const cx = (i % COL) * CEL, cy = Math.floor(i / COL) * (CEL + ROT) + 44;
  const buf = await sharp(path.join(DIR, arqs[i])).resize(CEL - 8, CEL - 8, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
  camadas.push({ input: buf, left: cx + 4, top: cy });
  const nome = arqs[i].replace('ij__', '').replace('.jpg', '');
  camadas.push({ input: Buffer.from(`<svg width="${CEL}" height="${ROT}"><text x="6" y="20" font-family="monospace" font-size="15" fill="#E6DACA">${String(i+1).padStart(2,'0')} ${nome}</text></svg>`), left: cx, top: cy + CEL - 8 });
}
await sharp({ create: { width: W, height: H, channels: 3, background: '#0D1A14' } })
  .composite(camadas).jpeg({ quality: 84 }).toFile(path.join(RAIZ, 'entrada', 'provas', 'acervo-alta.jpg'));
console.log('ok', arqs.length);
