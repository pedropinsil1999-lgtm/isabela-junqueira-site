// Iteracao rapida do shader: uma captura so.
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const LAB = path.join(RAIZ, 'lab');
const SAIDA = path.join(RAIZ, 'entrada', 'provas');
fs.mkdirSync(SAIDA, { recursive: true });
const tipos = { '.html': 'text/html', '.js': 'text/javascript' };
const srv = http.createServer((req, res) => {
  const a = path.join(LAB, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, ''));
  if (!fs.existsSync(a)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': tipos[path.extname(a)] || 'text/plain' });
  fs.createReadStream(a).pipe(res);
});
await new Promise((r) => srv.listen(4322, r));

const nav = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const ctx = await nav.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
ctx.setDefaultTimeout(150000);
const page = await ctx.newPage();
page.on('console', (m) => m.type() === 'error' && console.log('erro:', m.text().slice(0, 160)));
await page.goto('http://127.0.0.1:4322/luz-da-agua.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
console.log('modo:', await page.evaluate(() => window.__luz?.()));
await page.mouse.move(400, 430);
await page.waitForTimeout(2200);
const nome = process.argv[2] || 'iter';
await page.screenshot({ path: path.join(SAIDA, `${nome}.png`) });
console.log('>', nome + '.png');
await nav.close(); srv.close();
