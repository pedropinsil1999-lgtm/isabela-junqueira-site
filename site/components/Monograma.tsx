import { MARCA_PATHS, MARCA_VIEWBOX } from '@/lib/marca';

export function Monograma({ className = '', titulo = 'Isabela Junqueira Arquitetura' }: { className?: string; titulo?: string }) {
  return (
    <svg viewBox={MARCA_VIEWBOX} className={className} role="img" aria-label={titulo} fill="currentColor">
      <title>{titulo}</title>
      {MARCA_PATHS.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
