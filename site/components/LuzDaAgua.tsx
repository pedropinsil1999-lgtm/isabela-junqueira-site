'use client';

import { useEffect, useRef } from 'react';

/**
 * Efeito de assinatura "Luz da água".
 * Cáusticas de piscina: a dobra do mapa de refração, 1/|det J|. Ver DECISOES.md.
 *
 * Só nas seções escuras, sempre atrás do texto, e com a força caindo onde há
 * bloco de texto por cima.
 */
export function LuzDaAgua({
  forca = 0.12,
  className = '',
}: {
  /** 0.05 a 0.12 — menor atrás de bloco de texto */
  forca?: number;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let inst: { destruir?: () => void } | null = null;
    let vivo = true;
    let io: IntersectionObserver | null = null;

    /* O shader só carrega quando a seção chega perto da tela E o main thread está
       ocioso. Compilar shader e criar contexto WebGL durante o carregamento empurra
       o LCP e engorda o TBT — e o fundo é decoração, não conteúdo. */
    const criar = () => {
      if (!vivo || inst) return;
      import('@/lib/luz-da-agua').then(({ criarLuzDaAgua }) => {
        if (!vivo) return;
        inst = criarLuzDaAgua(canvas, { forca });
      });
    };
    const quandoOcioso = (cb: () => void) =>
      'requestIdleCallback' in window
        ? (window as unknown as { requestIdleCallback: (c: () => void, o?: object) => void })
            .requestIdleCallback(cb, { timeout: 2500 })
        : setTimeout(cb, 1200);

    io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { io?.disconnect(); quandoOcioso(criar); } },
      { rootMargin: '200px' }
    );
    io.observe(canvas);

    return () => {
      vivo = false;
      io?.disconnect();
      inst?.destruir?.();
    };
  }, [forca]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}
