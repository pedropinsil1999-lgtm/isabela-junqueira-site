import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const LAB = path.join(RAIZ, 'lab');
const SAIDA = path.join(RAIZ, 'entrada', 'provas');
fs.mkdirSync(SAIDA, { recursive: true });

const tipos = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const servidor = http.createServer((req, res) => {
  const arq = path.join(LAB, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
  if (!arq.startsWith(LAB) || !fs.existsSync(arq)) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'content-type': tipos[path.extname(arq)] || 'application/octet-stream' });
  fs.createReadStream(arq).pipe(res);
});
await new Promise((r) => servidor.listen(4321, r));
const base = 'http://127.0.0.1:4321/luz-da-agua.html';

const nav = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

// --- screenshots ---
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
ctx.setDefaultTimeout(120000);
const page = await ctx.newPage();
page.on('console', (m) => m.type() === 'error' && console.log('  console:', m.text().slice(0, 120)));
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
console.log('modo de render:', await page.evaluate(() => window.__luz && window.__luz()));

await page.screenshot({ path: path.join(SAIDA, 'luz-01-base.png') });

// ponteiro no terco esquerdo
await page.mouse.move(430, 520);
await page.waitForTimeout(1800);
await page.screenshot({ path: path.join(SAIDA, 'luz-02-ponteiro-esq.png') });

// ponteiro atravessando
for (let x = 430; x <= 1100; x += 48) { await page.mouse.move(x, 520 - (x - 430) * 0.25); await page.waitForTimeout(45); }
await page.waitForTimeout(1400);
await page.screenshot({ path: path.join(SAIDA, 'luz-03-ponteiro-dir.png') });

// com scroll
await page.evaluate(() => window.scrollTo(0, 420));
await page.waitForTimeout(1600);
await page.screenshot({ path: path.join(SAIDA, 'luz-04-scroll.png') });

// forca baixa (5%) - como fica atras de texto
await page.evaluate(() => window.scrollTo(0, 0));
await page.click('#btn-forca');
await page.waitForTimeout(1500);
await page.screenshot({ path: path.join(SAIDA, 'luz-05-forca-baixa.png') });

// reduced motion
await page.click('#btn-reduzido');
await page.waitForTimeout(1200);
console.log('modo reduzido:', await page.evaluate(() => window.__luz && window.__luz()));
await page.screenshot({ path: path.join(SAIDA, 'luz-06-reduced-motion.png') });
await ctx.close();

// --- mobile, com toque ---
const ctxM = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
ctxM.setDefaultTimeout(120000);
const pm = await ctxM.newPage();
await pm.goto(base, { waitUntil: 'networkidle' });
await pm.waitForTimeout(2200);
await pm.touchscreen.tap(200, 430);
await pm.waitForTimeout(650);
await pm.screenshot({ path: path.join(SAIDA, 'luz-07-mobile-toque.png') });
await ctxM.close();

// --- video curto ---
const ctxV = await nav.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: path.join(SAIDA, 'video'), size: { width: 1280, height: 720 } },
});
ctxV.setDefaultTimeout(120000);
const pv = await ctxV.newPage();
await pv.goto(base, { waitUntil: 'networkidle' });
await pv.waitForTimeout(1500);
for (let i = 0; i < 70; i++) {
  const x = 300 + Math.sin(i / 9) * 420 + i * 4;
  const y = 460 + Math.cos(i / 6) * 180;
  await pv.mouse.move(x, y);
  await pv.waitForTimeout(70);
}
await pv.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }));
await pv.waitForTimeout(2200);
await ctxV.close();

await nav.close();
servidor.close();

const vid = fs.readdirSync(path.join(SAIDA, 'video')).find((f) => f.endsWith('.webm'));
if (vid) {
  fs.renameSync(path.join(SAIDA, 'video', vid), path.join(SAIDA, 'luz-da-agua.webm'));
  fs.rmSync(path.join(SAIDA, 'video'), { recursive: true, force: true });
}
console.log('> provas em entrada/provas/');
