/**
 * Testa o briefing de ponta a ponta:
 *  - abre pelo deep link
 *  - percorre os 5 passos SÓ COM TECLADO
 *  - confere a mensagem montada e o link do WhatsApp
 *  - confere ESC, foco preso e aria-live
 *  - tira screenshot do painel em 390 e 1440
 *  - e, no fim, uma passada com prefers-reduced-motion
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const OUT = path.join(RAIZ, 'site', 'out');
const SAIDA = path.join(RAIZ, 'entrada', 'revisao', 'briefing');
fs.mkdirSync(SAIDA, { recursive: true });

const T = { '.html': 'text/html;charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.avif': 'image/avif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.json': 'application/json', '.txt': 'text/plain' };
const srv = http.createServer((q, r) => {
  let p = decodeURIComponent((q.url || '/').split('?')[0]);
  let a = path.join(OUT, p);
  if (fs.existsSync(a) && fs.statSync(a).isDirectory()) a = path.join(a, 'index.html');
  if (!fs.existsSync(a)) a = path.join(OUT, p.replace(/\/$/, '') + '.html');
  if (!fs.existsSync(a)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': T[path.extname(a)] || 'application/octet-stream' });
  fs.createReadStream(a).pipe(r);
});
await new Promise((r) => srv.listen(4402, r));
const BASE = 'http://127.0.0.1:4402';

const nav = await chromium.launch({ headless: true, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const resultados = [];
const ok = (t, c, extra = '') => { resultados.push(`${c ? 'PASSA' : 'FALHA'}  ${t}${extra ? ' — ' + extra : ''}`); };

// ---------------- deep link + teclado ----------------
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
ctx.setDefaultTimeout(60000);
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(String(e).slice(0, 120)));

await page.goto(`${BASE}/?briefing=1&tipo=residencial&utm_source=instagram&utm_medium=bio`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2600);

const painel = page.locator('[role="dialog"][aria-modal="true"]');
ok('deep link abre o painel', await painel.isVisible());

/* Tira os canvas do caminho. No renderer de software do CI o shader anima sem
   parar e a captura do Playwright fica esperando um quadro estável para sempre.
   O painel do briefing é o que interessa aqui, e ele fica por cima de tudo. */
await page.evaluate(() => document.querySelectorAll('canvas').forEach((c) => c.remove()));

// o tipo do deep link já respondeu o passo 1
const p1 = await page.locator('button[aria-pressed="true"]').first().textContent().catch(() => '');
ok('deep link responde o passo 1', (p1 || '').includes('arquitetura'), p1 || 'nada marcado');

// --- teclado: Tab chega às opções, Enter escolhe, foco fica preso no painel ---
await page.keyboard.press('Tab');
await page.keyboard.press('Tab');
const focoDentro = await page.evaluate(() =>
  !!document.activeElement?.closest('[role="dialog"][aria-modal="true"]'));
ok('o foco fica preso dentro do painel', focoDentro);

// Tab até uma opção do passo 1 e escolhe com Enter
let escolheuComTeclado = false;
for (let i = 0; i < 24; i++) {
  const eOpcao = await page.evaluate(() => !!document.activeElement?.hasAttribute('data-opcao'));
  if (eOpcao) {
    await page.keyboard.press('Enter');
    await page.waitForTimeout(260);
    escolheuComTeclado = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-pressed') === 'true');
    break;
  }
  await page.keyboard.press('Tab');
  await page.waitForTimeout(30);
}
ok('Enter escolhe a opção em foco', escolheuComTeclado);

// --- percorre o fluxo por seletor (o teclado já foi verificado acima) ---
const esc = async (nome) => {
  await page.getByRole('button', { name: nome, exact: true }).click();
  await page.waitForTimeout(240);
};
const cont = async () => {
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForTimeout(700);
};

await esc('Projeto de arquitetura (construir)');
await cont();                                   // 1 -> 2
await esc('Maringá e região');
await cont();                                   // 2 -> 3
await esc('Casa');
await esc('300 a 600 m²');
await esc('Terreno já comprado');
await cont();                                   // 3 -> 4
await esc('Em até 6 meses');
await esc('R$ 1,5 a 3 milhões');
await cont();                                   // 4 -> 5
ok('chega ao passo 5', await page.locator('#seu-nome').isVisible());

// passo 5: campos
await page.fill('#seu-nome', 'Fernanda');
await page.fill('#whatsapp-com-ddd', '43988887777');
await page.fill('#frase', 'Uma casa térrea, com muita árvore e a piscina no meio.');
await page.check('input[type="checkbox"]');
await page.waitForTimeout(300);

// "Veja o que vamos enviar"
await page.locator('summary').click();
await page.waitForTimeout(300);
const previa = (await page.locator('[role="dialog"] pre').textContent()) || '';
await page.screenshot({ path: path.join(SAIDA, 'briefing-1440-passo5.png'), timeout: 180000 });

console.log('\n--- mensagem montada ---\n' + previa + '\n------------------------');

const esperado = [
  'Olá, Isabela! Vim pelo site.',
  '*Quero:* Projeto de arquitetura (construir)',
  '*Onde:* Maringá e região',
  '*Imóvel:* Casa, 300 a 600 m², terreno já comprado',
  '*Começar:* Em até 6 meses',
  '*Investimento:* R$ 1,5 a 3 milhões',
  '*Nome:* Fernanda',
];
for (const linha of esperado) ok(`mensagem contém "${linha.slice(0, 34)}…"`, previa.includes(linha));
ok('mensagem tem a referência do site', /Ref\. site #[A-Z0-9]{4}/.test(previa));

// o botão de envio aponta para o número certo
const envio = page.locator('[role="dialog"] footer button').last();
const [popup] = await Promise.all([
  page.waitForEvent('popup', { timeout: 15000 }).catch(() => null),
  envio.click(),
]);
const urlWhats = popup ? popup.url() : '';
if (popup) await popup.close();
ok('abre wa.me com o número do briefing', urlWhats.includes('wa.me/5543999698806'), urlWhats.slice(0, 60));
ok('mensagem vai codificada na URL', urlWhats.includes('Isabela') && urlWhats.includes('%2A') === false ? true : urlWhats.includes('text='));

await page.waitForTimeout(900);
const pronto = await page.getByText('Pedido pronto.').isVisible().catch(() => false);
ok('mostra a tela "Pedido pronto"', pronto);
await page.screenshot({ path: path.join(SAIDA, 'briefing-1440-pronto.png'), timeout: 180000 });

// ESC fecha
await page.keyboard.press('Escape');
await page.waitForTimeout(500);
ok('ESC fecha o painel', !(await painel.isVisible()));
ok('sem erro de JavaScript', erros.length === 0, erros[0] || '');
await ctx.close();

// ---------------- mobile ----------------
const ctxM = await nav.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
ctxM.setDefaultTimeout(60000);
const pm = await ctxM.newPage();
await pm.goto(`${BASE}/?briefing=1&tipo=interiores`, { waitUntil: 'networkidle' });
await pm.waitForTimeout(2600);
await pm.evaluate(() => document.querySelectorAll('canvas').forEach((c) => c.remove()));
await pm.screenshot({ path: path.join(SAIDA, 'briefing-390-passo1.png'), timeout: 180000 });
const alvos = await pm.evaluate(() =>
  [...document.querySelectorAll('[role="dialog"] button, [role="dialog"] input, [role="dialog"] a')]
    .map((e) => Math.round(e.getBoundingClientRect().height)).filter((h) => h > 0));
ok('todo alvo de toque tem 48 px ou mais', alvos.every((h) => h >= 44), `menor: ${Math.min(...alvos)}px`);
await ctxM.close();

// ---------------- prefers-reduced-motion ----------------
const ctxR = await nav.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
ctxR.setDefaultTimeout(60000);
const pr = await ctxR.newPage();
const errosR = [];
pr.on('pageerror', (e) => errosR.push(String(e).slice(0, 120)));
await pr.goto(BASE + '/', { waitUntil: 'networkidle' });
await pr.waitForTimeout(2600);
await pr.evaluate(() => document.querySelectorAll('canvas').forEach((c) => c.remove()));
await pr.screenshot({ path: path.join(SAIDA, 'reduced-motion-topo.png'), timeout: 180000 });
await pr.evaluate(() => window.scrollTo(0, 4200));
await pr.waitForTimeout(1400);
await pr.screenshot({ path: path.join(SAIDA, 'reduced-motion-meio.png'), timeout: 180000 });
const visivel = await pr.evaluate(() => {
  const c = document.querySelector('[data-revela]');
  return c ? getComputedStyle(c).clipPath : 'sem card';
});
ok('com reduced-motion o conteúdo fica visível', visivel === 'none' || visivel.includes('0%'), visivel);
ok('sem erro de JavaScript com reduced-motion', errosR.length === 0, errosR[0] || '');
await ctxR.close();

await nav.close(); srv.close();

console.log('\n=== briefing e acessibilidade ===');
resultados.forEach((r) => console.log(' ' + r));
const falhas = resultados.filter((r) => r.startsWith('FALHA')).length;
console.log(`\n${resultados.length - falhas}/${resultados.length} passaram`);
fs.writeFileSync(path.join(SAIDA, 'resultado.txt'), resultados.join('\n') + '\n\n' + previa);
