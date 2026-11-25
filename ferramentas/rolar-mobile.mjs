/**
 * Captura o mobile ENQUANTO ROLA, com rolagem gradual como a de um dedo.
 * O harness de revisão só capturava posições fixas depois de um salto, e por
 * isso não pegava o bug de animação de saída que aparecia durante o scroll.
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { servir } from './servir.mjs';

const RAIZ = path.resolve(process.cwd(), '..');
const SAIDA = path.join(RAIZ, 'entrada', 'provas');
const srv = await servir(path.join(RAIZ, 'site', 'out'), 4405);

const nav = await chromium.launch({
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const ctx = await nav.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
ctx.setDefaultTimeout(120000);
const page = await ctx.newPage();
await page.goto('http://127.0.0.1:4405/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
// o canvas animado impede a captura de estabilizar; o que interessa aqui é a foto
await page.evaluate(() => document.querySelectorAll('canvas').forEach((c) => c.remove()));

const quadros = [];
// rolagem gradual: 6 paradas ao longo da primeira dobra e meia
for (let i = 0; i < 6; i++) {
  if (i > 0) {
    for (let k = 0; k < 12; k++) {
      await page.mouse.wheel(0, 30);
      await page.waitForTimeout(28);
    }
  }
  await page.waitForTimeout(700);
  const y = await page.evaluate(() => Math.round(window.scrollY));
  const buf = await page.screenshot({ timeout: 120000 });
  quadros.push({ buf, y });
  console.log(`  quadro ${i + 1}: scrollY ${y}`);
}

// tira as áreas: brilho médio do topo da foto, para flagrar escurecimento
for (const q of quadros) {
  const s = await sharp(q.buf).extract({ left: 0, top: 300, width: 780, height: 500 }).stats();
  q.brilho = Math.round(s.channels.reduce((a, c) => a + c.mean, 0) / 3);
}
console.log('\nbrilho da foto por quadro:', quadros.map((q) => `${q.y}px→${q.brilho}`).join('  '));

// monta a tira
const L = 300, A = 650;
const camadas = [];
for (let i = 0; i < quadros.length; i++) {
  const img = await sharp(quadros[i].buf).resize(L, A, { fit: 'cover', position: 'top' }).jpeg({ quality: 86 }).toBuffer();
  camadas.push({ input: img, left: i * (L + 8), top: 26 });
  camadas.push({
    input: Buffer.from(`<svg width="${L}" height="24"><text x="4" y="18" font-family="monospace" font-size="15" fill="#DEA96A">scroll ${quadros[i].y}px · luz ${quadros[i].brilho}</text></svg>`),
    left: i * (L + 8), top: 0,
  });
}
await sharp({ create: { width: quadros.length * (L + 8), height: A + 30, channels: 3, background: '#0D1A14' } })
  .composite(camadas).jpeg({ quality: 86 }).toFile(path.join(SAIDA, 'mobile-rolando.jpg'));

console.log('> mobile-rolando.jpg');
await nav.close();
srv.close();
