// Conta-gotas: extrai a paleta real das fotos e compara com os tokens iniciais.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const BRUTO = process.env.PASTA ? path.join(RAIZ, process.env.PASTA) : path.join(RAIZ, 'entrada', 'instagram', '_bruto');
const PROVAS = path.join(RAIZ, 'entrada', 'provas');
fs.mkdirSync(PROVAS, { recursive: true });

const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

function rgbParaHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  let h = 0;
  if (d) {
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60; if (h < 0) h += 360;
  }
  const l = (mx + mn) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return [h, s, l];
}

// k-means simples em RGB
function kmeans(pixels, k = 7, iter = 14) {
  let cent = [];
  for (let i = 0; i < k; i++) cent.push(pixels[Math.floor((i + 0.5) * pixels.length / k)].slice());
  for (let it = 0; it < iter; it++) {
    const somas = Array.from({ length: k }, () => [0, 0, 0, 0]);
    for (const p of pixels) {
      let melhor = 0, dist = Infinity;
      for (let c = 0; c < k; c++) {
        const d = (p[0] - cent[c][0]) ** 2 + (p[1] - cent[c][1]) ** 2 + (p[2] - cent[c][2]) ** 2;
        if (d < dist) { dist = d; melhor = c; }
      }
      somas[melhor][0] += p[0]; somas[melhor][1] += p[1]; somas[melhor][2] += p[2]; somas[melhor][3]++;
    }
    cent = somas.map((s, i) => (s[3] ? [s[0] / s[3], s[1] / s[3], s[2] / s[3]] : cent[i]));
  }
  const pesos = Array(k).fill(0);
  for (const p of pixels) {
    let melhor = 0, dist = Infinity;
    for (let c = 0; c < k; c++) {
      const d = (p[0] - cent[c][0]) ** 2 + (p[1] - cent[c][1]) ** 2 + (p[2] - cent[c][2]) ** 2;
      if (d < dist) { dist = d; melhor = c; }
    }
    pesos[melhor]++;
  }
  return cent.map((c, i) => ({ rgb: c, peso: pesos[i] / pixels.length }))
    .sort((a, b) => b.peso - a.peso);
}

const MIN = +(process.env.MIN || 1080);
const arquivos = fs.readdirSync(BRUTO).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
const todos = [];
const porFoto = [];

for (const f of arquivos) {
  try {
    const img = sharp(path.join(BRUTO, f));
    const m = await img.metadata();
    if (Math.min(m.width, m.height) < MIN) continue;
    const { data, info } = await img.resize(72, 72, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const px = [];
    for (let i = 0; i < data.length; i += info.channels) px.push([data[i], data[i + 1], data[i + 2]]);
    todos.push(...px);
    porFoto.push({ f, paleta: kmeans(px, 5).map((c) => ({ hex: hex(...c.rgb), peso: +c.peso.toFixed(3) })) });
  } catch {}
}

console.log(`amostrando ${porFoto.length} fotos, ${todos.length} pixels`);
const geral = kmeans(todos, 9);

// classifica cada centroide em familia
const familias = geral.map((c) => {
  const [h, s, l] = rgbParaHsl(...c.rgb);
  let fam = 'neutro';
  if (l < 0.18) fam = 'quase-preto';
  else if (s < 0.10) fam = l > 0.78 ? 'osso' : l > 0.5 ? 'travertino/areia' : 'cinza-pedra';
  else if (h >= 60 && h < 165) fam = 'verde (mata)';
  else if (h >= 165 && h < 205) fam = 'água';
  else if (h >= 18 && h < 60) fam = l > 0.62 ? 'areia/travertino' : 'madeira';
  else if (h < 18 || h >= 330) fam = 'terroso quente';
  return { hex: hex(...c.rgb), peso: +c.peso.toFixed(3), h: Math.round(h), s: +s.toFixed(2), l: +l.toFixed(2), familia: fam };
});

console.log('\n--- paleta real do acervo ---');
familias.forEach((c) => console.log(`${c.hex}  ${String(Math.round(c.peso * 100)).padStart(3)}%  H${String(c.h).padStart(3)} S${c.s} L${c.l}  ${c.familia}`));

fs.writeFileSync(path.join(PROVAS, 'paleta.json'), JSON.stringify({ geral: familias, porFoto }, null, 1));

// folha visual comparando com os tokens iniciais do briefing
const TOKENS = {
  'mata-950': '#0D1A14', 'mata-800': '#16281F', 'mata-600': '#2C4A38',
  'agua-500': '#2F8C85', 'agua-300': '#6FC3BA',
  'madeira-500': '#B0763F', 'madeira-300': '#D9A871',
  'travertino-200': '#E6DACA', 'areia-100': '#F1EAE0', 'osso': '#FAF7F2', 'tinta': '#15120E',
};
const chipReal = familias.map((c) =>
  `<div class="chip"><span style="background:${c.hex}"></span><b>${c.hex}</b><i>${Math.round(c.peso * 100)}% · ${c.familia}</i></div>`).join('');
const chipTok = Object.entries(TOKENS).map(([k, v]) =>
  `<div class="chip"><span style="background:${v}"></span><b>${v}</b><i>${k}</i></div>`).join('');

fs.writeFileSync(path.join(PROVAS, 'paleta.html'), `<!doctype html><meta charset="utf-8">
<style>
 body{background:#0D1A14;color:#E6DACA;font-family:ui-sans-serif,system-ui;margin:0;padding:44px}
 h2{font-weight:400;font-size:12px;letter-spacing:.22em;text-transform:uppercase;opacity:.65;margin:30px 0 16px}
 .fila{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px}
 .chip span{display:block;height:88px;border-radius:2px;border:1px solid rgba(230,218,202,.16)}
 .chip b{display:block;font-size:12px;font-weight:500;margin-top:8px;font-family:monospace}
 .chip i{display:block;font-size:11px;opacity:.6;font-style:normal;margin-top:2px}
</style>
<h2>Paleta amostrada das fotos (k-means, ${porFoto.length} imagens)</h2>
<div class="fila">${chipReal}</div>
<h2>Tokens iniciais do briefing</h2>
<div class="fila">${chipTok}</div>`);
console.log('\n> provas/paleta.html');
