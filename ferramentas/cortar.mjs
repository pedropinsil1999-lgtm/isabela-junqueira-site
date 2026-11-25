/**
 * Corta o topo de cada foto, acima do adesivo de localização do Instagram.
 * É a própria tag dela, no projeto dela — tirar por corte é retoque, não
 * remoção de marca de terceiro. Todas saem em 1080×1400, mesma proporção.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const ORIGEM = path.join(RAIZ, 'entrada', 'curado-damha');
const DESTINO = path.join(RAIZ, 'entrada', 'cortado-damha');
fs.rmSync(DESTINO, { recursive: true, force: true });
fs.mkdirSync(DESTINO, { recursive: true });

// fração do topo a descartar, medida foto a foto
const CORTE = { '02': 0.17, '03': 0.17, '05': 0.13, '06': 0.19, '10': 0.28, '12': 0.19 };
const ALTURA = 1400;

for (const [n, frac] of Object.entries(CORTE)) {
  const arq = `ij__damha-iv__${n}.jpg`;
  const origem = path.join(ORIGEM, arq);
  const m = await sharp(origem).metadata();
  const topo = Math.round(m.height * frac);
  const disponivel = m.height - topo;
  const altura = Math.min(ALTURA, disponivel);
  await sharp(origem)
    .extract({ left: 0, top: topo, width: m.width, height: altura })
    .resize(1080, ALTURA, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 95 })
    .toFile(path.join(DESTINO, arq));
  console.log(`  ${n}: corta ${Math.round(frac * 100)}% do topo → 1080×${ALTURA}`);
}
console.log('> cortadas em entrada/cortado-damha/');
