// Coletor v3: so o feed, mais fundo e esperando o full-res trocar a miniatura.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const SAIDA = path.join(RAIZ, 'entrada', 'instagram');
const BRUTO = path.join(SAIDA, '_bruto');
const PERFIL = 'https://www.instagram.com/isajunqueira_arquitetura/';

const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
const pausa = () => dorme(3000 + Math.random() * 3000);

const jaTem = new Set(fs.readdirSync(BRUTO).map((f) => f.split('__')[1]?.replace(/\.\w+$/, '')).filter(Boolean));
const novos = [];
let ctxReq;

const chave = (u) => (new URL(u).pathname.split('/').pop() || u).replace(/_(s|e|n)\d*(x\d+)?/g, '').replace(/\.\w+$/, '');

async function baixar(url, pagina) {
  try {
    const k = chave(url);
    if (jaTem.has(k.slice(0, 36)) || jaTem.has(k)) return;
    jaTem.add(k.slice(0, 36));
    const r = await ctxReq.get(url, { timeout: 30000 });
    if (!r.ok()) return;
    const b = await r.body();
    if (b.length < 80_000) return;
    const nome = `feed__${k.slice(0, 36)}.jpg`.replace(/[^a-zA-Z0-9_.\-]/g, '_');
    fs.writeFileSync(path.join(BRUTO, nome), b);
    novos.push({ arquivo: nome, pagina, bytes: b.length });
    process.stdout.write(`  + ${nome} ${(b.length / 1024).toFixed(0)}KB\n`);
  } catch {}
}

const nav = await chromium.launch({ headless: true });
const ctx = await nav.newContext({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 2,          // pede ao IG a versao maior
  locale: 'pt-BR',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
ctx.setDefaultTimeout(60000);
ctxReq = ctx.request;
const page = await ctx.newPage();

async function fechar() {
  for (const s of ['svg[aria-label="Fechar"]', 'svg[aria-label="Close"]']) {
    const e = await page.$(s); if (e) await e.click({ force: true }).catch(() => {});
  }
}

console.log('> grade profunda');
await page.goto(PERFIL, { waitUntil: 'domcontentloaded' });
await dorme(5000);
await fechar();
const posts = new Set();
let parado = 0;
for (let i = 0; i < 22; i++) {
  const antes = posts.size;
  (await page.evaluate(() => [...document.querySelectorAll('a[href*="/p/"],a[href*="/reel/"]')].map((a) => a.href)))
    .forEach((u) => posts.add(u.split('?')[0]));
  if (posts.size === antes) { if (++parado >= 3) break; } else parado = 0;
  await page.mouse.wheel(0, 3000);
  await dorme(2800 + Math.random() * 1600);
  if (posts.size >= 110) break;
}
console.log(`> ${posts.size} posts na grade`);

// pega a maior imagem visivel, esperando o full-res substituir a miniatura
async function maiores() {
  let melhor = [];
  for (let tent = 0; tent < 4; tent++) {
    const achados = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter((i) => i.naturalWidth >= 900 && i.naturalHeight >= 900 || (i.naturalWidth >= 1080))
        .map((i) => ({ src: i.src, w: i.naturalWidth, h: i.naturalHeight })));
    if (achados.length > melhor.length) melhor = achados;
    if (achados.some((a) => a.w >= 1080)) break;
    await dorme(1200);
  }
  return melhor;
}

let n = 0;
for (const url of posts) {
  if (n++ >= 90) break;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await dorme(3200);
    await fechar();
    const og = await page.evaluate(() => document.querySelector('meta[property="og:image"]')?.content || '');
    if (og) await baixar(og, url);
    for (let c = 0; c < 10; c++) {
      for (const a of await maiores()) await baixar(a.src, url);
      const prox = await page.$('button[aria-label="Avançar"], button[aria-label="Next"]');
      if (!prox) break;
      await prox.click({ force: true }).catch(() => {});
      await dorme(2200);
    }
  } catch (e) { console.log('  ! ' + e.message.slice(0, 50)); }
  await pausa();
}
fs.writeFileSync(path.join(SAIDA, 'coleta3.json'), JSON.stringify({ posts: [...posts], novos }, null, 1));
console.log(`\n> fim. ${novos.length} novos`);
await nav.close();
