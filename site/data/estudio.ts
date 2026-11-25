/**
 * Conteúdo do estúdio: contato, bio, números, textos legais.
 * Tudo o que está como `null` é um `// TODO` da cliente — ver TODO-CLIENTE.md.
 * O site renderiza cada bloco só quando o campo existe. Nada é inventado.
 */

export const estudio = {
  nome: 'Isabela Junqueira',
  profissao: 'Arquiteta',
  marca: 'Isabela Junqueira Arquitetura',
  cidade: 'Maringá',
  estado: 'PR',
  pais: 'Brasil',

  /** Confirmado contra o bit.ly da bio, que está sem o nono dígito. Ver DECISOES.md. */
  whatsapp: {
    numero: '5543999698806',
    exibicao: '(43) 99969-8806',
  },

  instagram: {
    usuario: 'isajunqueira_arquitetura',
    url: 'https://www.instagram.com/isajunqueira_arquitetura/',
    seguidores: '51,6 mil',
  },

  /** Dado dela, da própria bio. Não arredondar nem inflar. */
  numeros: [
    { valor: 1000, prefixo: '+', rotulo: 'projetos entregues' },
    { valor: 5.0, decimais: 1, rotulo: 'no Google', sufixo: '' },
    // TODO (cliente): anos de carreira. Sem isto o terceiro número não aparece.
    { valor: null as number | null, rotulo: 'anos de carreira' },
  ],

  frentes: [
    {
      slug: 'arquitetura',
      titulo: 'Arquitetura',
      texto: 'Do terreno vazio à chave na mão. A planta nasce de como a sua família vive, não de um catálogo.',
    },
    {
      slug: 'interiores',
      titulo: 'Interiores',
      texto: 'Marcenaria, pedra, iluminação e mobiliário pensados juntos, desde o primeiro desenho.',
    },
    {
      slug: 'paisagismo',
      titulo: 'Paisagismo',
      texto: 'O verde não entra no fim. Entra junto, porque é ele que faz a casa parecer que sempre esteve ali.',
    },
  ],

  /** O diferencial comercial: os três no mesmo contrato. */
  diferencial:
    'Arquitetura, interiores e paisagismo saem do mesmo escritório, no mesmo contrato. ' +
    'Você não precisa costurar três profissionais nem explicar a mesma coisa três vezes.',

  processo: [
    // TODO (cliente): ajustar os nomes das etapas com ela.
    { n: 1, titulo: 'Conversa e briefing', texto: 'A gente começa entendendo como vocês vivem. Onde comem, onde recebem, onde ficam quando não tem ninguém olhando.' },
    { n: 2, titulo: 'Estudo preliminar', texto: 'As primeiras plantas e volumetrias. É aqui que a casa toma forma e você vê o projeto pela primeira vez.' },
    { n: 3, titulo: 'Projeto executivo', texto: 'Todo o detalhamento que a obra precisa: marcenaria, elétrica, hidráulica, iluminação, pedra, paisagismo.' },
    { n: 4, titulo: 'Acompanhamento de obra', texto: 'Visitas e decisões ao longo da construção, para o que foi desenhado chegar inteiro no final.' },
  ],

  lugares: {
    destaque: ['Maringá e região', 'Maldivas'],
    texto:
      'A maior parte dos projetos nasce em Maringá e região. Mas boa parte dos clientes chega ' +
      'de outras cidades do Brasil, e alguns de fora — o projeto das Maldivas começou assim.',
    // TODO (cliente): lista completa de cidades e países já atendidos.
    lista: null as string[] | null,
  },

  bio: {
    curta: 'Arquiteta em Maringá. Faço casas para famílias que querem morar bem de verdade.',
    primeiraPessoa:
      'Eu projeto casa. Não "empreendimento", não "solução arquitetônica": casa, o lugar onde ' +
      'uma família vai passar os próximos vinte anos. Faço arquitetura, interiores e paisagismo ' +
      'juntos porque é assim que a casa fica inteira. Já entreguei mais de mil projetos, em ' +
      'Maringá, em outras cidades do Brasil e fora dele.',
  },

  /** Selo de credibilidade forte para arquiteto. Só renderiza preenchido. */
  // TODO (cliente): número de registro no CAU.
  cau: null as string | null,

  // TODO (cliente): só se ela quiser divulgar. Entra no rodapé e no schema LocalBusiness.
  endereco: null as { logradouro: string; bairro: string; cep: string } | null,
  horario: null as string | null,

  /** Usado na tela "Pedido pronto", depois do briefing. */
  // TODO (cliente): ex. "respondo em até 2 h em dia útil, das 9h às 18h".
  tempoResposta: null as string | null,

  // TODO (cliente): conferir contrato com o fotógrafo antes de publicar.
  creditoFotografia: null as string | null,

  legal: {
    // TODO (jurídico): revisar com advogado antes de publicar.
    privacidadeRevisada: false,
    aceiteBriefing:
      'Ao enviar, você concorda que seus dados sejam usados apenas para responder este contato. ' +
      'Nada é armazenado em servidor: a mensagem sai direto do seu navegador para o WhatsApp.',
  },
} as const;

export type Estudio = typeof estudio;
