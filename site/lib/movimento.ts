/**
 * Carregador do GSAP — fora do caminho crítico.
 *
 * Antes, onze componentes importavam `gsap` no topo do módulo, então a biblioteca
 * inteira (mais ScrollTrigger e SplitText) entrava no bundle inicial de toda página
 * e era avaliada antes da primeira pintura. Movimento é conforto, não conteúdo.
 *
 * Agora o GSAP vira um chunk assíncrono, carregado uma única vez e compartilhado.
 * Até ele chegar, o HTML já está na tela, legível e navegável.
 */

type ModuloGsap = {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
  SplitText: typeof import('gsap/SplitText').SplitText;
};

let promessa: Promise<ModuloGsap> | null = null;

export function carregarGsap(): Promise<ModuloGsap> {
  if (!promessa) {
    promessa = Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('gsap/SplitText'),
    ]).then(([g, st, sp]) => {
      const gsap = g.gsap ?? g.default;
      gsap.registerPlugin(st.ScrollTrigger, sp.SplitText);
      return { gsap, ScrollTrigger: st.ScrollTrigger, SplitText: sp.SplitText };
    });
  }
  return promessa;
}

/** `prefers-reduced-motion: reduce` */
export const semMovimento = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Executa quando o main thread estiver ocioso, com teto de espera. */
export function aoOcioso(cb: () => void, teto = 2000) {
  if (typeof window === 'undefined') return;
  const ric = (window as unknown as {
    requestIdleCallback?: (c: () => void, o?: { timeout: number }) => void;
  }).requestIdleCallback;
  if (ric) ric(cb, { timeout: teto });
  else setTimeout(cb, Math.min(teto, 900));
}

type Limpeza = { revert: () => void } | undefined;

/**
 * Atalho para o padrão repetido em todo componente animado:
 * carrega o GSAP quando der, roda o efeito dentro de um `gsap.context`
 * com escopo, e devolve a limpeza.
 *
 * Se o componente desmontar antes do GSAP chegar, nada roda.
 */
export function efeitoGsap(
  escopo: { current: HTMLElement | null },
  efeito: (m: ModuloGsap) => void,
  opcoes: { ocioso?: boolean } = {}
): () => void {
  let vivo = true;
  let ctx: Limpeza;

  const iniciar = () => {
    if (!vivo) return;
    carregarGsap().then((m) => {
      if (!vivo || !escopo.current) return;
      ctx = m.gsap.context(() => efeito(m), escopo.current) as Limpeza;
    });
  };

  if (opcoes.ocioso) aoOcioso(iniciar);
  else iniciar();

  return () => {
    vivo = false;
    ctx?.revert();
  };
}
