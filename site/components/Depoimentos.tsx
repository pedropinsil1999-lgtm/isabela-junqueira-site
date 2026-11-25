'use client';

import { useEffect, useRef } from 'react';
import { efeitoGsap, semMovimento } from '@/lib/movimento';
import { depoimentos } from '@/data/depoimentos';

/** Marquee duplo em sentidos opostos, pausa no hover. Só com texto real. */
export function Depoimentos() {
  const raiz = useRef<HTMLElement>(null);

  useEffect(() => efeitoGsap(raiz, ({ gsap, ScrollTrigger, SplitText }) => {
    if (!depoimentos.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const faixas = raiz.current?.querySelectorAll<HTMLElement>('[data-faixa]');
    faixas?.forEach((f, i) => {
      const t = gsap.to(f.children, {
        xPercent: i === 0 ? -100 : 100, duration: 54, ease: 'none', repeat: -1,
      });
      f.addEventListener('pointerenter', () => gsap.to(t, { timeScale: 0, duration: 0.5 }));
      f.addEventListener('pointerleave', () => gsap.to(t, { timeScale: 1, duration: 0.5 }));
    });
  }), []);

  // Sem depoimento confirmado, a seção não existe. Ver data/depoimentos.ts.
  if (!depoimentos.length) return null;

  const metade = Math.ceil(depoimentos.length / 2);
  const faixas = [depoimentos.slice(0, metade), depoimentos.slice(metade)];

  return (
    <section ref={raiz} data-tema="escuro" className="grao relative overflow-hidden bg-[var(--color-mata-950)] py-24 md:py-32">
      
      {faixas.map((grupo, i) => (
        <div key={i} data-faixa className="mb-5 flex w-max" style={{ transform: i === 1 ? 'translateX(-50%)' : undefined }}>
          {[0, 1].map((d) => (
            <div key={d} className="flex shrink-0 gap-5 pr-5">
              {grupo.map((dep, j) => (
                <blockquote
                  key={j}
                  className="w-[clamp(280px,32vw,420px)] shrink-0 border border-[color-mix(in_srgb,var(--color-travertino-200)_16%,transparent)] p-7"
                  style={{ borderRadius: 'var(--radius-lg)' }}
                >
                  <p className="text-corpo-lg font-light text-[var(--color-travertino-200)]">
                    “{dep.texto}”
                  </p>
                  <footer className="eyebrow mt-5 text-[var(--color-madeira-300)]">
                    {dep.autor}
                    {dep.local ? ` · ${dep.local}` : ''}
                  </footer>
                </blockquote>
              ))}
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
