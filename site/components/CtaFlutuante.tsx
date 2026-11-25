'use client';

import { useEffect, useState } from 'react';
import { useBriefing } from './BriefingContexto';
import { Botao } from './Botao';

/** Aparece depois da hero. No mobile vira barra fixa na base. */
export function CtaFlutuante() {
  const { abrir, aberto } = useBriefing();
  const [ver, setVer] = useState(false);

  useEffect(() => {
    const aoRolar = () => setVer(window.scrollY > window.innerHeight * 0.92);
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, []);

  if (aberto) return null;

  return (
    <>
      {/* desktop: botão flutuante no canto */}
      <div
        className="pointer-events-none fixed right-8 bottom-8 z-40 hidden transition-all duration-500 md:block"
        style={{ opacity: ver ? 1 : 0, transform: `translateY(${ver ? 0 : 14}px)` }}
        aria-hidden={!ver}
      >
        <Botao
          onClick={() => abrir('flutuante')}
          className="pointer-events-auto shadow-[0_8px_30px_rgba(0,0,0,.35)]"
          tabIndex={ver ? 0 : -1}
        >
          Começar meu projeto
        </Botao>
      </div>

      {/* mobile: barra fixa na base */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[color-mix(in_srgb,var(--color-travertino-200)_16%,transparent)] bg-[var(--color-mata-950)]/95 p-3 backdrop-blur transition-transform duration-500 md:hidden"
        style={{ transform: `translateY(${ver ? 0 : 110}%)` }}
        aria-hidden={!ver}
      >
        <button
          onClick={() => abrir('barra-mobile')}
          tabIndex={ver ? 0 : -1}
          className="eyebrow flex min-h-12 w-full items-center justify-center bg-[var(--color-madeira-500)] text-[var(--color-osso)]"
          style={{ borderRadius: 999 }}
        >
          Começar meu projeto
        </button>
      </div>
    </>
  );
}
