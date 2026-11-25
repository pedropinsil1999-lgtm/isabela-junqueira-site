/**
 * Amplia as fotos de Damha IV de 1080 para 1800 px.
 *
 * O original é story do Instagram: 1080 px de largura. Em tela cheia num monitor
 * de 1440+ o navegador estica com interpolação bilinear e a foto fica borrada.
 * Ampliar aqui com lanczos3 + máscara de nitidez não inventa detalhe, mas entrega
 * uma imagem que o navegador exibe perto de 1:1 em vez de esticar — e isso se vê.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const ORIG = path.join(RAIZ, 'entrada', 'cortado-damha');
const DEST = path.join(RAIZ, 'entrada', 'damha-ampliado');
fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });

const ALVO = 1800;
for (const f of fs.readdirSync(ORIG)) {
  const m = await sharp(path.join(ORIG, f)).metadata();
  const h = Math.round((m.height / m.width) * ALVO);
  await sharp(path.join(ORIG, f))
    .resize(ALVO, h, { kernel: 'lanczos3' })
    .sharpen({ sigma: 0.8, m1: 0.6, m2: 0.9 })
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toFile(path.join(DEST, f));
  console.log(`  ${f}  ${m.width}×${m.height} → ${ALVO}×${h}`);
}
console.log('> ampliadas');
