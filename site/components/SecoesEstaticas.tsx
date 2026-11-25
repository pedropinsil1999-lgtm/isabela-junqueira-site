/**
 * Seções sem nenhuma interação: só markup e texto.
 *
 * Ficam FORA do `'use client'` de propósito. Como componentes de servidor elas não
 * entram na árvore de hidratação do React, o que tira trabalho do main thread no
 * carregamento — e elas não perdem nada, porque não têm estado nem evento.
 * Ver REVISOES.md.
 */
import { estudio } from '@/data/estudio';

/* ================================================================
   8. TRÊS FRENTES
   ================================================================ */
export function TresFrentes() {
  return (
    <section data-tema="claro" className="secao-clara px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-[1500px]">
        
        <h2 className="mt-5 max-w-[24ch]" style={{ fontSize: 'var(--text-t2)' }}>
          {estudio.diferencial.split('. ')[0]}.
        </h2>
        <p className="mt-5 max-w-[52ch] text-corpo-lg font-light text-[color-mix(in_srgb,var(--color-tinta)_78%,transparent)]">
          {estudio.diferencial.split('. ').slice(1).join('. ')}
        </p>

        <div className="mt-16 grid gap-px overflow-hidden border border-[color-mix(in_srgb,var(--color-tinta)_14%,transparent)] bg-[color-mix(in_srgb,var(--color-tinta)_14%,transparent)] md:grid-cols-3" style={{ borderRadius: 'var(--radius-lg)' }}>
          {estudio.frentes.map((f) => (
            <div key={f.slug} className="bg-[var(--color-osso)] p-8 md:p-10">
              <h3 className="text-t3">{f.titulo}</h3>
              <p className="mt-4 max-w-[34ch] text-[color-mix(in_srgb,var(--color-tinta)_76%,transparent)]">{f.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   9. ATENDIMENTO ONDE VOCÊ ESTIVER
   ================================================================ */
export function Atendimento() {
  return (
    <section data-tema="escuro" className="grao relative bg-[var(--color-mata-950)] px-6 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1500px] gap-14 md:grid-cols-2 md:items-center md:gap-20">
        <div>
          
          <h2 className="mt-5 max-w-[16ch] text-[var(--color-osso)]" style={{ fontSize: 'var(--text-t2)' }}>
            De Maringá <em className="text-[var(--color-madeira-300)]">até as Maldivas</em>
          </h2>
          <p className="mt-6 max-w-[44ch] text-corpo-lg font-light text-[var(--color-travertino-200)]">
            {estudio.lugares.texto}
          </p>
        </div>

        <ul className="flex flex-col">
          {[
            { lugar: 'Maringá e região', nota: 'Base do escritório' },
            { lugar: 'Outras cidades do Brasil', nota: 'Atendimento híbrido' },
            { lugar: 'Maldivas', nota: 'Projeto internacional' },
          ].map((l) => (
            <li
              key={l.lugar}
              className="flex items-baseline justify-between gap-6 border-b border-[color-mix(in_srgb,var(--color-travertino-200)_14%,transparent)] py-6"
            >
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-t3)' }} className="text-[var(--color-osso)]">
                {l.lugar}
              </span>
              <span className="eyebrow shrink-0 text-[var(--color-pedra-400)]">{l.nota}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
