import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/presite';
import { projetos } from '@/data/projetos';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  const fixas = ['', '/projetos', '/sobre', '/privacidade'].map((p) => ({
    url: `${SITE_URL}${p}/`,
    lastModified: agora,
    changeFrequency: 'monthly' as const,
    priority: p === '' ? 1 : 0.7,
  }));
  const paginas = projetos.map((p) => ({
    url: `${SITE_URL}/projetos/${p.slug}/`,
    lastModified: agora,
    changeFrequency: 'monthly' as const,
    // projeto com foto é o ativo de SEO; os demais entram com prioridade menor
    priority: p.capa ? 0.9 : 0.5,
  }));
  return [...fixas, ...paginas];
}
