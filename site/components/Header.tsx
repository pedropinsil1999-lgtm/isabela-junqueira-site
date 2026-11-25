'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { projetos } from '@/data/projetos';
import { useBriefing } from './BriefingContexto';
import { Botao } from './Botao';
import { Monograma } from './Monograma';

const links = [
  { href: '/projetos/', rotulo: 'Projetos' },
  { href: '/#processo', rotulo: 'Processo' },
  { href: '/sobre/', rotulo: 'Sobre' },
  { href: '/#contato', rotulo: 'Contato' },
];

export function Header() {
  const { abrir } = useBriefing();
  const [menu, setMenu] = useState(false);
  const [claro, setClaro] = useState(false);
  const barra = useRef<HTMLElement>(null);

  // some ao descer, volta ao subir
  useEffect(() => {
    let ultimo = window.scrollY;
    const el = barra.current;
    if (!el) return;
    const aoRolar = () => {
      const y = window.scrollY;
      const descendo = y > ultimo && y > 160;
      // transform puro: uma linha de CSS faz o mesmo que uma tween aqui
      el.style.transform = descendo && !menu ? `translateY(-110%)` : `translateY(0)`;
      ultimo = y;
    };
    window.addEventListener('scroll', aoRolar, { passive: true });
    return () => window.removeEventListener('scroll', aoRolar);
  }, [menu]);

  // troca de tema conforme a seção atrás: toda seção clara tem data-tema="claro"
  useEffect(() => {
    const secoes = document.querySelectorAll<HTMLElement>('[data-tema]');
    if (!secoes.length) return;
    const io = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) setClaro((e.target as HTMLElement).dataset.tema === 'claro');
        }
      },
      { rootMargin: '-8% 0px -92% 0px', threshold: 0 }
    );
    secoes.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const cor = claro ? 'var(--color-tinta)' : 'var(--color-travertino-200)';

  return (
    <>
      <header
        ref={barra}
        className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 md:py-5"
        style={{ color: cor, transition: 'color .45s ease, transform .5s cubic-bezier(.16,1,.3,1)' }}
      >
        <Link prefetch={false} href="/" aria-label="Isabela Junqueira Arquitetura — início" className="flex items-center">
          <Monograma className="h-8 w-auto md:h-9" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} prefetch={false} href={l.href} className="eyebrow group relative py-2">
              {l.rotulo}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-current transition-[width] duration-400 ease-out group-hover:w-full" />
            </Link>
          ))}
          <Botao variante="contorno" onClick={() => abrir('header')}>Começar meu projeto</Botao>
        </nav>

        <button
          onClick={() => setMenu(true)}
          className="eyebrow min-h-12 px-1 md:hidden"
          aria-label="Abrir menu"
          aria-expanded={menu}
        >
          Menu
        </button>
      </header>

      {menu && <MenuCheio aoFechar={() => setMenu(false)} aoAbrirBriefing={() => { setMenu(false); abrir('menu'); }} />}
    </>
  );
}

function MenuCheio({ aoFechar, aoAbrirBriefing }: { aoFechar: () => void; aoAbrirBriefing: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduzido) el.dataset.abrindo = 'sim';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [aoFechar]);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[var(--color-mata-950)] px-6 py-5 md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="flex items-center justify-between">
        <Monograma className="h-8 w-auto text-[var(--color-travertino-200)]" />
        <button onClick={aoFechar} className="eyebrow min-h-12 px-1 text-[var(--color-travertino-200)]" aria-label="Fechar menu">
          Fechar
        </button>
      </div>

      <nav aria-label="Projetos" className="mt-10 flex-1">
        <p className="eyebrow text-[var(--color-pedra-400)]">Projetos</p>
        <ul className="mt-3">
          {projetos.map((p) => (
            <li key={p.slug} className="linha-mascara">
              <Link
                prefetch={false}
                href={`/projetos/${p.slug}/`}
                onClick={aoFechar}
                data-menu-item
                className="block py-1 text-[var(--color-osso)]"
                style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem,8vw,2.4rem)', lineHeight: 1.16 }}
              >
                {p.nome}
              </Link>
            </li>
          ))}
        </ul>

        <ul className="mt-9 flex flex-col gap-1">
          {links.map((l) => (
            <li key={l.href} className="linha-mascara">
              <Link prefetch={false} href={l.href} onClick={aoFechar} data-menu-item className="eyebrow block py-3 text-[var(--color-travertino-200)]">
                {l.rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="py-6">
        <Botao onClick={aoAbrirBriefing} className="w-full">Começar meu projeto</Botao>
      </div>
    </div>
  );
}
