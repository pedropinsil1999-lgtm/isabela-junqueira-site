import Link from 'next/link';
import { projetos } from '@/data/projetos';
import { Foto } from '@/components/Foto';
import { LuzDaAgua } from '@/components/LuzDaAgua';
import { Monograma } from '@/components/Monograma';

export default function NaoEncontrada() {
  // um projeto de fundo, escolhido pelo dia — determinístico, sem hidratação divergente
  const comFoto = projetos.filter((p) => p.capa);
  const escolhido = comFoto[new Date().getDate() % Math.max(1, comFoto.length)] ?? projetos[0];

  return (
    <section className="grao relative isolate flex min-h-screen flex-col items-start justify-end overflow-hidden bg-[var(--color-mata-950)] px-6 pt-32 pb-16 md:px-10">
      <div className="absolute inset-0 -z-10">
        {escolhido?.capa ? <Foto foto={escolhido.capa} sizes="100vw" /> : <LuzDaAgua forca={0.12} />}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: 'linear-gradient(to top, rgba(13,26,20,.95) 0%, rgba(13,26,20,.55) 55%, rgba(13,26,20,.7) 100%)' }}
        />
      </div>

      <Monograma className="h-14 w-auto text-[var(--color-madeira-300)]" />
      <h1 className="mt-8 max-w-[18ch] text-[var(--color-osso)]" style={{ fontSize: 'var(--text-t1)' }}>
        Essa página <em className="text-[var(--color-madeira-300)]">não existe</em>
      </h1>
      <p className="mt-5 max-w-[42ch] text-corpo-lg font-light text-[var(--color-travertino-200)]">
        Mas as casas existem. Comece por elas.
      </p>

      <div className="mt-9 flex flex-wrap gap-4">
        <Link
          prefetch={false}
          href="/projetos/"
          className="eyebrow inline-flex min-h-12 items-center bg-[var(--color-madeira-500)] px-7 text-[var(--color-osso)] transition-colors hover:bg-[var(--color-madeira-300)] hover:text-[var(--color-tinta)]"
          style={{ borderRadius: 999 }}
        >
          Ver os projetos
        </Link>
        <Link
          prefetch={false}
          href="/"
          className="eyebrow inline-flex min-h-12 items-center border border-[color-mix(in_srgb,var(--color-travertino-200)_30%,transparent)] px-7 text-[var(--color-travertino-200)] transition-colors hover:border-[var(--color-travertino-200)]"
          style={{ borderRadius: 999 }}
        >
          Início
        </Link>
      </div>

      {escolhido && (
        <p className="eyebrow mt-12 text-[var(--color-pedra-400)]">
          Ao fundo: {escolhido.nome}
        </p>
      )}
    </section>
  );
}
