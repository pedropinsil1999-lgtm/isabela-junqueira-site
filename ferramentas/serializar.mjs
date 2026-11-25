/** Serializa comandos de um opentype Path em `d`, sem passar pelo toPathData
 *  (que emite NaN em curva quadrática em algumas versões). */
export function paraD(path, casas = 2) {
  const n = (v) => {
    if (!Number.isFinite(v)) throw new Error('coordenada inválida: ' + v);
    return Number(v.toFixed(casas)).toString();
  };
  const p = [];
  for (const c of path.commands) {
    switch (c.type) {
      case 'M': p.push(`M${n(c.x)} ${n(c.y)}`); break;
      case 'L': p.push(`L${n(c.x)} ${n(c.y)}`); break;
      case 'C': p.push(`C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`); break;
      case 'Q': p.push(`Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`); break;
      case 'Z': p.push('Z'); break;
    }
  }
  return p.join('');
}
