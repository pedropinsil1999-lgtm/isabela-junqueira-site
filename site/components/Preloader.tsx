'use client';

import { useEffect, useRef, useState } from 'react';
import { MARCA_PATHS, MARCA_VIEWBOX } from '@/lib/marca';

const CHAVE = 'ij-preloader-visto';

function avisarPronto() {
  document.documentElement.dataset.preloader = 'pronto';
  document.dispatchEvent(new CustomEvent('ij:preloader-pronto'));
}

/**
 * Máximo 1,1 s, só na primeira visita da sessão, pulável.
 *
 * Feito em CSS puro e um rAF para a contagem — SEM GSAP. O preloader é a primeira
 * coisa na tela: carregar uma biblioteca de animação aqui atrasaria exatamente o que
 * ele deveria cobrir. Ver REVISOES.md.
 */
export function Preloader() {
  const [mostrar, setMostrar] = useState<boolean | null>(null);
  const [saindo, setSaindo] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const contador = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let visto = false;
    try { visto = sessionStorage.getItem(CHAVE) === '1'; } catch { /* modo privado */ }
    if (visto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setMostrar(false); avisarPronto(); return;
    }
    try { sessionStorage.setItem(CHAVE, '1'); } catch { /* ok */ }
    setMostrar(true);
  }, []);

  useEffect(() => {
    if (!mostrar) return;

    // contagem até +1000, em rAF
    let raf = 0;
    const inicio = performance.now();
    const subir = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / 820);
      const v = Math.round(1000 * (1 - Math.pow(1 - t, 3))); // ease-out cúbico
      if (contador.current) contador.current.textContent = '+' + v;
      if (t < 1) raf = requestAnimationFrame(subir);
    };
    raf = requestAnimationFrame(subir);

    let encerrado = false;
    const sair = () => {
      if (encerrado) return;
      encerrado = true;
      cancelAnimationFrame(raf);
      setSaindo(true);
      // a cortina sobe; o tempo bate com a transição do CSS
      setTimeout(() => { setMostrar(false); avisarPronto(); }, 700);
    };

    const teto = setTimeout(sair, 1100);
    const el = raiz.current;
    el?.addEventListener('click', sair);
    document.addEventListener('keydown', sair, { once: true });

    return () => {
      clearTimeout(teto);
      cancelAnimationFrame(raf);
      el?.removeEventListener('click', sair);
      document.removeEventListener('keydown', sair);
    };
  }, [mostrar]);

  if (mostrar !== true) return null;

  return (
    <div
      ref={raiz}
      className="fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center bg-[var(--color-mata-950)]"
      style={{
        transform: saindo ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform .7s cubic-bezier(.65,0,.35,1)',
      }}
      role="status"
      aria-label="Carregando"
    >
      <style>{`
        @keyframes ij-tracar { to { stroke-dashoffset: 0 } }
        @keyframes ij-preencher { to { opacity: 1 } }
        .ij-traco { stroke-dasharray: 1; stroke-dashoffset: 1;
          animation: ij-tracar .72s cubic-bezier(.45,0,.2,1) forwards }
        .ij-traco:nth-child(2) { animation-delay: .1s }
        .ij-preenche { opacity: 0; animation: ij-preencher .34s ease-out .62s forwards }
      `}</style>

      <div
        className="flex flex-col items-center gap-7"
        style={{ opacity: saindo ? 0 : 1, transition: 'opacity .25s ease-in' }}
      >
        <svg viewBox={MARCA_VIEWBOX} className="h-[22vmin] w-auto" aria-hidden="true">
          <g fill="none" stroke="var(--color-madeira-300)" strokeWidth={7} strokeLinejoin="round">
            {MARCA_PATHS.map((d, i) => (
              <path key={i} className="ij-traco" d={d} pathLength={1} />
            ))}
          </g>
          <g className="ij-preenche" fill="var(--color-osso)">
            {MARCA_PATHS.map((d, i) => <path key={i} d={d} />)}
          </g>
        </svg>

        <span
          ref={contador}
          className="text-[var(--color-travertino-200)]"
          style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.5rem,4vw,2.5rem)' }}
        >
          +0
        </span>
        <span className="eyebrow text-[var(--color-pedra-400)]">projetos entregues</span>
      </div>

      <span className="eyebrow absolute bottom-7 text-[var(--color-pedra-400)] opacity-60">
        toque para pular
      </span>
    </div>
  );
}
