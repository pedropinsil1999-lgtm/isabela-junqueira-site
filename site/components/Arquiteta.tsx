'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { efeitoGsap, semMovimento } from '@/lib/movimento';
import { estudio } from '@/data/estudio';
import { retratoArquiteta } from '@/data/retratos';
import { Foto } from './Foto';
import { Assinatura } from './Assinatura';

/**
 * "A arquiteta" — o sobrenome em escala de cartaz atrás dela.
 *
 * A estrutura segue a referência que o cliente trouxe (nome fantasma ao fundo,
 * retrato sobreposto, texto e botão à direita), mas na identidade daqui: fundo
 * osso em vez de cinza, o fantasma em travertino, e o sobrenome em itálico de
 * Gambetta, que é o recurso de ênfase do site inteiro.
 */
export function Arquiteta() {
  const raiz = useRef<HTMLElement>(null);

  useEffect(() => efeitoGsap(raiz, ({ gsap }) => {
    if (semMovimento()) return;
    // o retrato sobe um pouco mais devagar que a página
    gsap.fromTo('[data-arq-retrato]', { yPercent: 3.5 }, {
      yPercent: -3.5, ease: 'none',
      scrollTrigger: { trigger: raiz.current, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    // o nome fantasma anda em sentido contrário, de leve
    gsap.fromTo('[data-arq-fantasma]', { xPercent: -1.5 }, {
      xPercent: 1.5, ease: 'none',
      scrollTrigger: { trigger: raiz.current, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    const traco = raiz.current?.querySelector('[data-assinatura] path') as SVGPathElement | null;
    if (traco) {
      gsap.fromTo(traco, { strokeDashoffset: 1 }, {
        strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut',
        scrollTrigger: { trigger: traco, start: 'top 88%', once: true },
      });
    }
  }), []);

  return (
    <section
      ref={raiz}
      id="arquiteta"
      data-tema="claro"
      className="secao-clara relative overflow-hidden px-6 py-24 md:px-10 md:py-32"
    >
      {/* o sobrenome em escala de cartaz, atrás de tudo */}
      <span
        data-arq-fantasma
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 select-none text-center leading-[0.92]"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(3.6rem, 14vw, 14rem)',
          color: 'color-mix(in srgb, var(--color-travertino-200) 56%, var(--color-osso))',
          letterSpacing: '-0.03em',
        }}
      >
        junqueira
      </span>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 md:grid-cols-[minmax(0,46%)_minmax(0,1fr)] md:gap-16">
        {/* ela, em destaque */}
        <div
          data-arq-retrato
          className="relative mx-auto w-full max-w-[460px] overflow-hidden md:mx-0"
          style={{ borderRadius: 'var(--radius-xl)', aspectRatio: '4 / 5' }}
        >
          <Foto foto={retratoArquiteta} sizes="(min-width: 768px) 44vw, 90vw" />
        </div>

        {/* o texto — começa abaixo da linha de base do nome fantasma */}
        <div className="md:pt-32 md:pb-6">
          

          <h2 className="mt-5" style={{ fontSize: 'clamp(2.2rem, 4.6vw, 4rem)', lineHeight: 1.02 }}>
            Isabela <em className="text-[var(--color-madeira-500)]">Junqueira</em>
          </h2>

          <p className="mt-6 max-w-[48ch] text-corpo-lg font-light text-[color-mix(in_srgb,var(--color-tinta)_80%,transparent)]">
            {estudio.bio.primeiraPessoa}
          </p>

          <div data-assinatura className="mt-8">
            <Assinatura className="h-14 w-auto text-[var(--color-tinta)]" />
          </div>

          <Link
            prefetch={false}
            href="/sobre/"
            className="ij-glow-leve eyebrow mt-9 inline-flex min-h-12 items-center gap-3 border border-[color-mix(in_srgb,var(--color-tinta)_22%,transparent)] px-7 text-[var(--color-tinta)] transition-[box-shadow,border-color] duration-400"
            style={{ borderRadius: 999 }}
          >
            Ler mais sobre o escritório
            <span aria-hidden="true" className="text-[14px] leading-none">↗</span>
          </Link>

          {/* CAU: selo de credibilidade. Só aparece preenchido — nunca inventado. */}
          {estudio.cau && (
            <p className="eyebrow mt-8 border-t border-[color-mix(in_srgb,var(--color-tinta)_14%,transparent)] pt-5 text-[color-mix(in_srgb,var(--color-tinta)_62%,transparent)]">
              Registro CAU {estudio.cau}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
