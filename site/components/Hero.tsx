'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { carregarGsap, semMovimento } from '@/lib/movimento';
import { projetos } from '@/data/projetos';
import { retratoHero } from '@/data/retratos';
import { Foto } from './Foto';
import { LuzDaAgua } from './LuzDaAgua';
import { Botao } from './Botao';
import { LosangoDuplo } from './Losango';
import { useBriefing } from './BriefingContexto';

/**
 * A hero é o portfólio inteiro na primeira tela: a lista dos projetos nomeados
 * à esquerda, trocando a foto de fundo, e a Isabela à direita — ela é marca
 * pessoal, e quem chega pelo Instagram chega atrás dela.
 *
 * O que NÃO se mexe aqui, de propósito:
 *  - a tipografia. Nada de reveal por máscara nem parallax no texto: num nome
 *    grande sobre foto, o movimento atrapalha a leitura em vez de impressionar.
 *    Só a foto respira, com um zoom lento.
 */
export function Hero() {
  const [ativo, setAtivo] = useState(0);
  const [extras, setExtras] = useState(false);
  const { abrir } = useBriefing();
  const raiz = useRef<HTMLElement>(null);
  const carrossel = useRef<HTMLUListElement>(null);

  /* O navegador restaura a posição de rolagem de qualquer scroller ao voltar
     para a página — inclusive deste carrossel, que então abria no meio da lista,
     escondendo os primeiros projetos. A hero tem que começar no primeiro nome. */
  useEffect(() => {
    const el = carrossel.current;
    if (!el) return;
    const aoTopo = () => { el.scrollLeft = 0; };
    aoTopo();
    const t = setTimeout(aoTopo, 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const ocioso = (cb: () => void) =>
      'requestIdleCallback' in window
        ? (window as unknown as { requestIdleCallback: (c: () => void) => void }).requestIdleCallback(cb)
        : setTimeout(cb, 900);
    ocioso(() => {
      setExtras(true);
      import('gsap/ScrollTrigger').then((m) => m.ScrollTrigger.refresh());
    });
  }, []);

  useEffect(() => {
    let vivo = true;
    let limpar: (() => void) | null = null;

    carregarGsap().then(({ gsap }) => {
      if (!vivo || !raiz.current) return;
      const reduzido = semMovimento();

      const ctx = gsap.context(() => {
        // entrada: a foto abre por máscara, o resto só aparece. Sem deslocar texto.
        const entrada = () => {
          const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
          if (reduzido) {
            tl.from('[data-hero-fade]', { opacity: 0, duration: 0.3 });
            return;
          }
          tl.from('[data-hero-foto]', { clipPath: 'inset(0 0 100% 0)', duration: 1.1 })
            .from('[data-hero-retrato]', { opacity: 0, scale: 0.98, duration: 1.0 }, 0.3)
            .from('[data-hero-fade]', { opacity: 0, duration: 0.9, stagger: 0.07 }, 0.45);
        };

        if (document.documentElement.dataset.preloader === 'pronto') entrada();
        else document.addEventListener('ij:preloader-pronto', entrada, { once: true });

        // zoom lento e contínuo só na foto de fundo
        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          const t = gsap.to('[data-hero-zoom]', {
            scale: 1.06, duration: 20, ease: 'none', repeat: -1, yoyo: true,
          });

          return () => { t.kill(); };
        });

        /* Saída da hero: a foto recua e escurece enquanto a seção seguinte sobe
           por cima. SÓ NO DESKTOP — no mobile a foto não é uma camada de fundo em
           tela cheia, é um bloco de 62svh com o conteúdo logo abaixo. Escurecê-la
           ali não cria profundidade: apaga a foto na cara de quem está rolando. */
        mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
          const saida = gsap.timeline({
            scrollTrigger: {
              trigger: raiz.current,
              start: 'bottom bottom',
              end: 'bottom 30%',
              scrub: 0.6,
            },
          });
          saida
            .to('[data-hero-camada]', { scale: 1.04, filter: 'brightness(0.72)', ease: 'none' }, 0)
            .to('[data-hero-conteudo]', { y: -40, opacity: 0.35, ease: 'none' }, 0);
          return () => { saida.kill(); };
        });
        limpar = () => mm.revert();
      }, raiz.current);

      const anterior = limpar;
      limpar = () => { anterior?.(); ctx.revert(); };
    });

    return () => { vivo = false; limpar?.(); };
  }, []);

  const comFoto = projetos.filter((p) => p.capa);

  const itens = projetos.map((p, i) => {
    const atv = ativo === i;
    return (
      <li key={p.slug} className="shrink-0 md:shrink">
        <Link
          prefetch={false}
          href={`/projetos/${p.slug}/`}
          data-cursor="Ver"
          onMouseEnter={() => setAtivo(i)}
          onFocus={() => setAtivo(i)}
          className="group flex items-center gap-3 py-[0.1em] whitespace-nowrap transition-colors duration-300 md:gap-4"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.35rem, 2.5vw, 2.3rem)',
            lineHeight: 1.18,
            fontStyle: atv ? 'italic' : 'normal',
            color: atv ? 'var(--color-osso)' : 'color-mix(in srgb, var(--color-travertino-200) 50%, transparent)',
          }}
        >
          {/* marcador do item ativo: centrado na altura do nome, não na linha de base */}
          <span
            className="hidden transition-all duration-500 ease-out md:inline-flex"
            style={{ opacity: atv ? 1 : 0, transform: `translateX(${atv ? 0 : -10}px)` }}
          >
            <LosangoDuplo />
          </span>
          <span>{p.nome}</span>
        </Link>
      </li>
    );
  });

  return (
    <section
      ref={raiz}
      className="grao relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[var(--color-mata-950)] md:block"
      aria-label="Projetos"
    >
      <LuzDaAgua forca={0.11} />

      {/* camada 0 — a foto do projeto em destaque */}
      <div data-hero-camada className="relative h-[62svh] w-full shrink-0 will-change-transform md:absolute md:inset-0 md:h-full">
        {projetos.map((p, i) => {
          if (!p.capa) return null;
          const primeira = comFoto[0]?.slug === p.slug;
          if (!primeira && !extras) return null;
          return (
            <div
              key={p.slug}
              data-hero-foto={primeira ? '' : undefined}
              className="absolute inset-0 transition-opacity duration-[600ms] ease-out"
              style={{ opacity: ativo === i ? 1 : 0 }}
              aria-hidden={ativo !== i}
            >
              <div data-hero-zoom className="h-full w-full will-change-transform">
                <Foto foto={p.capa} prioridade={primeira} sizes="100vw" className="h-full w-full object-cover" />
              </div>
            </div>
          );
        })}
        {/* Dois véus, porque os dois layouts pedem coisas diferentes.
            Desktop: a foto é o fundo de tudo e precisa recuar atrás do texto.
            Mobile: a foto é um bloco e não tem texto por cima — só precisa do
            escurecimento no topo, para a navbar. O véu do desktop aplicado ali
            apagava metade da foto. */}
        <div
          className="absolute inset-0 hidden md:block"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(to right, rgba(13,26,20,.84) 0%, rgba(13,26,20,.40) 38%, rgba(13,26,20,.10) 62%, rgba(13,26,20,.52) 100%),' +
              'linear-gradient(to top, rgba(13,26,20,.88) 0%, rgba(13,26,20,.05) 46%, rgba(13,26,20,.20) 100%)',
          }}
        />
        <div
          className="absolute inset-0 md:hidden"
          aria-hidden="true"
          style={{
            background:
              'linear-gradient(to bottom, rgba(13,26,20,.58) 0%, rgba(13,26,20,.06) 26%, rgba(13,26,20,0) 70%, rgba(13,26,20,.30) 100%)',
          }}
        />
      </div>

      {/* véu no topo: é o que deixa a navbar legível sobre qualquer foto */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-32 md:h-40"
        style={{ background: 'linear-gradient(to bottom, rgba(13,26,20,.72) 0%, rgba(13,26,20,.28) 52%, transparent 100%)' }}
      />

      {/* conteúdo */}
      {/* o padding de baixo precisa limpar a borda arredondada da seção seguinte,
          que sobe por cima da hero */}
      <div data-hero-conteudo className="relative z-10 flex flex-1 flex-col gap-10 px-6 pt-10 pb-[clamp(56px,10vw,96px)] md:absolute md:inset-0 md:flex-row md:items-end md:justify-between md:gap-14 md:px-10 md:pt-[104px] md:pb-[clamp(88px,8vw,132px)]">
        {/* índice de projetos */}
        <nav aria-label="Índice de projetos" className="order-2 md:order-1 md:max-w-[42%] md:pb-2">
          <ul
            ref={carrossel}
            className="-mx-6 flex gap-6 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-col md:gap-0 md:overflow-visible md:px-0"
            style={{ scrollSnapType: 'x proximity', scrollbarWidth: 'none' }}
          >
            {itens}
          </ul>
        </nav>

        {/* a Isabela + nome + CTA */}
        <div className="order-1 flex items-end gap-5 md:order-2 md:max-w-[46%] md:flex-col md:items-end md:gap-0">
          <div
            data-hero-retrato
            className="w-[108px] shrink-0 overflow-hidden md:w-[clamp(220px,22vw,320px)]"
            style={{ borderRadius: 'var(--radius-xl)', aspectRatio: '4 / 5' }}
          >
            <Foto foto={retratoHero} sizes="(min-width: 768px) 22vw, 108px" />
          </div>

          <div className="min-w-0 md:mt-7 md:text-right">
            <h1
              data-hero-fade
              className="text-[var(--color-osso)]"
              style={{ fontSize: 'clamp(2rem, 5.4vw, 4.6rem)', lineHeight: 1.0, letterSpacing: '-0.015em' }}
            >
              Isabela <em className="not-italic md:block">
                <span className="italic text-[var(--color-madeira-300)]">Junqueira</span>
              </em>
            </h1>
            <p data-hero-fade className="mt-3 text-[var(--color-travertino-200)]">
              Mais de mil projetos entregues
            </p>
            <div data-hero-fade className="mt-5 flex md:justify-end">
              <Botao onClick={() => abrir('hero')}>Começar meu projeto</Botao>
            </div>
          </div>
        </div>
      </div>

      {/* indicador de rolagem */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden h-10 w-px -translate-x-1/2 overflow-hidden md:block"
      >
        <span className="block h-full w-full animate-[descer_2.4s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-[var(--color-madeira-300)] to-transparent" />
      </div>
    </section>
  );
}
