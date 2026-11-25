// Coletor v4: so visita os posts ja conhecidos e TROCA por versoes maiores.
// Nao varre a grade de novo: menos requisicao, mais resolucao.
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const SAIDA = path.join(RAIZ, 'entrada', 'instagram');
const BRUTO = path.join(SAIDA, '_bruto');

const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
const pausa = () => dorme(3500 + Math.random() * 2500);
const chave = (u) => (new URL(u).pathname.split('/').pop() || u)
  .replace(/_(s|e|n)\d*(x\d+)?/g, '').replace(/\.\w+$/, '').slice(0, 36);

// estado atual do disco: chave -> { nome, menorLado }
const atual = new Map();
for (const f of fs.readdirSync(BRUTO)) {
  if (!/\.(jpg|jpeg|png|webp)$/i.test(f)) continue;
  const k = f.split('__')[1]?.replace(/\.\w+$/, '');
  if (!k) continue;
  try {
    const m = await sharp(path.join(BRUTO, f)).metadata();
    atual.set(k, { nome: f, menor: Math.min(m.width, m.height) });
  } catch {}
}
console.log(`${atual.size} imagens ja no disco`);

const urls = new Set();
for (const arq of ['coleta.json', 'coleta3.json']) {
  const p = path.join(SAIDA, arq);
  if (!fs.existsSync(p)) continue;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  (d.posts || []).forEach((u) => urls.add(u));
  (d.legendas || []).forEach((l) => l.url && urls.add(l.url));
}
console.log(`${urls.size} posts conhecidos`);

const nav = await chromium.launch({ headless: true });
const ctx = await nav.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
ctx.setDefaultTimeout(60000);
const page = await ctx.newPage();

let trocados = 0, acrescentados = 0;
const legendas = [];

async function considerar(url, pagina) {
  try {
    const k = chave(url);
    const r = await ctx.request.get(url, { timeout: 30000 });
    if (!r.ok()) return;
    const b = await r.body();
    if (b.length < 60_000) return;
    const m = await sharp(b).metadata();
    const menor = Math.min(m.width, m.height);
    const ant = atual.get(k);
    if (ant && ant.menor >= menor) return;
    if (ant) { fs.rmSync(path.join(BRUTO, ant.nome), { force: true }); trocados++; }
    else acrescentados++;
    const nome = `feed__${k}.jpg`;
    fs.writeFileSync(path.join(BRUTO, nome), b);
    atual.set(k, { nome, menor });
    console.log(`  ${ant ? '^' : '+'} ${nome} ${m.width}x${m.height}`);
  } catch {}
}

let i = 0;
for (const u of urls) {
  console.log(`[${++i}/${urls.size}]`);
  try {
    await page.goto(u, { waitUntil: 'domcontentloaded' });
    await dorme(3400);
    for (const s of ['svg[aria-label="Fechar"]', 'svg[aria-label="Close"]']) {
      const e = await page.$(s); if (e) await e.click({ force: true }).catch(() => {});
    }
    const meta = await page.evaluate(() => ({
      og: document.querySelector('meta[property="og:image"]')?.content || '',
      desc: document.querySelector('meta[property="og:description"]')?.content || '',
    }));
    if (meta.desc) legendas.push({ url: u, legenda: meta.desc });
    if (meta.og) await considerar(meta.og, u);

    for (let c = 0; c < 10; c++) {
      const srcs = await page.evaluate(() =>
        [...document.querySelectorAll('img')].filter((x) => x.naturalWidth >= 800).map((x) => x.src));
      for (const s of srcs) await considerar(s, u);
      const prox = await page.$('button[aria-label="Avançar"], button[aria-label="Next"]');
      if (!prox) break;
      await prox.click({ force: true }).catch(() => {});
      await dorme(2000);
    }
  } catch (e) { console.log('  ! ' + e.message.slice(0, 50)); }
  await pausa();
}

fs.writeFileSync(path.join(SAIDA, 'legendas.json'), JSON.stringify(legendas, null, 1));
console.log(`\n> fim. ${trocados} trocados por versao maior, ${acrescentados} novos`);
await nav.close();
