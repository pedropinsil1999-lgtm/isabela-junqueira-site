// uso: node shot.mjs <arquivo.html> <saida.png> [largura] [altura]
import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [, , entrada, saida, w = '1500', h = '600'] = process.argv;
const nav = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await nav.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 });
ctx.setDefaultTimeout(120000);
const page = await ctx.newPage();
page.on('console', (m) => m.type() === 'error' && console.log('erro:', m.text().slice(0, 140)));
await page.goto(pathToFileURL(path.resolve(entrada)).href, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: path.resolve(saida), fullPage: true });
console.log('>', saida);
await nav.close();
