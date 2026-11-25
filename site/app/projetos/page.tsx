import type { Metadata } from 'next';
import { IndiceProjetos } from '@/components/IndiceProjetos';

export const metadata: Metadata = {
  title: 'Projetos',
  description:
    'Casas, apartamentos e projetos internacionais de alto padrão. Arquitetura, interiores e paisagismo por Isabela Junqueira, em Maringá e no exterior.',
};

export default function Projetos() {
  return <IndiceProjetos />;
}
