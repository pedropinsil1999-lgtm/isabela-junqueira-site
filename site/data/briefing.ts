/**
 * Os 5 passos do briefing. Separado do componente para a Isabela poder
 * mexer no texto sem abrir código de interface.
 */

export type Opcao = { id: string; rotulo: string; nota?: string };

export const passos = [
  {
    id: 'objetivo',
    titulo: 'O que você quer fazer?',
    campo: 'objetivo' as const,
    opcoes: [
      { id: 'arquitetura', rotulo: 'Projeto de arquitetura (construir)' },
      { id: 'reforma', rotulo: 'Reforma e interiores' },
      { id: 'interiores', rotulo: 'Interiores de imóvel novo' },
      { id: 'paisagismo', rotulo: 'Paisagismo' },
      { id: 'nao-sei', rotulo: 'Ainda não sei' },
    ] as Opcao[],
  },
  {
    id: 'local',
    titulo: 'Onde é?',
    campo: 'local' as const,
    opcoes: [
      { id: 'maringa', rotulo: 'Maringá e região' },
      { id: 'brasil', rotulo: 'Outra cidade do Brasil' },
      { id: 'exterior', rotulo: 'Fora do Brasil' },
    ] as Opcao[],
  },
  {
    id: 'imovel',
    titulo: 'Sobre o imóvel',
    campo: 'imovel' as const,
    opcoes: [] as Opcao[],
  },
  {
    id: 'prazo',
    titulo: 'Prazo e investimento',
    campo: 'inicio' as const,
    opcoes: [] as Opcao[],
  },
  {
    id: 'contato',
    titulo: 'Contato',
    campo: 'nome' as const,
    opcoes: [] as Opcao[],
  },
];

export const tiposImovel: Opcao[] = [
  { id: 'casa', rotulo: 'Casa' },
  { id: 'apartamento', rotulo: 'Apartamento' },
  { id: 'praia-campo', rotulo: 'Casa de praia ou campo' },
  { id: 'comercial', rotulo: 'Comercial' },
];

export const metragens: Opcao[] = [
  { id: 'ate-150', rotulo: 'Até 150 m²' },
  { id: '150-300', rotulo: '150 a 300 m²' },
  { id: '300-600', rotulo: '300 a 600 m²' },
  { id: 'acima-600', rotulo: 'Acima de 600 m²' },
  { id: 'nao-sei', rotulo: 'Não sei ainda' },
];

export const fases: Opcao[] = [
  { id: 'terreno', rotulo: 'Terreno já comprado' },
  { id: 'em-projeto', rotulo: 'Em projeto' },
  { id: 'obra', rotulo: 'Obra já começada' },
  { id: 'pronto', rotulo: 'Imóvel pronto, para reformar' },
];

export const inicios: Opcao[] = [
  { id: 'o-quanto-antes', rotulo: 'O quanto antes' },
  { id: 'ate-6-meses', rotulo: 'Em até 6 meses' },
  { id: 'pesquisando', rotulo: 'Só pesquisando por enquanto' },
];

/**
 * // TODO (cliente): definir as faixas com a Isabela.
 * É a pergunta mais sensível do formulário e tem que sair no tom dela.
 * As faixas abaixo são um PLACEHOLDER para o fluxo funcionar — trocar antes de publicar.
 */
export const faixas: Opcao[] = [
  { id: 'faixa-a', rotulo: 'Até R$ 500 mil' },
  { id: 'faixa-b', rotulo: 'R$ 500 mil a R$ 1,5 milhão' },
  { id: 'faixa-c', rotulo: 'R$ 1,5 a 3 milhões' },
  { id: 'faixa-d', rotulo: 'Acima de R$ 3 milhões' },
  { id: 'depois', rotulo: 'Prefiro falar sobre isso depois' },
];

export const notaFaixa =
  'Serve só para dimensionar a equipe e o prazo. Nenhum valor é compromisso.';

/** Mapeia a escolha do passo 1 para o parâmetro do deep link. */
export const tipoDeeplink: Record<string, string> = {
  residencial: 'arquitetura',
  interiores: 'interiores',
  paisagismo: 'paisagismo',
};
