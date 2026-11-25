// Checagem de contraste WCAG dos pares que o site realmente usa.
const T = {
  'mata-950': '#0D1A14', 'mata-900': '#112118', 'mata-800': '#16281F', 'mata-600': '#2C4A38',
  'agua-500': '#2F8C85', 'agua-300': '#6FC3BA',
  'madeira-500': '#A96836', 'madeira-300': '#DEA96A',
  'pedra-400': '#A2866A', 'travertino-200': '#E6DACA', 'areia-100': '#F1EAE0',
  'osso': '#FAF7F2', 'tinta': '#1C1611',
};
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const razao = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const pares = [
  ['travertino-200', 'mata-950', 'corpo sobre escuro'],
  ['travertino-200', 'mata-900', 'corpo sobre escuro 900'],
  ['osso', 'mata-950', 'título sobre escuro'],
  ['madeira-300', 'mata-950', 'ênfase itálica sobre escuro'],
  ['madeira-300', 'mata-800', 'ênfase sobre mata-800'],
  ['agua-300', 'mata-950', 'acento água sobre escuro'],
  ['agua-500', 'mata-950', 'acento água 500 sobre escuro'],
  ['pedra-400', 'mata-950', 'texto secundário sobre escuro'],
  ['tinta', 'osso', 'corpo sobre claro'],
  ['tinta', 'areia-100', 'corpo sobre areia'],
  ['madeira-500', 'osso', 'ênfase sobre claro'],
  ['mata-600', 'osso', 'texto verde sobre claro'],
  ['mata-950', 'osso', 'título sobre claro'],
];

console.log('par'.padEnd(46), 'razão'.padStart(6), ' AA-peq AA-grande');
let falhas = 0;
for (const [f, b, nota] of pares) {
  const r = razao(T[f], T[b]);
  const peq = r >= 4.5, gr = r >= 3;
  if (!peq) falhas++;
  console.log(
    `${nota} (${f}/${b})`.padEnd(46),
    r.toFixed(2).padStart(6),
    (peq ? '  pass' : '  FALHA').padEnd(8),
    gr ? 'pass' : 'FALHA'
  );
}
console.log(`\n${falhas} par(es) reprovados em texto pequeno — devem ser usados só em texto grande ou filete.`);
