import type { Metadata } from 'next';
import './globals.css';
import { PRESITE, SITE_URL } from '@/lib/presite';
import { estudio } from '@/data/estudio';
import { BriefingProvider } from '@/components/BriefingContexto';
import { Briefing } from '@/components/Briefing';
import { Header } from '@/components/Header';
import { Cursor } from '@/components/Cursor';
import { Movimento } from '@/components/Movimento';
import { Preloader } from '@/components/Preloader';
import { Rodape } from '@/components/Rodape';
import { CtaFlutuante } from '@/components/CtaFlutuante';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Arquiteta em Maringá | Isabela Junqueira',
    template: '%s | Isabela Junqueira Arquitetura',
  },
  description:
    'Arquitetura, interiores e paisagismo de alto padrão em Maringá, no Brasil e no exterior. ' +
    'Mais de mil projetos entregues.',
  // Modo pré-site: fora do índice dos buscadores. Nada na interface menciona isso.
  robots: PRESITE
    ? { index: false, follow: false, nocache: true }
    : { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Isabela Junqueira Arquitetura',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preload" href="/fontes/GambettaVar.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fontes/GeneralSansVar.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0D1A14" />
      </head>
      <body>
        <a
          href="#conteudo"
          className="eyebrow sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:bg-[var(--color-madeira-500)] focus:px-5 focus:py-3 focus:text-[var(--color-osso)]"
        >
          Pular para o conteúdo
        </a>

        <BriefingProvider>
          <Movimento />
          <Preloader />
          <Cursor />
          <Header />
          <main id="conteudo">{children}</main>
          <Rodape />
          <CtaFlutuante />
          <Briefing />
        </BriefingProvider>

        {/* schema.org — só fora do modo pré-site, para não indexar dado de teste */}
        {!PRESITE && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'LocalBusiness',
                name: estudio.marca,
                description: estudio.bio.curta,
                url: SITE_URL,
                telephone: `+${estudio.whatsapp.numero}`,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: estudio.cidade,
                  addressRegion: estudio.estado,
                  addressCountry: 'BR',
                },
                sameAs: [estudio.instagram.url],
                founder: {
                  '@type': 'Person',
                  name: estudio.nome,
                  jobTitle: estudio.profissao,
                },
              }),
            }}
          />
        )}
      </body>
    </html>
  );
}
