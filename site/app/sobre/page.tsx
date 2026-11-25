import type { Metadata } from 'next';
import { Arquiteta } from '@/components/Arquiteta';
import { Processo, CtaFinal } from '@/components/Secoes';
import { Atendimento } from '@/components/SecoesEstaticas';

export const metadata: Metadata = {
  title: 'Sobre',
  description:
    'Isabela Junqueira é arquiteta em Maringá. Faz arquitetura, interiores e paisagismo no mesmo contrato, para famílias no Brasil e no exterior.',
};

export default function Pagina() {
  return (
    <>
      <div className="h-24 bg-[var(--color-mata-950)] md:h-32" />
      <Arquiteta />
      <Processo />
      <Atendimento />
      <CtaFinal />
    </>
  );
}
