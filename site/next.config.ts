import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Export estático para Netlify. O briefing roda 100% no cliente,
  // então não há nada de servidor para hospedar.
  output: 'export',
  trailingSlash: true,
  images: {
    // o export estático não tem otimizador em runtime; as imagens já saem
    // em AVIF+WebP com srcset pelo ferramentas/processar.mjs
    unoptimized: true,
  },
  turbopack: {
    rules: {
      '*.css': { loaders: ['@tailwindcss/turbopack'], as: '*.css' },
    },
  },
};

export default nextConfig;
