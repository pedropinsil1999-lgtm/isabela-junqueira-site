import type { Foto as TFoto } from '@/data/projetos';
import { src, srcset } from '@/data/projetos';

/**
 * <picture> com AVIF + WebP e srcset, dimensões explícitas (sem CLS).
 * `prioridade` marca o LCP da hero: fetchpriority alto e sem lazy.
 */
export function Foto({
  foto, sizes = '100vw', className = '', prioridade = false, cobrir = true,
}: {
  foto: TFoto;
  sizes?: string;
  className?: string;
  prioridade?: boolean;
  cobrir?: boolean;
}) {
  return (
    <picture>
      <source type="image/avif" srcSet={srcset(foto, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(foto, 'webp')} sizes={sizes} />
      <img
        src={src(foto, 'webp')}
        alt={foto.alt}
        width={foto.largura}
        height={foto.altura}
        decoding={prioridade ? 'sync' : 'async'}
        loading={prioridade ? 'eager' : 'lazy'}
        {...(prioridade ? { fetchPriority: 'high' as const } : {})}
        // herda o raio do contêiner: sem isto o <picture> deixa um canto vivo
        className={`rounded-[inherit] ${cobrir ? 'h-full w-full object-cover' : ''} ${className}`}
      />
    </picture>
  );
}
