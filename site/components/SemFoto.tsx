/**
 * Placa para projeto que ainda não tem foto no acervo.
 *
 * Usa a textura ESTÁTICA de cáusticas, gerada a partir do próprio shader
 * (ferramentas/textura.mjs), em vez de uma instância WebGL. Motivo: o navegador
 * corta acima de ~16 contextos WebGL por aba, e o shader ao vivo fica reservado
 * para hero, processo e CTA final. Ver DECISOES.md.
 *
 * É um estado assumido e desenhado, não um buraco: mantém a linguagem visual
 * e deixa claro que o projeto existe, só não tem foto publicada ainda.
 */
export function SemFoto({ nome }: { nome?: string }) {
  return (
    <div className="grao relative h-full w-full overflow-hidden bg-[var(--color-mata-900)]">
      <picture>
        <source type="image/avif" srcSet="/textura/luz-da-agua.avif" />
        <img
          src="/textura/luz-da-agua.webp"
          alt=""
          aria-hidden="true"
          width={1100}
          height={1375}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(13,26,20,.78) 0%, rgba(13,26,20,0) 62%)' }}
      />
      {nome && (
        <span
          className="absolute bottom-6 left-6 text-[var(--color-travertino-200)] opacity-70"
          style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.2rem,2vw,1.8rem)', fontStyle: 'italic' }}
        >
          {nome}
        </span>
      )}
    </div>
  );
}
