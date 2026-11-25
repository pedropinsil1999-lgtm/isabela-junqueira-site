import { ASSINATURA_PATH, ASSINATURA_VIEWBOX } from '@/lib/assinatura';

/**
 * A assinatura dela em contorno. O traço se desenha no scroll (ver Sobre.tsx)
 * e o preenchimento entra depois.
 */
export function Assinatura({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox={ASSINATURA_VIEWBOX}
      className={className}
      role="img"
      aria-label="Assinatura de Isabela Junqueira"
      fill="none"
    >
      <title>Isabela Junqueira</title>
      <path
        d={ASSINATURA_PATH}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1}
        stroke="currentColor"
        strokeWidth={1.6}
        fill="currentColor"
        fillOpacity={0.92}
      />
    </svg>
  );
}
