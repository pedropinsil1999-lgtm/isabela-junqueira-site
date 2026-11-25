/**
 * Loop de revisão: serve o export estático (com gzip), tira screenshots em
 * 390/768/1440 (topo, meio e fim), grava um scroll completo e coleta erro de console.
 * uso: node revisar.mjs <rodada>
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { servir } from './servir.mjs';

const RAIZ = path.resolve(process.cwd(), '..');
const RODADA = process.argv[2] || '1';
const SAIDA = path.join(RAIZ, 'entrada', 'revisao', `r${RODADA}`);
fs.mkdirSync(SAIDA, { recursive: true });

const srv = await servir(path.join(RAIZ, 'site', 'out'), 4400);
const BASE = 'http://127.0.0.1:4400';

const nav = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

const erros = [];
const relatorio = [];

const PAGINAS = [
  { url: '/', nome: 'home' },
  { url: '/projetos/', nome: 'indice' },
  { url: '/projetos/damha-iv/', nome: 'projeto' },
];
const LARGURAS = [
  { w: 390, h: 844, nome: '390' },
  { w: 768, h: 1024, nome: '768' },
  { w: 1440, h: 900, nome: '1440' },
];

for (const { w, h, nome: lw } of LARGURAS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 768 });
  ctx.setDefaultTimeout(120000);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') erros.push(`[${lw}] ${m.text().slice(0, 180)}`); });
  page.on('pageerror', (e) => erros.push(`[${lw}] pageerror: ${String(e).slice(0, 180)}`));
  page.on('response', (r) => { if (r.status() >= 400) erros.push(`[${lw}] HTTP ${r.status()} ${r.url().replace(BASE, '')}`); });

  for (const { url, nome } of PAGINAS) {
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2600);
    const alt = await page.evaluate(() => document.body.scrollHeight);
    for (const { r, t } of [{ r: 0, t: 'topo' }, { r: 0.42, t: 'meio' }, { r: 0.92, t: 'fim' }]) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round((alt - h) * r));
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(SAIDA, `${nome}-${lw}-${t}.png`), timeout: 180000 });
    }
    relatorio.push({ pagina: nome, largura: lw, alturaPagina: alt });
  }
  await ctx.close();
}

// ---- peso da primeira dobra na home, como o navegador recebe (comprimido) ----
const ctxP = await nav.newContext({ viewport: { width: 390, height: 844 } });
const pp = await ctxP.newPage();
let bytes = 0;
const porTipo = {};
pp.on('response', async (r) => {
  try {
    const h = r.headers();
    const n = Number(h['content-length'] || 0) || (await r.body().catch(() => Buffer.alloc(0))).length;
    bytes += n;
    const ct = (h['content-type'] || 'outro').split(';')[0];
    porTipo[ct] = (porTipo[ct] || 0) + n;
  } catch {}
});
await pp.goto(BASE + '/', { waitUntil: 'networkidle' });
await pp.waitForTimeout(2500);
await ctxP.close();

// ---- vídeo do scroll completo ----
const ctxV = await nav.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: path.join(SAIDA, 'video'), size: { width: 1440, height: 900 } },
});
const pv = await ctxV.newPage();
await pv.goto(BASE + '/', { waitUntil: 'networkidle' });
await pv.waitForTimeout(2800);
const altV = await pv.evaluate(() => document.body.scrollHeight);
for (let i = 0; i <= 60; i++) {
  await pv.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), Math.round((altV - 900) * (i / 60)));
  await pv.waitForTimeout(95);
}
await ctxV.close();

await nav.close();
srv.close();

const vid = fs.existsSync(path.join(SAIDA, 'video')) && fs.readdirSync(path.join(SAIDA, 'video'))[0];
if (vid) {
  fs.renameSync(path.join(SAIDA, 'video', vid), path.join(SAIDA, 'scroll-completo.webm'));
  fs.rmSync(path.join(SAIDA, 'video'), { recursive: true, force: true });
}

fs.writeFileSync(path.join(SAIDA, 'dados.json'), JSON.stringify({
  rodada: RODADA, relatorio, erros,
  pesoPrimeiraDobra: { total: bytes, kb: Math.round(bytes / 1024), porTipo },
}, null, 1));

console.log(`\n=== rodada ${RODADA} ===`);
console.log('erros de console:', erros.length);
erros.slice(0, 12).forEach((e) => console.log('  !', e));
console.log(`peso da home (390px, comprimido): ${Math.round(bytes / 1024)} KB`);
Object.entries(porTipo).sort((a, b) => b[1] - a[1]).slice(0, 6)
  .forEach(([k, v]) => console.log(`   ${k}: ${Math.round(v / 1024)} KB`));
console.log('alturas:', relatorio.filter((r) => r.largura === '1440').map((r) => `${r.pagina} ${r.alturaPagina}px`).join(' · '));
