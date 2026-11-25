'use client';

/**
 * Botão com glow no hover.
 *
 * Substituiu o botão magnético: o magnetismo exigia GSAP e um listener de
 * pointermove em toda a página por botão. O glow é só CSS — mais barato, e
 * lê melhor num site escuro, onde a luz é a linguagem.
 */
export function Botao({
  children, onClick, className = '', variante = 'solido', ...resto
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variante?: 'solido' | 'contorno' | 'grande';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const estilos = {
    solido: 'ij-glow bg-[var(--color-madeira-500)] text-[var(--color-osso)] px-7',
    contorno: 'ij-glow-leve border border-[color-mix(in_srgb,currentColor_28%,transparent)] px-7',
    grande: 'ij-glow bg-[var(--color-madeira-500)] text-[var(--color-osso)] px-10 min-h-[68px] text-[13px]',
  }[variante];

  return (
    <button
      onClick={onClick}
      data-cursor="Começar"
      className={`eyebrow relative inline-flex min-h-12 items-center justify-center transition-[box-shadow,background-color,color,transform] duration-400 ${estilos} ${className}`}
      style={{ borderRadius: 999 }}
      {...resto}
    >
      {children}
    </button>
  );
}
