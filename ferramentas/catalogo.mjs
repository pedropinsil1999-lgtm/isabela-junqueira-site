import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve(process.cwd(), '..');
const m = JSON.parse(fs.readFileSync(path.join(RAIZ, 'entrada/instagram/medidas.json'), 'utf8'));
const cur = new Set(fs.readdirSync(path.join(RAIZ, 'entrada/curadoria')));

const grupo = (f) => f.split('__')[0];
const linhas = m.filter((x) => x.tipo !== 'erro').sort((a, b) => (b.menor || 0) - (a.menor || 0));

const nota = (x) => {
  if (x.tipo === 'video') return 3;
  if (cur.has(x.arquivo)) return x.menor >= 1080 ? 5 : 4;
  return x.menor >= 640 ? 2 : 1;
};
const uso = (x) => {
  if (cur.has(x.arquivo)) return x.menor >= 1080 ? 'hero / galeria' : 'galeria pequena, detalhe';
  if (x.tipo === 'video') return 'a avaliar quadro a quadro';
  if (/^capa__/.test(x.arquivo)) return 'capa de destaque — referência de agrupamento';
  if (x.menor >= 1080) return 'DESCARTE — viagem, evento ou card de patrocinador';
  return 'DESCARTE — baixa resolução ou texto queimado';
};

const l = [];
l.push('# Catálogo do acervo coletado', '');
l.push('Origem: perfil público @isajunqueira_arquitetura, coletado com pausas de 3 a 6 s entre requisições.');
l.push('Nota de 1 a 5. Critérios e conclusões em `DECISOES.md`.', '');
l.push('| # | arquivo | grupo | tipo | resolução | nota | uso previsto |');
l.push('|---|---|---|---|---|---|---|');
linhas.forEach((x, i) => {
  const res = x.tipo === 'video' ? `${x.kb} KB` : `${x.w}×${x.h}`;
  l.push(`| ${i + 1} | \`${x.arquivo}\` | ${grupo(x.arquivo)} | ${x.tipo} | ${res} | ${nota(x)} | ${uso(x)} |`);
});
const aprov = linhas.filter((x) => nota(x) >= 4).length;
const vids = linhas.filter((x) => x.tipo === 'video').length;
l.push('', `**${linhas.length} arquivos · ${aprov} aprovados (nota ≥ 4) · ${vids} vídeos a triar**`, '');
l.push('## Agrupamento por projeto', '');
l.push('Os destaques nomeiam os projetos, mas as stories saem a 640 px sem login, então nenhum');
l.push('grupo tem material em alta suficiente para uma página completa. Estado por projeto:', '');
l.push('| projeto | destaque | mídia em alta | situação |');
l.push('|---|---|---|---|');
for (const p of ['Damha IV', 'Alphaville Maringá', 'Casa Nature', 'Golden House', 'Casa Del Este', 'Maldives 21', 'Casa Punta', 'Casa Fendi']) {
  l.push(`| ${p} | sim | 0 | aguarda arquivo original — ver TODO-CLIENTE.md |`);
}
l.push('', 'O único conjunto em alta sem dono identificado são **3 renders 1440×1800** de um projeto');
l.push('tropical (madeira ripada, palmeira, pedra, lareira externa). Qual projeto é, só ela sabe.');

fs.writeFileSync(path.join(RAIZ, 'entrada/instagram/CATALOGO.md'), l.join('\n'));
console.log(`CATALOGO.md: ${linhas.length} linhas, ${aprov} aprovados`);
