/**
 * Processa o acervo curado: gradação única + AVIF/WebP em vários tamanhos.
 *
 * GRADAÇÃO (receita única, registrada em DECISOES.md):
 *   1. leve calor      — ganho de +2,5% no vermelho e −2,5% no azul, via .linear por canal
 *   2. contraste suave — curva S discreta, levantando o preto 3/255 para não entupir a sombra
 *   3. verde contido   — saturação global +4%, mas o verde puxado 6% para baixo com .recomb,
 *                        senão a folhagem densa dela estoura e vira neon
 *
 * Entrada:  entrada/curadoria/<arquivo>  (ou PASTA=...)
 * Saída:    site/public/fotos/<slug>/<base>-<largura>.{avif,webp}
 *           + manifesto.json com dimensões reais, para evitar CLS
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const ENTRADA = path.join(RAIZ, process.env.PASTA || 'entrada/curadoria');
const SAIDA = path.join(RAIZ, 'site', 'public', 'fotos');
const LARGURAS = [480, 768, 1080, 1440, 1800, 2400];

fs.mkdirSync(SAIDA, { recursive: true });

/** A gradação. Aplicada a toda foto, sem exceção, para o acervo virar uma série só. */
function graduar(pipeline) {
  return pipeline
    // 1. calor: vermelho sobe, azul desce
    .linear([1.025, 1.0, 0.975], [0, 0, 0])
    // 2. contraste suave com preto levantado
    .linear(1.06, -(255 * 0.06) / 2 + 3)
    // 3. saturação geral discreta
    .modulate({ saturation: 1.04 })
    // 4. segura o verde para a folhagem não virar neon
    .recomb([
      [1.00, 0.00, 0.00],
      [0.03, 0.94, 0.03],
      [0.00, 0.00, 1.00],
    ]);
}

const manifesto = [];
const arquivos = fs.readdirSync(ENTRADA).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

for (const f of arquivos) {
  const origem = path.join(ENTRADA, f);
  const meta = await sharp(origem).metadata();
  const slug = (process.env.SLUG || 'acervo');
  const base = f.replace(/\.\w+$/, '').replace(/[^a-zA-Z0-9]+/g, '-').slice(0, 42);
  const dir = path.join(SAIDA, slug);
  fs.mkdirSync(dir, { recursive: true });

  const feitos = [];
  for (const w of LARGURAS) {
    if (w > meta.width) continue;
    const h = Math.round((meta.height / meta.width) * w);
    for (const [fmt, opts] of [['avif', { quality: w >= 1200 ? 56 : 46, effort: 7 }], ['webp', { quality: w >= 1200 ? 80 : 74 }]]) {
      const destino = path.join(dir, `${base}-${w}.${fmt}`);
      await graduar(sharp(origem).resize(w, h, { fit: 'inside' }))[fmt](opts).toFile(destino);
    }
    feitos.push(w);
  }
  // garante o tamanho nativo quando ele fica entre dois degraus
  if (!feitos.includes(meta.width) && meta.width > (feitos[feitos.length - 1] || 0)) {
    const w = meta.width;
    for (const [fmt, opts] of [['avif', { quality: w >= 1200 ? 56 : 46, effort: 7 }], ['webp', { quality: w >= 1200 ? 80 : 74 }]]) {
      await graduar(sharp(origem))[fmt](opts).toFile(path.join(dir, `${base}-${w}.${fmt}`));
    }
    feitos.push(w);
  }

  manifesto.push({
    base, slug,
    largura: meta.width, altura: meta.height,
    proporcao: +(meta.width / meta.height).toFixed(4),
    tamanhos: feitos,
    origem: f,
  });
  console.log(`  ${base}  ${meta.width}×${meta.height}  →  ${feitos.join(', ')}`);
}

fs.writeFileSync(path.join(SAIDA, 'manifesto.json'), JSON.stringify(manifesto, null, 1));
console.log(`\n> ${manifesto.length} imagens processadas em site/public/fotos/`);
