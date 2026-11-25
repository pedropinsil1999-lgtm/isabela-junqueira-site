import type { Foto } from './projetos';

/**
 * Retratos da Isabela. Ela é marca pessoal, não escritório anônimo:
 * aparece na hero e abre a seção "A arquiteta".
 *
 * // TODO (cliente): os originais em alta. Estes vieram em ~690 px de largura,
 * o que já limita o tamanho em que podem aparecer. Ver TODO-CLIENTE.md.
 */

export const retratoHero: Foto = {
  base: 'isabela-retrato',
  pasta: 'pessoa',
  largura: 623,
  altura: 869,
  tamanhos: [480, 623],
  alt: 'Isabela Junqueira sentada, de vestido verde-oliva, sorrindo, em um ambiente com painel de pedra ao fundo',
};

export const retratoArquiteta: Foto = {
  base: 'isabela-arquiteta',
  pasta: 'pessoa',
  largura: 689,
  altura: 868,
  tamanhos: [480, 689],
  alt: 'Isabela Junqueira sentada em uma poltrona clara, de vestido amarelo de renda, com a mão apoiada no queixo, diante de uma estante com plantas',
};
