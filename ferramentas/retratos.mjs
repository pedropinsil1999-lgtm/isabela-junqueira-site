/**
 * Prepara os retratos: corta a faixa de luminária acesa na borda direita do
 * retrato da hero e levanta um pouco a exposição — as duas fotos são escuras
 * para o fundo osso da seção "A arquiteta".
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const ORIG = path.join(RAIZ, 'entrada', 'isabela');
const DEST = path.join(RAIZ, 'entrada', 'pessoa');
fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });

const clarear = (p) => p.modulate({ brightness: 1.07 }).linear(1.04, -4);

// hero: corta 10% da direita, onde está a luminária
{
  const m = await sharp(path.join(ORIG, '5.webp')).metadata();
  const w = Math.round(m.width * 0.9);
  await clarear(sharp(path.join(ORIG, '5.webp')).extract({ left: 0, top: 0, width: w, height: m.height }))
    .jpeg({ quality: 95 }).toFile(path.join(DEST, 'isabela-retrato.jpg'));
  console.log(`hero: ${m.width}×${m.height} → ${w}×${m.height}`);
}
// arquiteta: só clareia
{
  const m = await sharp(path.join(ORIG, '6.webp')).metadata();
  await clarear(sharp(path.join(ORIG, '6.webp'))).jpeg({ quality: 95 })
    .toFile(path.join(DEST, 'isabela-arquiteta.jpg'));
  console.log(`arquiteta: ${m.width}×${m.height}`);
}
