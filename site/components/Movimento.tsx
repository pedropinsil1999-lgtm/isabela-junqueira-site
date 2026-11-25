'use client';

import { useEffect } from 'react';
import type LenisTipo from 'lenis';
import { aoOcioso, carregarGsap, semMovimento } from '@/lib/movimento';

/**
 * Camada de movimento: Lenis sincronizado com o ScrollTrigger.
 *
 * Tudo aqui — GSAP, ScrollTrigger e Lenis — entra como chunk assíncrono, depois da
 * primeira pintura. Scroll suave é conforto; o conteúdo já está legível antes disso,
 * com o scroll nativo funcionando normalmente.
 */
export function Movimento() {
  useEffect(() => {
    if (semMovimento()) {
      // sem scroll suave: o scroll nativo é exatamente o que a pessoa pediu
      carregarGsap().then(({ ScrollTrigger }) => ScrollTrigger.refresh());
      return;
    }

    let cancelado = false;
    let lenis: LenisTipo | null = null;
    let tick: ((t: number) => void) | null = null;
    let limparRefresh: (() => void) | null = null;

    aoOcioso(() => {
      if (cancelado) return;
      Promise.all([carregarGsap(), import('lenis')]).then(([{ gsap, ScrollTrigger }, L]) => {
        if (cancelado) return;

        lenis = new L.default({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.6, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);

        tick = (t: number) => lenis?.raf(t * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        /* Sem scrollerProxy de propósito.
           O Lenis, no modo padrão, rola a própria janela: o ScrollTrigger já lê a
           posição certa sozinho. Com um proxy apontando para `lenis.scroll`, um
           window.scrollTo (link âncora, restauração de posição, teclado) não atualiza
           o valor que o proxy devolve, o ScrollTrigger acha que ainda está no topo e
           as animações de entrada nunca disparam. Ver DECISOES.md. */

        // o briefing usa isto para travar o scroll do fundo
        (window as unknown as { __lenis?: LenisTipo }).__lenis = lenis;

        const refrescar = () => ScrollTrigger.refresh();
        document.fonts?.ready.then(refrescar);
        window.addEventListener('load', refrescar);
        const t = setTimeout(refrescar, 900);
        limparRefresh = () => {
          clearTimeout(t);
          window.removeEventListener('load', refrescar);
        };
      });
    });

    return () => {
      cancelado = true;
      limparRefresh?.();
      lenis?.destroy();
      delete (window as unknown as { __lenis?: LenisTipo }).__lenis;
      carregarGsap().then(({ gsap, ScrollTrigger }) => {
        if (tick) gsap.ticker.remove(tick);
        ScrollTrigger.getAll().forEach((s) => s.kill());
      });
    };
  }, []);

  return null;
}
