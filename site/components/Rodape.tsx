import Link from 'next/link';
import { estudio } from '@/data/estudio';
import { projetos } from '@/data/projetos';
import { Monograma } from './Monograma';

export function Rodape() {
  const ano = 2026;
  return (
    <footer className="grao relative border-t border-[color-mix(in_srgb,var(--color-travertino-200)_14%,transparent)] bg-[var(--color-mata-950)] px-6 pt-14 pb-28 md:px-10 md:pb-14">
      <div className="flex flex-col gap-12 md:flex-row md:justify-between">
        <div className="max-w-[34ch]">
          <Monograma className="h-11 w-auto text-[var(--color-travertino-200)]" />
          <p className="eyebrow mt-5 text-[var(--color-travertino-200)]">Isabela Junqueira</p>
          <p className="eyebrow mt-1 text-[var(--color-pedra-400)]" style={{ fontSize: 10 }}>Arquitetura</p>
          <p className="mt-5 text-[14px] leading-relaxed text-[var(--color-pedra-400)]">
            {estudio.bio.curta}
          </p>
        </div>

        <nav aria-label="Projetos" className="min-w-[14ch]">
          <p className="eyebrow text-[var(--color-pedra-400)]">Projetos</p>
          <ul className="mt-4 flex flex-col gap-2">
            {projetos.map((p) => (
              <li key={p.slug}>
                <Link prefetch={false} href={`/projetos/${p.slug}/`} className="text-[14px] text-[var(--color-travertino-200)] transition-colors hover:text-[var(--color-madeira-300)]">
                  {p.nome}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-[20ch]">
          <p className="eyebrow text-[var(--color-pedra-400)]">Contato</p>
          <ul className="mt-4 flex flex-col gap-2 text-[14px]">
            <li>
              <a
                href={`https://wa.me/${estudio.whatsapp.numero}`}
                target="_blank" rel="noopener noreferrer"
                className="text-[var(--color-travertino-200)] transition-colors hover:text-[var(--color-madeira-300)]"
              >
                {estudio.whatsapp.exibicao}
              </a>
            </li>
            <li>
              <a
                href={estudio.instagram.url}
                target="_blank" rel="noopener noreferrer"
                className="text-[var(--color-travertino-200)] transition-colors hover:text-[var(--color-madeira-300)]"
              >
                @{estudio.instagram.usuario}
              </a>
            </li>
            <li className="text-[var(--color-pedra-400)]">{estudio.cidade} · {estudio.estado}</li>
            {/* só renderiza se a cliente preencher — ver TODO-CLIENTE.md */}
            {estudio.endereco && (
              <li className="text-[var(--color-pedra-400)]">
                {estudio.endereco.logradouro}, {estudio.endereco.bairro}
              </li>
            )}
            {estudio.horario && <li className="text-[var(--color-pedra-400)]">{estudio.horario}</li>}
          </ul>
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-3 border-t border-[color-mix(in_srgb,var(--color-travertino-200)_12%,transparent)] pt-6 text-[12px] text-[var(--color-pedra-400)] md:flex-row md:items-center md:justify-between">
        <p>© {ano} Isabela Junqueira Arquitetura</p>
        <div className="flex flex-wrap items-center gap-5">
          {/* CAU: selo de credibilidade. Só aparece preenchido — nunca inventado. */}
          {estudio.cau && <span>CAU {estudio.cau}</span>}
          {estudio.creditoFotografia && <span>Fotografia: {estudio.creditoFotografia}</span>}
          <Link prefetch={false} href="/privacidade/" className="transition-colors hover:text-[var(--color-madeira-300)]">
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
