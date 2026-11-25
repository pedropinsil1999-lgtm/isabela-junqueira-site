import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const RAIZ = path.resolve(process.cwd(), '..');
const DIR = path.join(RAIZ, 'entrada', 'cortado-damha');
const usadas = ['02','03','05','06','10','12'];
const arqs = fs.readdirSync(DIR).filter(f => usadas.includes(f.match(/__(\d+)\.jpg/)[1])).sort();
const L = 240, A = 311;
const camadas = [];
for (let i = 0; i < arqs.length; i++) {
  const buf = await sharp(path.join(DIR, arqs[i])).resize(L, A, { fit: 'fill' }).jpeg({ quality: 92 }).toBuffer();
  camadas.push({ input: buf, left: i * (L + 8), top: 24 });
  const n = arqs[i].match(/__(\d+)\.jpg/)[1];
  camadas.push({ input: Buffer.from(`<svg width="${L}" height="22"><text x="4" y="16" font-family="monospace" font-size="16" fill="#DEA96A">${n}</text></svg>`), left: i * (L + 8), top: 0 });
}
await sharp({ create: { width: arqs.length * (L + 8), height: A + 30, channels: 3, background: '#0D1A14' } })
  .composite(camadas).jpeg({ quality: 92 }).toFile(path.join(RAIZ, 'entrada', 'provas', 'conferir-tudo.jpg'));
console.log('ok', arqs.length);
