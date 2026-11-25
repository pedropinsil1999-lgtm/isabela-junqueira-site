'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { efeitoGsap, semMovimento } from '@/lib/movimento';
import type { Projeto } from '@/data/projetos';
import { Foto } from './Foto';
import { LuzDaAgua } from './LuzDaAgua';
import { SemFoto } from './SemFoto';
import { Botao } from './Botao';
import { useBriefing } from './BriefingContexto';

export function PaginaProjeto({ projeto: p, proximo }: { projeto: Projeto; proximo: Projeto }) {
  const { abrir } = useBriefing();
  const raiz = useRef<HTMLDivElement>(null);
  const galeria = useRef<HTMLDivElement>(null);

  useEffect(() => efeitoGsap(raiz, ({ gsap, ScrollTrigger, SplitText }) => {
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzido) return;
    gsap.from('[data-proj-hero]', { clipPath: 'inset(0 0 100% 0)', duration: 1.2, ease: 'expo.out' });
    gsap.from('[data-proj-titulo]', { yPercent: 110, duration: 1.1, ease: 'expo.out', delay: 0.25 });
    gsap.from('[data-proj-ficha] > *', {
      y: 18, opacity: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out',
      scrollTrigger: { trigger: '[data-proj-ficha]', start: 'top 86%', once: true },
    });
  }), []);

  // galeria arrastável
  useEffect(() => {
    const el = galeria.current;
    if (!el) return;
    let baixo = false, inicioX = 0, inicioScroll = 0;
    const down = (e: PointerEvent) => {
      baixo = true; inicioX = e.clientX; inicioScroll = el.scrollLeft;
      el.setPointerCapture(e.pointerId); el.style.cursor = 'grabbing';
    };
    const move = (e: PointerEvent) => {
      if (!baixo) return;
      el.scrollLeft = inicioScroll - (e.clientX - inicioX);
    };
    const up = (e: PointerEvent) => {
      baixo = false; el.releasePointerCapture?.(e.pointerId); el.style.cursor = '';
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, []);

  const ficha: [string, string | null][] = [
    ['Local', p.local],
    ['Área', p.area],
    ['Ano', p.ano ? String(p.ano) : null],
    ['Escopo', p.escopo.join(', ')],
  ];

  return (
    <div ref={raiz}>
      {/* hero em tela cheia */}
      <section data-tema="escuro" className="grao relative isolate flex min-h-[92svh] flex-col justify-end overflow-hidden bg-[var(--color-mata-950)] px-6 pt-32 pb-12 md:px-10">
        <div className="absolute inset-0 -z-10" data-proj-hero>
          {p.capa ? (
            <Foto foto={p.capa} prioridade sizes="100vw" />
          ) : (
            <SemFoto />
          )}
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{ background: 'linear-gradient(to top, rgba(13,26,20,.92) 0%, rgba(13,26,20,.25) 48%, rgba(13,26,20,.6) 100%)' }}
          />
        </div>

        <p className="eyebrow text-[var(--color-madeira-300)]">{p.escopo.join(' · ')}</p>
        <h1 className="linha-mascara mt-4 text-[var(--color-osso)]" style={{ fontSize: 'var(--text-t1)' }}>
          <span data-proj-titulo className="block">{p.nome}</span>
        </h1>
        <p className="mt-4 max-w-[40ch] text-corpo-lg font-light text-[var(--color-travertino-200)]">
          {p.resumo}
        </p>
      </section>

      {/* ficha + texto */}
      <section data-tema="claro" className="secao-clara px-6 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1500px] gap-14 md:grid-cols-[minmax(0,30%)_1fr] md:gap-20">
          <dl data-proj-ficha className="flex flex-col gap-6">
            {ficha.map(([k, v]) => (
              <div key={k} className="border-t border-[color-mix(in_srgb,var(--color-tinta)_14%,transparent)] pt-3">
                <dt className="eyebrow text-[color-mix(in_srgb,var(--color-tinta)_52%,transparent)]">{k}</dt>
                <dd className="mt-1 text-[var(--color-tinta)]">
                  {/* campo vazio = TODO da cliente, nunca inventado */}
                  {v ?? <span className="opacity-40">a confirmar</span>}
                </dd>
              </div>
            ))}
          </dl>

          <div>
            {p.paragrafos.map((t, i) => (
              <p
                key={i}
                className="mb-6 max-w-[58ch] text-corpo-lg font-light text-[color-mix(in_srgb,var(--color-tinta)_82%,transparent)]"
              >
                {t}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* galeria em scroll horizontal arrastável */}
      {p.fotos.length > 0 && (
        <section data-tema="escuro" className="grao relative bg-[var(--color-mata-950)] py-20 md:py-28">
          <p className="eyebrow mb-8 px-6 text-[var(--color-pedra-400)] md:px-10">
            Arraste para ver mais
          </p>
          <div
            ref={galeria}
            data-cursor="Arraste"
            className="flex gap-5 overflow-x-auto px-6 pb-4 md:px-10"
            style={{ scrollSnapType: 'x proximity', cursor: 'grab', scrollbarWidth: 'thin' }}
          >
            {p.fotos.map((f) => (
              <figure
                key={f.base}
                className="h-[62vh] shrink-0 overflow-hidden"
                style={{ aspectRatio: `${f.largura}/${f.altura}`, scrollSnapAlign: 'start', borderRadius: 'var(--radius-lg)' }}
              >
                <Foto foto={f} sizes="62vh" />
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* detalhe construtivo em destaque */}
      {p.detalhe && (
        <section data-tema="escuro" className="grao relative overflow-hidden bg-[var(--color-mata-900)] px-6 py-24 md:px-10 md:py-32">
          <LuzDaAgua forca={0.07} />
          <div className="relative mx-auto max-w-[1500px]">
            
            <h2 className="mt-5 max-w-[18ch] text-[var(--color-osso)]" style={{ fontSize: 'var(--text-t2)' }}>
              {p.detalhe.titulo}
            </h2>
            <p className="mt-6 max-w-[52ch] text-corpo-lg font-light text-[var(--color-travertino-200)]">
              {p.detalhe.texto}
            </p>
          </div>
        </section>
      )}

      {/* próximo projeto + CTA */}
      <section data-tema="escuro" className="grao relative bg-[var(--color-mata-950)] px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col gap-10 border-t border-[color-mix(in_srgb,var(--color-travertino-200)_16%,transparent)] pt-10 md:flex-row md:items-end md:justify-between">
            <Link prefetch={false} href={`/projetos/${proximo.slug}/`} data-cursor="Ver" className="group block">
              <span className="eyebrow text-[var(--color-pedra-400)]">Próximo projeto</span>
              <span
                className="mt-3 block text-[var(--color-osso)] transition-colors group-hover:text-[var(--color-madeira-300)]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-t2)' }}
              >
                {proximo.nome}
              </span>
            </Link>
            <Botao onClick={() => abrir(`projeto:${p.slug}`)}>Começar meu projeto</Botao>
          </div>
        </div>
      </section>
    </div>
  );
}
