// Gera a textura estática de cáusticas, usada nos cards sem foto.
import { chromium } from 'playwright';
import sharp from 'sharp';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const LAB = path.join(RAIZ, 'lab');
const srv = http.createServer((req, res) => {
  const a = path.join(LAB, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, ''));
  if (!fs.existsSync(a)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': a.endsWith('.js') ? 'text/javascript' : 'text/html' });
  fs.createReadStream(a).pipe(res);
});
await new Promise((r) => srv.listen(4323, r));

const nav = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await nav.newContext({ viewport: { width: 1100, height: 1375 }, deviceScaleFactor: 1 });
ctx.setDefaultTimeout(180000);
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:4323/textura.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
console.log('modo:', await page.evaluate(() => window.__pronto?.()));
const buf = await page.screenshot();
await nav.close(); srv.close();

const destino = path.join(RAIZ, 'site', 'public', 'textura');
fs.mkdirSync(destino, { recursive: true });
for (const [fmt, opts] of [['avif', { quality: 48 }], ['webp', { quality: 72 }]]) {
  await sharp(buf)[fmt](opts).toFile(path.join(destino, `luz-da-agua.${fmt}`));
}
const t = fs.statSync(path.join(destino, 'luz-da-agua.webp')).size;
console.log('> textura gerada,', Math.round(t / 1024), 'KB (webp)');
