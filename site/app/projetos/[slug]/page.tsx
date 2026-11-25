import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { projetos, porSlug, src } from '@/data/projetos';
import { PaginaProjeto } from '@/components/PaginaProjeto';

export function generateStaticParams() {
  return projetos.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = porSlug(slug);
  if (!p) return {};
  const titulo = `${p.nome} — ${p.local ?? 'Maringá, PR'}`;
  const desc = `${p.resumo} ${p.escopo.join(', ')} por Isabela Junqueira.`;
  return {
    title: titulo,
    description: desc,
    openGraph: {
      title: titulo,
      description: desc,
      images: p.capa ? [{ url: src(p.capa, 'webp') }] : undefined,
    },
  };
}

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projeto = porSlug(slug);
  if (!projeto) notFound();

  const i = projetos.findIndex((p) => p.slug === slug);
  const proximo = projetos[(i + 1) % projetos.length];

  return <PaginaProjeto projeto={projeto} proximo={proximo} />;
}
