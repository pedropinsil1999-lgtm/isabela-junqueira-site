// Lighthouse mobile sobre o export estático, servido com gzip.
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { servir } from './servir.mjs';

const RAIZ = path.resolve(process.cwd(), '..');
const SAIDA = path.join(RAIZ, 'entrada', 'revisao');
fs.mkdirSync(SAIDA, { recursive: true });

const srv = await servir(path.join(RAIZ, 'site', 'out'), 4403);

const nav = await chromium.launch({
  headless: true,
  args: ['--remote-debugging-port=9222', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});

const paginas = [
  ['home', 'http://127.0.0.1:4403/'],
  ['projeto', 'http://127.0.0.1:4403/projetos/damha-iv/'],
];
const resumo = [];

for (const [nome, url] of paginas) {
  const r = await lighthouse(url, {
    port: 9222,
    output: 'json',
    logLevel: 'error',
    screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
    formFactor: 'mobile',
    throttlingMethod: 'simulate',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  });
  const c = r.lhr.categories;
  const a = r.lhr.audits;
  const linha = {
    pagina: nome,
    performance: Math.round((c.performance.score || 0) * 100),
    acessibilidade: Math.round((c.accessibility.score || 0) * 100),
    boasPraticas: Math.round((c['best-practices'].score || 0) * 100),
    seo: Math.round((c.seo.score || 0) * 100),
    LCP: a['largest-contentful-paint'].displayValue,
    CLS: a['cumulative-layout-shift'].displayValue,
    TBT: a['total-blocking-time'].displayValue,
  };
  resumo.push(linha);
  fs.writeFileSync(path.join(SAIDA, `lighthouse-${nome}.json`), JSON.stringify(r.lhr, null, 1));

  console.log(`\n=== ${nome} ===`);
  console.log(linha);

  const reprovadas = [];
  for (const cat of ['performance', 'accessibility', 'best-practices', 'seo']) {
    for (const ref of c[cat].auditRefs) {
      const au = a[ref.id];
      if (au && au.score !== null && au.score < 0.9 && au.scoreDisplayMode !== 'informative') {
        reprovadas.push(`${cat}: ${au.title.slice(0, 62)}`);
      }
    }
  }
  if (reprovadas.length) {
    console.log('auditorias abaixo de 0,9:');
    [...new Set(reprovadas)].slice(0, 12).forEach((f) => console.log('  -', f));
  }
  const net = a['network-requests']?.details?.items || [];
  const tot = net.reduce((s, i) => s + (i.transferSize || 0), 0);
  console.log(`transferido: ${Math.round(tot / 1024)} KB`);
}

fs.writeFileSync(path.join(SAIDA, 'lighthouse-resumo.json'), JSON.stringify(resumo, null, 1));
await nav.close();
srv.close();
