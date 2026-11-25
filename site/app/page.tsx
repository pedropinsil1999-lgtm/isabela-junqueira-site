import { Hero } from '@/components/Hero';
import { comFoto, srcset, src } from '@/data/projetos';
import { Manifesto, Destaques, Marquee, Processo, CtaFinal } from '@/components/Secoes';
import { TresFrentes, Atendimento } from '@/components/SecoesEstaticas';
import { Arquiteta } from '@/components/Arquiteta';
import { Depoimentos } from '@/components/Depoimentos';

export default function Home() {
  // A primeira foto da hero é o elemento de LCP. Sem este preload o navegador só a
  // descobre depois de montar o React, e o LCP vai para a casa dos 7 s em 4G.
  const lcp = comFoto[0]?.capa ?? null;

  return (
    <>
      {lcp && (
        <link
          rel="preload"
          as="image"
          type="image/avif"
          href={src(lcp, 'avif')}
          imageSrcSet={srcset(lcp, 'avif')}
          imageSizes="100vw"
          fetchPriority="high"
        />
      )}
      <Hero />
      <Manifesto />
      <Destaques />
      <Marquee />
      <Processo />
      <TresFrentes />
      <Atendimento />
      <Arquiteta />
      {/*
        11. Depoimentos — renderiza só quando houver texto real do destaque "Feedbacks".
        O destaque não abriu texto legível na coleta. Ver TODO-CLIENTE.md.
        12. Na mídia — bloco apagado de propósito: não consegui confirmar as publicações.
      */}
      <Depoimentos />
      <CtaFinal />
    </>
  );
}
