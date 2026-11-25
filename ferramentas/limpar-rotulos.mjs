/**
 * Tira os rótulos que só repetem o nome da seção e os pontos finais dos títulos.
 * Substituição literal, sem regex, para não quebrar JSX por acidente.
 */
import fs from 'node:fs';
import path from 'node:path';

const SITE = path.resolve(process.cwd(), '..', 'site');

const trocas = [
  // ---- rótulos de seção: saem inteiros ----
  ['components/SecoesEstaticas.tsx',
    '<p className="eyebrow text-[color-mix(in_srgb,var(--color-tinta)_55%,transparent)]">Três frentes, um contrato</p>', ''],
  ['components/SecoesEstaticas.tsx',
    '<p className="eyebrow text-[var(--color-pedra-400)]">Onde ela atende</p>', ''],
  ['components/Arquiteta.tsx',
    `<p className="eyebrow text-[color-mix(in_srgb,var(--color-tinta)_55%,transparent)]">
            A arquiteta · {estudio.cidade}/{estudio.estado}
          </p>`, ''],
  ['components/IndiceProjetos.tsx',
    '<p className="eyebrow text-[var(--color-pedra-400)]">Projetos</p>', ''],
  ['components/Depoimentos.tsx',
    '<p className="eyebrow mb-12 px-6 text-[var(--color-pedra-400)] md:px-10">O que dizem</p>', ''],
  ['components/PaginaProjeto.tsx',
    '<p className="eyebrow text-[var(--color-pedra-400)]">Detalhe</p>', ''],
  ['app/privacidade/page.tsx',
    '<p className="eyebrow text-[color-mix(in_srgb,var(--color-tinta)_55%,transparent)]">Privacidade</p>', ''],

  // "Galeria" é nome de seção; "arraste" é instrução e fica
  ['components/PaginaProjeto.tsx',
    'Galeria <span className="ml-3 opacity-60">arraste</span>', 'Arraste para ver mais'],

  // ---- pontos finais em frase de destaque ----
  ['components/SecoesEstaticas.tsx', 'até as Maldivas.</em>', 'até as Maldivas</em>'],
  ['components/IndiceProjetos.tsx', 'nome próprio.</em>', 'nome próprio</em>'],
  ['app/not-found.tsx', 'não existe.</em>', 'não existe</em>'],
  ['app/privacidade/page.tsx', 'o que você escreve.</em>', 'o que você escreve</em>'],
  ['components/Briefing.tsx', 'Pedido pronto.\n      </h2>', 'Pedido pronto\n      </h2>'],
];

let feitas = 0, faltaram = [];
for (const [arq, de, para] of trocas) {
  const p = path.join(SITE, arq);
  let s = fs.readFileSync(p, 'utf8');
  if (!s.includes(de)) { faltaram.push(`${arq}: ${de.slice(0, 48)}…`); continue; }
  s = s.split(de).join(para);
  fs.writeFileSync(p, s);
  feitas++;
}
console.log(`${feitas} trocas aplicadas`);
if (faltaram.length) { console.log('NÃO ENCONTRADAS:'); faltaram.forEach((f) => console.log('  -', f)); }
