'use client';

import { useEffect, useRef } from 'react';
import { aoOcioso, carregarGsap } from '@/lib/movimento';

/**
 * Cursor customizado: ponto de 10 px em travertino que cresce para 56 px com rótulo.
 * Some no touch e com prefers-reduced-motion.
 *
 * Qualquer elemento com data-cursor="Ver" dispara o estado grande com esse rótulo.
 */
export function Cursor() {
  const pontoRef = useRef<HTMLDivElement>(null);
  const rotuloRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fino = window.matchMedia('(pointer: fine)').matches;
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fino || reduzido) return;

    const ponto = pontoRef.current;
    const rotulo = rotuloRef.current;
    if (!ponto || !rotulo) return;

    let vivo = true;
    let limpar: (() => void) | null = null;

    aoOcioso(() => {
      if (!vivo) return;
      carregarGsap().then(({ gsap }) => {
        if (!vivo) return;
        ponto.style.opacity = '1';

        const x = gsap.quickTo(ponto, 'x', { duration: 0.42, ease: 'power3.out' });
        const y = gsap.quickTo(ponto, 'y', { duration: 0.42, ease: 'power3.out' });
        const mover = (e: PointerEvent) => { x(e.clientX); y(e.clientY); };

        let grande = false;
        const avaliar = (e: PointerEvent) => {
          const alvo = (e.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null;
          const quer = !!alvo;
          if (quer === grande) return;
          grande = quer;
          rotulo.textContent = alvo?.dataset.cursor || '';
          gsap.to(ponto, {
            width: quer ? 56 : 10,
            height: quer ? 56 : 10,
            backgroundColor: quer ? 'rgba(230,218,202,0.14)' : 'rgba(230,218,202,1)',
            borderWidth: quer ? 1 : 0,
            duration: 0.42,
            ease: 'power3.out',
          });
          gsap.to(rotulo, { opacity: quer ? 1 : 0, duration: 0.25 });
        };

        window.addEventListener('pointermove', mover, { passive: true });
        window.addEventListener('pointerover', avaliar, { passive: true });
        limpar = () => {
          window.removeEventListener('pointermove', mover);
          window.removeEventListener('pointerover', avaliar);
          gsap.killTweensOf([ponto, rotulo]);
        };
      });
    });

    return () => { vivo = false; limpar?.(); };
  }, []);

  return (
    <div
      ref={pontoRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[90] grid h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full opacity-0 mix-blend-difference"
      style={{
        backgroundColor: 'rgba(230,218,202,1)',
        borderStyle: 'solid',
        borderColor: 'rgba(230,218,202,0.55)',
        borderWidth: 0,
        marginLeft: 0,
        marginTop: 0,
      }}
    >
      <span
        ref={rotuloRef}
        className="eyebrow pointer-events-none whitespace-nowrap opacity-0"
        style={{ color: 'var(--color-travertino-200)', fontSize: 9 }}
      />
    </div>
  );
}
