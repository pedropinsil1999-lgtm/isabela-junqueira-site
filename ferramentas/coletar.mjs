// Coletor de midia publica do perfil @isajunqueira_arquitetura
// Regras: sem login, sem burlar nada, pausas de 3-6s, teto de itens.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const RAIZ = path.resolve(process.cwd(), '..');
const SAIDA = path.join(RAIZ, 'entrada', 'instagram');
const BRUTO = path.join(SAIDA, '_bruto');
const PERFIL = 'https://www.instagram.com/isajunqueira_arquitetura/';
const TETO_MIDIA = 400; // arquivos brutos; a curadoria corta depois

fs.mkdirSync(BRUTO, { recursive: true });

const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
const pausa = () => dorme(3000 + Math.random() * 3000);

const vistos = new Map(); // chave -> { bytes, arquivo }
const manifesto = [];
let contexto = { grupo: 'perfil', tipo: 'desconhecido' };

function chaveDe(url) {
  try {
    const p = new URL(url).pathname;
    const seg = p.split('/').pop() || p;
    // remove sufixos de tamanho tipo _s640x640 / _e35 / stp=dst-jpg_e35_s1080x1080
    return seg.replace(/_(s|e)\d+(x\d+)?/g, '').replace(/\.(jpg|jpeg|webp|png|mp4|webm)$/i, '');
  } catch {
    return crypto.createHash('md5').update(url).digest('hex');
  }
}

async function registrarResposta(res) {
  try {
    const url = res.url();
    if (!/scontent|cdninstagram|fbcdn/.test(url)) return;
    const ct = (res.headers()['content-type'] || '').toLowerCase();
    const ehImg = ct.startsWith('image/');
    const ehVid = ct.startsWith('video/') || /\.mp4/.test(url);
    if (!ehImg && !ehVid) return;
    if (manifesto.length >= TETO_MIDIA) return;

    let buf;
    try { buf = await res.body(); } catch { return; }
    if (!buf || buf.length < 25_000) return; // descarta avatar, icone, thumb minusculo

    const chave = chaveDe(url);
    const anterior = vistos.get(chave);
    if (anterior && anterior.bytes >= buf.length) return; // ja temos versao maior

    const ext = ehVid ? 'mp4' : (ct.includes('webp') ? 'webp' : (ct.includes('png') ? 'png' : 'jpg'));
    const nome = `${contexto.grupo}__${chave.slice(0, 40)}.${ext}`.replace(/[^a-zA-Z0-9_.\-]/g, '_');
    const destino = path.join(BRUTO, nome);
    fs.writeFileSync(destino, buf);

    if (anterior && anterior.arquivo !== destino && fs.existsSync(anterior.arquivo)) {
      fs.unlinkSync(anterior.arquivo);
      const i = manifesto.findIndex((m) => m.arquivo === path.basename(anterior.arquivo));
      if (i >= 0) manifesto.splice(i, 1);
    }
    vistos.set(chave, { bytes: buf.length, arquivo: destino });
    manifesto.push({
      arquivo: nome,
      grupo: contexto.grupo,
      origem: contexto.tipo,
      url_origem: contexto.pagina || PERFIL,
      midia: ehVid ? 'video' : 'imagem',
      bytes: buf.length,
    });
    process.stdout.write(`  + ${nome} (${(buf.length / 1024).toFixed(0)} KB)\n`);
  } catch { /* ignora */ }
}

async function fecharModal(page) {
  for (const sel of ['svg[aria-label="Fechar"]', 'svg[aria-label="Close"]', 'button:has-text("Agora não")']) {
    const el = await page.$(sel);
    if (el) { await el.click({ force: true }).catch(() => {}); await dorme(800); }
  }
  await page.keyboard.press('Escape').catch(() => {});
}

const navegador = await chromium.launch({ headless: true });
const ctx = await navegador.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'pt-BR',
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
});
const page = await ctx.newPage();
page.on('response', registrarResposta);

// ---------- 1. perfil, bio e destaques ----------
console.log('> perfil');
await page.goto(PERFIL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await dorme(4000);
await fecharModal(page);
await dorme(1500);

const maisBio = await page.$('text=/^mais$/');
if (maisBio) { await maisBio.click().catch(() => {}); await dorme(1200); }

const bio = await page.evaluate(() => {
  const h = document.querySelector('header') || document.querySelector('main');
  return h ? h.innerText : '';
});

const destaques = await page.evaluate(() =>
  [...document.querySelectorAll('a[href*="/stories/highlights/"]')].map((a) => ({
    url: a.href,
    id: (a.href.match(/highlights\/(\d+)/) || [])[1],
    titulo: (a.innerText || '').trim().split('\n')[0],
    capa: a.querySelector('img')?.src || null,
  })).filter((d, i, arr) => d.id && arr.findIndex((x) => x.id === d.id) === i)
);
console.log(`> ${destaques.length} destaques:`, destaques.map((d) => d.titulo).join(' | '));

// ---------- 2. grade de posts ----------
console.log('> grade');
const posts = new Set();
for (let i = 0; i < 6; i++) {
  const novos = await page.evaluate(() =>
    [...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')].map((a) => a.href)
  );
  novos.forEach((u) => posts.add(u.split('?')[0]));
  await page.mouse.wheel(0, 2400);
  await pausa();
  if (posts.size >= 60) break;
}
console.log(`> ${posts.size} posts na grade`);

// ---------- 3. destaques: um grupo por projeto ----------
const legendas = [];
for (const d of destaques) {
  contexto = { grupo: d.titulo.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase() || `hl-${d.id}`, tipo: 'destaque', pagina: d.url };
  console.log(`> destaque: ${d.titulo}`);
  // capa do destaque
  if (d.capa) {
    try {
      const r = await ctx.request.get(d.capa);
      const b = await r.body();
      const n = `capa__${contexto.grupo}.jpg`;
      fs.writeFileSync(path.join(BRUTO, n), b);
      manifesto.push({ arquivo: n, grupo: contexto.grupo, origem: 'capa-destaque', url_origem: d.url, midia: 'imagem', bytes: b.length });
    } catch {}
  }
  try {
    await page.goto(d.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await dorme(4500);
    await fecharModal(page);
    for (let s = 0; s < 30; s++) {
      if (!page.url().includes('/stories/')) break;
      await page.keyboard.press('ArrowRight').catch(() => {});
      await dorme(3200 + Math.random() * 1800);
      if (manifesto.length >= TETO_MIDIA) break;
    }
  } catch (e) { console.log(`  ! ${d.titulo}: ${e.message.slice(0, 80)}`); }
  await pausa();
  if (manifesto.length >= TETO_MIDIA) break;
}

// ---------- 4. posts da grade: legenda + imagem grande ----------
contexto = { grupo: 'feed', tipo: 'post' };
let n = 0;
for (const url of posts) {
  if (n++ >= 40 || manifesto.length >= TETO_MIDIA) break;
  contexto = { grupo: 'feed', tipo: 'post', pagina: url };
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await dorme(2500);
    await fecharModal(page);
    const dados = await page.evaluate(() => ({
      alt: [...document.querySelectorAll('article img, main img')].map((i) => i.alt).filter(Boolean).slice(0, 4),
      og: document.querySelector('meta[property="og:description"]')?.content || '',
      titulo: document.title,
    }));
    legendas.push({ url, ...dados });
    // avanca carrossel
    for (let c = 0; c < 4; c++) {
      const prox = await page.$('button[aria-label="Avançar"], button[aria-label="Next"]');
      if (!prox) break;
      await prox.click().catch(() => {});
      await dorme(1600);
    }
  } catch (e) { console.log(`  ! post: ${e.message.slice(0, 60)}`); }
  await pausa();
}

fs.writeFileSync(path.join(SAIDA, 'coleta.json'), JSON.stringify({ bio, destaques, legendas, manifesto }, null, 2));
console.log(`\n> fim. ${manifesto.length} arquivos em _bruto/`);
await navegador.close();
