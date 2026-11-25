import type { MetadataRoute } from 'next';
import { PRESITE, SITE_URL } from '@/lib/presite';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  // No modo pré-site o site inteiro fica fora dos buscadores.
  if (PRESITE) {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
