// Coletor v2: imagens em resolucao cheia via DOM + download direto.
// Video continua por interceptacao (MSE nao expoe URL no DOM).
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const SAIDA = path.join(RAIZ, 'entrada', 'instagram');
const BRUTO = path.join(SAIDA, '_bruto');
const PERFIL = 'https://www.instagram.com/isajunqueira_arquitetura/';
fs.mkdirSync(BRUTO, { recursive: true });

const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
const pausa = () => dorme(3000 + Math.random() * 3000);
const limpo = (s) => (s || '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/^-|-$/g, '');

const baixados = new Set();
const registro = [];
let ctxReq = null;

function chaveDe(url) {
  const seg = new URL(url).pathname.split('/').pop() || url;
  return seg.replace(/_(s|e|n)\d*(x\d+)?/g, '').replace(/\.\w+$/, '');
}

async function baixar(url, grupo, origem, pagina) {
  try {
    const k = chaveDe(url);
    if (baixados.has(k)) return;
    baixados.add(k);
    const r = await ctxReq.get(url, { timeout: 30000 });
    if (!r.ok()) return;
    const b = await r.body();
    if (b.length < 40_000) return;
    const ext = /\.png/.test(url) ? 'png' : /\.webp/.test(url) ? 'webp' : 'jpg';
    const nome = `${grupo}__${k.slice(0, 36)}.${ext}`.replace(/[^a-zA-Z0-9_.\-]/g, '_');
    fs.writeFileSync(path.join(BRUTO, nome), b);
    registro.push({ arquivo: nome, grupo, origem, pagina, midia: 'imagem', bytes: b.length });
    process.stdout.write(`  + ${nome} ${(b.length / 1024).toFixed(0)}KB\n`);
  } catch {}
}

const nav = await chromium.launch({ headless: true });
const ctx = await nav.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
ctx.setDefaultTimeout(60000);
ctxReq = ctx.request;
const page = await ctx.newPage();

// video por interceptacao, guardando sempre a maior versao
const vids = new Map();
let grupoAtual = 'feed';
page.on('response', async (res) => {
  try {
    const url = res.url();
    const ct = (res.headers()['content-type'] || '').toLowerCase();
    if (!ct.startsWith('video/') && !/\.mp4/.test(url)) return;
    if (!/scontent|cdninstagram|fbcdn/.test(url)) return;
    const b = await res.body().catch(() => null);
    if (!b || b.length < 200_000) return;
    const k = chaveDe(url);
    const ant = vids.get(k);
    if (ant && ant.bytes >= b.length) return;
    const nome = `${grupoAtual}__${k.slice(0, 36)}.mp4`.replace(/[^a-zA-Z0-9_.\-]/g, '_');
    fs.writeFileSync(path.join(BRUTO, nome), b);
    vids.set(k, { bytes: b.length, nome });
    process.stdout.write(`  ~ ${nome} ${(b.length / 1024).toFixed(0)}KB\n`);
  } catch {}
});

async function fechar() {
  for (const s of ['svg[aria-label="Fechar"]', 'svg[aria-label="Close"]']) {
    const e = await page.$(s);
    if (e) await e.click({ force: true }).catch(() => {});
  }
}

// ---------- grade ----------
console.log('> grade');
await page.goto(PERFIL, { waitUntil: 'domcontentloaded' });
await dorme(4500);
await fechar();
const posts = new Set();
for (let i = 0; i < 14; i++) {
  (await page.evaluate(() => [...document.querySelectorAll('a[href*="/p/"],a[href*="/reel/"]')].map((a) => a.href)))
    .forEach((u) => posts.add(u.split('?')[0]));
  await page.mouse.wheel(0, 2600);
  await dorme(2600 + Math.random() * 1800);
  if (posts.size >= 72) break;
}
console.log(`> ${posts.size} posts`);

const destaques = await page.evaluate(() =>
  [...document.querySelectorAll('a[href*="/stories/highlights/"]')]
    .map((a) => ({ url: a.href, id: (a.href.match(/highlights\/(\d+)/) || [])[1], titulo: (a.innerText || '').trim().split('\n')[0] }))
    .filter((d, i, arr) => d.id && arr.findIndex((x) => x.id === d.id) === i));

// ---------- posts ----------
const legendas = [];
let n = 0;
for (const url of posts) {
  if (n++ >= 55) break;
  grupoAtual = 'feed';
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await dorme(3000);
    await fechar();
    const meta = await page.evaluate(() => ({
      og: document.querySelector('meta[property="og:description"]')?.content || '',
      ogimg: document.querySelector('meta[property="og:image"]')?.content || '',
    }));
    legendas.push({ url, legenda: meta.og });

    for (let c = 0; c < 10; c++) {
      const achados = await page.evaluate(() =>
        [...document.querySelectorAll('article img, main img, img[decoding]')]
          .filter((i) => i.naturalWidth >= 700)
          .map((i) => ({ src: i.src, w: i.naturalWidth, h: i.naturalHeight, alt: i.alt })));
      for (const a of achados) await baixar(a.src, 'feed', 'post', url);
      const prox = await page.$('button[aria-label="Avançar"], button[aria-label="Next"], div[role="button"][aria-label="Avançar"]');
      if (!prox) break;
      await prox.click({ force: true }).catch(() => {});
      await dorme(1800);
    }
    if (meta.ogimg) await baixar(meta.ogimg, 'feed', 'og', url);
  } catch (e) { console.log('  ! ' + e.message.slice(0, 60)); }
  await pausa();
}

// ---------- destaques ----------
for (const d of destaques) {
  const g = limpo(d.titulo) || `hl-${d.id}`;
  grupoAtual = g;
  console.log(`> destaque ${d.titulo}`);
  try {
    await page.goto(d.url, { waitUntil: 'domcontentloaded' });
    await dorme(4500);
    await fechar();
    let repetidos = 0, ultimo = '';
    for (let s = 0; s < 28; s++) {
      if (!page.url().includes('/stories/')) break;
      const atual = await page.evaluate(() => {
        const im = [...document.querySelectorAll('img')].filter((i) => i.naturalWidth >= 400)
          .sort((a, b) => b.naturalWidth - a.naturalWidth)[0];
        return im ? { src: im.src, w: im.naturalWidth, h: im.naturalHeight } : null;
      });
      if (atual) {
        if (atual.src === ultimo) { if (++repetidos >= 4) break; } else { repetidos = 0; ultimo = atual.src; }
        await baixar(atual.src, g, 'destaque', d.url);
      }
      // avanca tocando no terco direito do visualizador
      await page.mouse.click(1150, 450).catch(() => {});
      await dorme(2600 + Math.random() * 1200);
    }
  } catch (e) { console.log('  ! ' + e.message.slice(0, 60)); }
  await pausa();
}

const antigo = fs.existsSync(path.join(SAIDA, 'coleta.json'))
  ? JSON.parse(fs.readFileSync(path.join(SAIDA, 'coleta.json'), 'utf8')) : {};
fs.writeFileSync(path.join(SAIDA, 'coleta.json'),
  JSON.stringify({ ...antigo, destaques, legendas: [...(antigo.legendas || []), ...legendas], registro }, null, 2));
console.log(`\n> fim. ${registro.length} imagens, ${vids.size} videos`);
await nav.close();
