'use client';

import { useState } from 'react';
import Link from 'next/link';
import { projetos, tipos } from '@/data/projetos';
import { Foto } from './Foto';
import { SemFoto } from './SemFoto';

export function IndiceProjetos() {
  const [filtro, setFiltro] = useState<string>('todos');
  const lista = filtro === 'todos' ? projetos : projetos.filter((p) => p.tipo === filtro);

  return (
    <section data-tema="escuro" className="grao relative min-h-screen bg-[var(--color-mata-950)] px-6 pt-32 pb-28 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1500px]">
        
        <h1 className="mt-5 max-w-[16ch] text-[var(--color-osso)]" style={{ fontSize: 'var(--text-t1)' }}>
          Casas com <em className="text-[var(--color-madeira-300)]">nome próprio</em>
        </h1>

        {/* filtro por tipo */}
        <div role="group" aria-label="Filtrar por tipo" className="mt-12 flex flex-wrap gap-2">
          {tipos.map((t) => {
            const ativo = filtro === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setFiltro(t.id)}
                aria-pressed={ativo}
                className={`eyebrow min-h-12 border px-5 transition-colors ${
                  ativo
                    ? 'border-[var(--color-madeira-300)] bg-[color-mix(in_srgb,var(--color-madeira-500)_18%,transparent)] text-[var(--color-osso)]'
                    : 'border-[color-mix(in_srgb,var(--color-travertino-200)_18%,transparent)] text-[var(--color-travertino-200)] hover:border-[color-mix(in_srgb,var(--color-travertino-200)_42%,transparent)]'
                }`}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                {t.rotulo}
              </button>
            );
          })}
        </div>

        <ul className="mt-14 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((p) => (
            <li key={p.slug}>
              <Link prefetch={false} href={`/projetos/${p.slug}/`} data-cursor="Ver" className="group block">
                <div className="relative aspect-4/5 overflow-hidden" style={{ borderRadius: 'var(--radius-lg)' }}>
                  {p.capa ? (
                    <div className="h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]">
                      <Foto foto={p.capa} sizes="(min-width:1024px) 32vw, (min-width:768px) 48vw, 100vw" />
                    </div>
                  ) : (
                    <SemFoto nome={p.nome} />
                  )}
                </div>
                <h2 className="mt-5 text-t3 text-[var(--color-osso)] transition-colors group-hover:text-[var(--color-madeira-300)]">
                  {p.nome}
                </h2>
                <p className="eyebrow mt-2 text-[var(--color-pedra-400)]">
                  {[p.local, p.escopo.join(' · ')].filter(Boolean).join(' — ')}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {lista.length === 0 && (
          <p className="mt-16 text-[var(--color-pedra-400)]">Nenhum projeto nesta categoria ainda.</p>
        )}
      </div>
    </section>
  );
}
