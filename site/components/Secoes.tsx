'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { efeitoGsap, semMovimento } from '@/lib/movimento';
import { estudio } from '@/data/estudio';
import { projetos, destaques, porSlug } from '@/data/projetos';
import { Foto } from './Foto';
import { LuzDaAgua } from './LuzDaAgua';
import { SemFoto } from './SemFoto';
import { Botao } from './Botao';
import { Losango } from './Losango';
import { useBriefing } from './BriefingContexto';


const reduzido = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================================================================
   4. MANIFESTO — frase que acende palavra por palavra + números
   ================================================================ */
export function Manifesto() {
  const raiz = useRef<HTMLElement>(null);

  useEffect(() => efeitoGsap(raiz, ({ gsap, ScrollTrigger, SplitText }) => {
    const frase = raiz.current?.querySelector('[data-manifesto]');
    if (!frase) return;

    if (reduzido()) {
      gsap.fromTo(frase, { opacity: 0 }, {
        opacity: 1, duration: 0.3,
        scrollTrigger: { trigger: frase, start: 'top 82%' },
      });
    } else {
      const split = new SplitText(frase as HTMLElement, { type: 'words' });
      gsap.fromTo(split.words,
        { opacity: 0.16 },
        {
          opacity: 1, duration: 0.5, stagger: 0.055, ease: 'power2.out',
          scrollTrigger: { trigger: frase, start: 'top 78%', end: 'bottom 58%', scrub: 0.6 },
        });
    }

    // count-up dos números
    raiz.current?.querySelectorAll<HTMLElement>('[data-conta]').forEach((el) => {
      const alvo = Number(el.dataset.conta);
      const dec = Number(el.dataset.dec || 0);
      if (reduzido()) { el.textContent = alvo.toFixed(dec); return; }
      gsap.fromTo({ v: 0 }, { v: 0 }, {
        v: alvo, duration: 1.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        onUpdate() { el.textContent = (this.targets()[0] as { v: number }).v.toFixed(dec); },
      });
    });
  }), []);

  const nums = estudio.numeros.filter((n) => n.valor !== null);
  const damha = porSlug('damha-iv');
  const detalhe = damha?.fotos?.[2] ?? damha?.capa ?? null;

  return (
    /* A borda superior arredondada e a margem negativa fazem esta seção SUBIR
       por cima da hero enquanto a pessoa rola — é o que tira a emenda seca
       entre a foto em tela cheia e o fundo claro. */
    <section
      ref={raiz}
      data-tema="claro"
      className="secao-clara relative z-10 -mt-[clamp(28px,5vw,80px)] px-6 pt-24 pb-24 md:px-10 md:pt-32 md:pb-32"
      style={{ borderTopLeftRadius: 'clamp(28px,5vw,80px)', borderTopRightRadius: 'clamp(28px,5vw,80px)' }}
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
          <h2 data-manifesto className="max-w-[17ch] flex-1" style={{ fontSize: 'var(--text-t1)' }}>
            Sua casa não precisa impressionar ninguém. Precisa{' '}
            <em className="text-[var(--color-madeira-500)]">fazer sentido pra quem mora nela</em>
          </h2>

          <dl className="flex shrink-0 flex-row gap-10 lg:flex-col lg:gap-9">
            {nums.map((n) => (
              <div key={n.rotulo} className="flex items-start gap-4">
                <Losango className="mt-[0.9em]" tamanho={9} cor="var(--color-madeira-500)" />
                <div>
                  <dd
                    className="leading-none text-[var(--color-tinta)]"
                    style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.6rem,5.4vw,4.4rem)' }}
                  >
                    {'prefixo' in n && n.prefixo}
                    <span data-conta={n.valor} data-dec={'decimais' in n ? n.decimais : 0}>0</span>
                  </dd>
                  <dt className="eyebrow mt-2 text-[color-mix(in_srgb,var(--color-tinta)_62%,transparent)]">
                    {n.rotulo}
                  </dt>
                </div>
              </div>
            ))}
          </dl>
        </div>

        {/* uma faixa de obra fecha a seção: o texto sozinho ficava seco demais */}
        {detalhe && (
          <div
            data-manifesto-faixa
            className="relative mt-16 overflow-hidden md:mt-20"
            style={{ borderRadius: 'var(--radius-lg)', aspectRatio: '21 / 8' }}
          >
            <Foto foto={detalhe} sizes="(min-width: 768px) 92vw, 100vw" />
          </div>
        )}
      </div>
    </section>
  );
}

/* ================================================================
   5. PROJETOS EM DESTAQUE
   ================================================================ */
export function Destaques() {
  const raiz = useRef<HTMLElement>(null);

  useEffect(() => efeitoGsap(raiz, ({ gsap, ScrollTrigger, SplitText }) => {
    if (reduzido()) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      raiz.current?.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        gsap.fromTo(el, { yPercent: -5 }, {
          yPercent: 5, ease: 'none',
          scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    });
    /* Reveal por máscara, no padrão seguro: o elemento NASCE visível e só é
       escondido no instante em que o gatilho entra. Com `gsap.from` o estado
       inicial é aplicado na criação; se o gatilho não disparar — porque a
       posição foi calculada antes de a imagem carregar, ou porque o layout
       mudou depois — o conteúdo fica invisível para sempre. Ver DECISOES.md. */
    raiz.current?.querySelectorAll<HTMLElement>('[data-revela]').forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () =>
          gsap.fromTo(el,
            { clipPath: 'inset(0 0 100% 0)' },
            { clipPath: 'inset(0 0 0% 0)', duration: 1.2, ease: 'expo.out' }),
      });
    });
    return () => mm.revert();
  }), []);

  return (
    <section ref={raiz} data-tema="escuro" className="grao relative bg-[var(--color-mata-950)] px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-24 md:gap-36">
        {destaques.map((p, i) => (
          <article
            key={p.slug}
            className={`flex flex-col gap-8 md:items-center md:gap-14 ${i % 2 ? 'md:flex-row-reverse' : 'md:flex-row'}`}
          >
            <Link
              prefetch={false}
              href={`/projetos/${p.slug}/`}
              data-cursor="Ver projeto"
              data-revela
              /* sem foto, o card é mais baixo: 4/5 de textura é espaço morto */
              className={`group relative block w-full overflow-hidden md:w-[58%] ${p.capa ? 'aspect-4/5' : 'aspect-16/10'}`}
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              {p.capa ? (
                <div data-parallax className="h-[112%] w-full -translate-y-[5%] will-change-transform">
                  <Foto foto={p.capa} sizes="(min-width: 768px) 58vw, 100vw" />
                </div>
              ) : (
                // sem foto ainda: o efeito de assinatura assume o lugar, de propósito
                <SemFoto nome={p.nome} />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-[rgba(13,26,20,.55)] to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="eyebrow absolute bottom-6 left-6 translate-y-2 text-[var(--color-osso)] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                Ver projeto
              </span>
            </Link>

            <div className="md:w-[42%]">
              <h3 style={{ fontSize: 'var(--text-t2)' }} className="text-[var(--color-osso)]">
                {p.nome}
              </h3>
              <p className="eyebrow mt-3 text-[var(--color-madeira-300)]">
                {[p.local, p.ano].filter(Boolean).join(' · ') || 'Maringá, PR'}
              </p>
              <p className="mt-5 max-w-[38ch] text-corpo-lg font-light text-[var(--color-travertino-200)]">
                {p.resumo}
              </p>
              <p className="eyebrow mt-6 text-[var(--color-pedra-400)]">{p.escopo.join(' · ')}</p>
              <Link
                prefetch={false}
                href={`/projetos/${p.slug}/`}
                className="eyebrow group mt-7 inline-flex items-center gap-3 text-[var(--color-travertino-200)] transition-colors duration-300 hover:text-[var(--color-madeira-300)]"
              >
                Ver projeto
                <span className="inline-flex transition-transform duration-400 ease-out group-hover:translate-x-1.5">
                  <Losango tamanho={9} />
                </span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ================================================================
   6. FAIXA MARQUEE com os nomes dos projetos
   ================================================================ */
export function Marquee() {
  const faixa = useRef<HTMLDivElement>(null);

  useEffect(() => efeitoGsap(faixa, ({ gsap, ScrollTrigger, SplitText }) => {
    if (reduzido()) return;
    const el = faixa.current?.firstElementChild as HTMLElement | null;
    if (!el) return;
    const t = gsap.to(faixa.current!.children, {
      xPercent: -100, duration: 44, ease: 'none', repeat: -1,
    });
    const dentro = () => gsap.to(t, { timeScale: 0.25, duration: 0.6 });
    const fora = () => gsap.to(t, { timeScale: 1, duration: 0.6 });
    faixa.current?.parentElement?.addEventListener('pointerenter', dentro);
    faixa.current?.parentElement?.addEventListener('pointerleave', fora);
    return () => { t.kill(); };
  }), []);

  const nomes = projetos.map((p) => p.nome);
  const bloco = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {nomes.map((n) => (
        <span key={n} className="flex items-center gap-10">
          <span
            className="whitespace-nowrap italic text-[var(--color-travertino-200)]"
            style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2rem,4.4vw,3.6rem)' }}
          >
            {n}
          </span>
          <span aria-hidden="true" className="inline-block h-[7px] w-[7px] rotate-45 bg-[var(--color-madeira-500)]" />
        </span>
      ))}
    </div>
  );

  return (
    <section
      data-tema="escuro"
      aria-hidden="true"
      className="overflow-hidden border-y border-[color-mix(in_srgb,var(--color-travertino-200)_14%,transparent)] bg-[var(--color-mata-950)] py-7"
    >
      <div ref={faixa} className="flex w-max">
        {bloco}
        {bloco}
      </div>
    </section>
  );
}

/* ================================================================
   7. O PROCESSO — linha SVG que se desenha no scroll
   ================================================================ */
export function Processo() {
  const raiz = useRef<HTMLElement>(null);

  useEffect(() => efeitoGsap(raiz, ({ gsap, ScrollTrigger }) => {
    if (reduzido()) return;
    const etapas = raiz.current!.querySelectorAll('[data-etapa]');
    ScrollTrigger.create({
      trigger: raiz.current,
      start: 'top 80%',
      once: true,
      onEnter: () =>
        gsap.fromTo(etapas,
          { y: 34, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0, stagger: 0.1, ease: 'expo.out' }),
    });
  }), []);

  return (
    <section
      id="processo"
      ref={raiz}
      data-tema="escuro"
      className="grao relative overflow-hidden bg-[var(--color-mata-900)] px-6 py-28 md:px-10 md:py-40"
    >
      <LuzDaAgua forca={0.09} />
      <div className="relative mx-auto max-w-[1500px]">
        <h2
          className="max-w-[16ch] text-[var(--color-osso)]"
          style={{ fontSize: 'var(--text-t1)', lineHeight: 0.98 }}
        >
          O que exatamente <em className="text-[var(--color-madeira-300)]">você recebe</em>
        </h2>

        {/* Cada etapa é um bloco com fundo próprio. O filete de 1 px que ligava as
            quatro sumia sobre o shader e não dava estrutura nenhuma; o bloco dá. */}
        <ol className="mt-16 grid gap-4 md:mt-20 md:grid-cols-2 lg:grid-cols-4">
          {estudio.processo.map((e) => (
            <li
              key={e.n}
              data-etapa
              className="flex flex-col border border-[color-mix(in_srgb,var(--color-travertino-200)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-mata-950)_68%,transparent)] p-7 backdrop-blur-[2px] md:p-8"
              style={{ borderRadius: 'var(--radius-lg)' }}
            >
              <span
                className="block leading-[0.8] text-[var(--color-madeira-500)]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(4rem,7vw,6rem)' }}
              >
                {String(e.n).padStart(2, '0')}
              </span>
              {/* menor que --text-t3: num card de 4 colunas o t3 estoura a caixa
                  em "Acompanhamento de obra" */}
              <h3
                className="mt-7 leading-tight text-balance text-[var(--color-osso)]"
                style={{ fontSize: 'clamp(1.25rem, 1.55vw, 1.7rem)' }}
              >
                {e.titulo}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--color-travertino-200)]">
                {e.texto}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ================================================================
   13. CTA FINAL + CONTATO
   ================================================================ */
export function CtaFinal() {
  const { abrir } = useBriefing();
  return (
    <section
      id="contato"
      data-tema="escuro"
      className="grao relative overflow-hidden bg-[var(--color-mata-950)] px-6 py-28 md:px-10 md:py-40"
    >
      <LuzDaAgua forca={0.12} />
      <div className="relative mx-auto max-w-[1500px]">
        <h2 className="max-w-[14ch] text-[var(--color-osso)]" style={{ fontSize: 'var(--text-t1)' }}>
          Vamos desenhar <em className="text-[var(--color-madeira-300)]">a sua?</em>
        </h2>
        <p className="mt-6 max-w-[46ch] text-corpo-lg font-light text-[var(--color-travertino-200)]">
          Um minuto de perguntas e eu já chego na conversa sabendo do que se trata.
        </p>

        <div className="mt-10">
          <Botao variante="grande" onClick={() => abrir('cta-final')}>
            Começar meu projeto
          </Botao>
        </div>

        <div className="mt-16 flex flex-wrap gap-x-14 gap-y-6 border-t border-[color-mix(in_srgb,var(--color-travertino-200)_14%,transparent)] pt-10">
          <Contato rotulo="WhatsApp" valor={estudio.whatsapp.exibicao} href={`https://wa.me/${estudio.whatsapp.numero}`} />
          <Contato rotulo="Instagram" valor={`@${estudio.instagram.usuario}`} href={estudio.instagram.url} />
          <Contato rotulo="Cidade" valor={`${estudio.cidade} · ${estudio.estado}`} />
        </div>
      </div>
    </section>
  );
}

function Contato({ rotulo, valor, href }: { rotulo: string; valor: string; href?: string }) {
  const conteudo = (
    <>
      <span className="eyebrow block text-[var(--color-pedra-400)]">{rotulo}</span>
      <span className="mt-2 block text-t3 text-[var(--color-osso)]" style={{ fontFamily: 'var(--font-serif)' }}>
        {valor}
      </span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="group transition-opacity hover:opacity-75">
      {conteudo}
    </a>
  ) : (
    <div>{conteudo}</div>
  );
}
