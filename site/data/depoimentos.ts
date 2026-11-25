/**
 * Depoimentos.
 *
 * REGRA: só entra texto real, lido no destaque "Feedbacks" do Instagram dela.
 * A coleta não conseguiu ler texto legível lá (as stories saem a 640 px e o
 * avanço do visualizador trava sem login), então a lista está vazia de propósito.
 *
 * A seção inteira não renderiza enquanto estiver vazia — é melhor não ter
 * depoimento do que ter depoimento inventado.
 *
 * // TODO (cliente): colar aqui os textos reais, com primeiro nome e, se ela
 * quiser e tiver autorização, a cidade. Ver TODO-CLIENTE.md.
 */

export type Depoimento = {
  texto: string;
  autor: string;
  local?: string;
  projeto?: string;
};

export const depoimentos: Depoimento[] = [
  // exemplo da forma esperada, comentado para não ir ao ar:
  // { texto: '...', autor: 'Fernanda', local: 'Maringá', projeto: 'Casa Nature' },
];
