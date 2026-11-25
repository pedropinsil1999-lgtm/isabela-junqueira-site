// Mostra a faixa inferior de cada foto, onde marca d'água costuma ficar.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const RAIZ = path.resolve(process.cwd(), '..');
const DIR = path.join(RAIZ, 'entrada', 'curado-damha');
const arqs = fs.readdirSync(DIR).sort();
const L = 540, A = 150;
const camadas = [];
for (let i = 0; i < arqs.length; i++) {
  const m = await sharp(path.join(DIR, arqs[i])).metadata();
  const buf = await sharp(path.join(DIR, arqs[i]))
    .extract({ left: 0, top: Math.round(m.height * 0.62), width: m.width, height: Math.round(m.height * 0.3) })
    .resize(L, A, { fit: 'fill' }).jpeg({ quality: 88 }).toBuffer();
  camadas.push({ input: buf, left: 0, top: i * (A + 20) + 2 });
  camadas.push({ input: Buffer.from(`<svg width="200" height="20"><text x="4" y="15" font-family="monospace" font-size="14" fill="#DEA96A">${arqs[i].replace('ij__damha-iv__','').replace('.jpg','')}</text></svg>`), left: L + 6, top: i * (A + 20) + 60 });
}
await sharp({ create: { width: L + 210, height: arqs.length * (A + 20), channels: 3, background: '#0D1A14' } })
  .composite(camadas).jpeg({ quality: 88 }).toFile(path.join(RAIZ, 'entrada', 'provas', 'conferir-marca.jpg'));
console.log('ok', arqs.length);
