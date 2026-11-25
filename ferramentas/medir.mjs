// Mede cada arquivo bruto: dimensao, cor media, e separa aprovados de descartados.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const BRUTO = path.join(RAIZ, 'entrada', 'instagram', '_bruto');
const arquivos = fs.readdirSync(BRUTO);

const linhas = [];
for (const f of arquivos) {
  const p = path.join(BRUTO, f);
  const grupo = f.split('__')[0];
  if (/\.(mp4|webm)$/i.test(f)) {
    linhas.push({ arquivo: f, grupo, tipo: 'video', w: 0, h: 0, kb: Math.round(fs.statSync(p).size / 1024) });
    continue;
  }
  try {
    const img = sharp(p);
    const m = await img.metadata();
    const est = await img.resize(1, 1, { fit: 'fill' }).raw().toBuffer();
    const { dominant } = await sharp(p).stats();
    linhas.push({
      arquivo: f, grupo, tipo: 'imagem',
      w: m.width, h: m.height,
      menor: Math.min(m.width, m.height),
      kb: Math.round(fs.statSync(p).size / 1024),
      media: `#${[...est].slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('')}`,
      dominante: `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`,
    });
  } catch (e) { linhas.push({ arquivo: f, grupo, tipo: 'erro', erro: e.message.slice(0, 40) }); }
}

const imgs = linhas.filter((l) => l.tipo === 'imagem');
const altas = imgs.filter((l) => l.menor >= 1080);
const medias = imgs.filter((l) => l.menor >= 640 && l.menor < 1080);
const baixas = imgs.filter((l) => l.menor < 640);

console.log(`imagens: ${imgs.length}  | >=1080: ${altas.length} | 640-1079: ${medias.length} | <640: ${baixas.length}`);
console.log(`videos: ${linhas.filter((l) => l.tipo === 'video').length}`);
console.log('\n--- por grupo, so >=1080 ---');
const porGrupo = {};
altas.forEach((l) => (porGrupo[l.grupo] = (porGrupo[l.grupo] || 0) + 1));
console.log(porGrupo);
console.log('\n--- amostra de dimensoes ---');
console.log([...new Set(imgs.map((l) => `${l.w}x${l.h}`))].sort().join('  '));

fs.writeFileSync(path.join(RAIZ, 'entrada', 'instagram', 'medidas.json'), JSON.stringify(linhas, null, 1));
console.log('\n> medidas.json');
