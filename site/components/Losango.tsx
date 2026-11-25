/**
 * Losango — o marcador gráfico do site.
 *
 * Substituiu os filetes de 1 px que marcavam o projeto ativo e o link
 * "Ver projeto". Um traço fino some sobre foto e não tem peso suficiente
 * para marcar estado; o losango cheio marca. Já era a linguagem do site
 * (é o separador do marquee), então não entrou nada novo no vocabulário.
 *
 * Fica centrado na altura da palavra ao lado — alinhamento por `items-center`
 * no contêiner, nunca por baseline, que deixaria o losango caído.
 */
export function Losango({
  tamanho = 10,
  className = '',
  cor = 'var(--color-madeira-300)',
}: {
  tamanho?: number;
  className?: string;
  cor?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rotate-45 ${className}`}
      style={{ width: tamanho, height: tamanho, background: cor, borderRadius: 1.5 }}
    />
  );
}

/** Dois losangos encostados — para o item ativo, que precisa de mais peso. */
export function LosangoDuplo({ className = '', cor = 'var(--color-madeira-300)' }) {
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 items-center gap-[3px] ${className}`}>
      <Losango tamanho={11} cor={cor} />
      <Losango tamanho={6} cor={cor} />
    </span>
  );
}
