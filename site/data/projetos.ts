/**
 * Os projetos. Deste arquivo saem a home, o índice e as páginas /projetos/[slug].
 *
 * Os nomes vêm dos destaques do Instagram dela — é o portfólio que ela já organizou.
 * `midia` diz quanta foto cada projeto tem hoje. `pendente` renderiza a página com o
 * efeito "Luz da água" no lugar da foto: assumido e desenhado, em vez de quebrado.
 *
 * Ficha técnica (ano, área, cidade) está como `null` de propósito: nada é inventado.
 * Ver TODO-CLIENTE.md.
 */

export type Foto = {
  /** base do arquivo em /public/fotos/<pasta>/ , sem tamanho nem extensão */
  base: string;
  pasta: string;
  largura: number;
  altura: number;
  tamanhos: number[];
  /** descreve o ambiente. Nunca "foto de". */
  alt: string;
};

export type Projeto = {
  slug: string;
  nome: string;
  /** como aparece no índice da hero, em itálico quando ativo */
  local: string | null;
  tipo: 'casa' | 'apartamento' | 'praia' | 'internacional';
  escopo: string[];
  ano: number | null;
  area: string | null;
  resumo: string;
  paragrafos: string[];
  detalhe: { titulo: string; texto: string } | null;
  capa: Foto | null;
  fotos: Foto[];
  midia: 'completa' | 'parcial' | 'pendente';
  destaque: boolean;
};

/* ------------------------------------------------------------------
   Fotos do acervo, coletadas da sessão logada no Instagram, em 1080×1920.
   Só entram aqui imagens SEM texto queimado, SEM print de interface e SEM
   pessoa identificável — o resto foi descartado na curadoria. Ver CREDITOS.md.
   ------------------------------------------------------------------ */

const dim = { largura: 1800, altura: 2333, tamanhos: [480, 768, 1080, 1440, 1800] };

// As quatro fotos com adesivo de localização queimado foram descartadas na
// curadoria: 04, 08, 09 e 11. Ver CREDITOS.md.
const damha = (n: string, alt: string): Foto => ({ base: `ij-damha-iv-${n}`, pasta: 'damha-iv', ...dim, alt });

const d02 = damha('02', 'Poltrona de fibra junto a uma lareira externa redonda de concreto, diante de painel de madeira ripada e vaso alto de cerâmica escura');
const d03 = damha('03', 'Espreguiçadeiras brancas à beira da piscina, sob varanda de teto ripado, com a lâmina de água correndo rente ao piso de pedra clara');
const d05 = damha('05', 'Palmeira alta emoldurada pela pérgola de vigas brancas, com a piscina e a vegetação densa ao fundo');
const d06 = damha('06', 'Borda da piscina vista de baixo, com vasos de cerâmica escura sobre a parede de pedra e folhagem densa em volta');
const d10 = damha('10', 'Jardim de entrada com palmeira central, degraus largos de pedra clara e maciços de folhagem colorida');
const d12 = damha('12', 'Fachada ao entardecer, com painéis de pedra e madeira ripada alternados, sobre canteiro denso de folhagem');


export const projetos: Projeto[] = [
  {
    slug: 'damha-iv',
    // O adesivo de localização dentro da story diz "Damha IV". O destaque está escrito
    // "Dahma IV", que é erro de digitação no perfil. Ver DECISOES.md.
    nome: 'Damha IV',
    local: 'Maringá, PR',
    tipo: 'casa',
    escopo: ['Arquitetura', 'Interiores', 'Paisagismo'],
    ano: null, // TODO (cliente)
    area: null, // TODO (cliente)
    resumo: 'A casa inteira organizada em volta da piscina.',
    paragrafos: [
      'Em Damha IV a piscina não é um item da área de lazer: é o eixo da casa. Todos os ambientes sociais abrem para ela, e a lâmina de água devolve a luz para dentro ao longo do dia.',
      'A madeira ripada aparece no teto da varanda e no painel que esconde a área de serviço, e é o que dá temperatura ao conjunto. A pedra clara segura o piso e as circulações, e a vegetação densa fecha as laterais: de dentro, não se vê vizinho.',
    ],
    detalhe: {
      titulo: 'O desenho da água',
      texto: 'O fundo da piscina foi executado em tom claro justamente para a cáustica aparecer — aquele desenho de luz que a água projeta. É o efeito que dá nome à linguagem visual deste site.',
    },
    // Fotos vindas do próprio destaque "Damha IV" do Instagram dela: a atribuição
    // tem evidência, não é palpite.
    capa: d03,
    fotos: [d03, d02, d05, d06, d10, d12],
    midia: 'completa',
    destaque: true,
  },
  {
    slug: 'casa-nature',
    nome: 'Casa Nature',
    local: 'Maringá, PR',
    tipo: 'casa',
    escopo: ['Arquitetura', 'Interiores', 'Paisagismo'],
    ano: null,
    area: null,
    resumo: 'Madeira, pedra e verde, sem nada entre eles.',
    paragrafos: [
      'O nome diz o programa: material natural aparente, do jeito que ele é. Madeira sem verniz brilhante, pedra com a veia à mostra, vegetação que encosta na arquitetura em vez de ficar num canteiro separado.',
      'A casa é longa e baixa, e cada ambiente social tem pelo menos duas aberturas, para o ar atravessar. Em Maringá isso não é estética: é o que faz a casa funcionar sem ar-condicionado boa parte do ano.',
    ],
    detalhe: {
      titulo: 'Pedra natural na circulação',
      texto: 'O revestimento de pedra acompanha o corredor inteiro, do hall à sala, com um rasgo de luz no teto correndo junto. De dia a pedra muda de cor três ou quatro vezes.',
    },
    // Sem foto atribuída: nenhuma evidência liga as imagens do acervo a este projeto.
    // Ver TODO-CLIENTE.md.
    capa: null,
    fotos: [],
    midia: 'pendente',
    destaque: true,
  },
  {
    slug: 'golden-house',
    nome: 'Golden House',
    local: 'Maringá, PR',
    tipo: 'casa',
    escopo: ['Arquitetura', 'Interiores'],
    ano: null,
    area: null,
    resumo: 'Luz quente, madeira escura e um pé-direito que abre.',
    paragrafos: [
      'Golden House é a casa mais noturna do acervo. O projeto de iluminação foi desenhado junto com a marcenaria, então a luz nasce de dentro dos móveis e das sancas, não de luminária aparente.',
      'A paleta é mais fechada que o usual: madeira escura, bronze e pedra de veio forte. É uma casa para receber à noite.',
    ],
    detalhe: {
      titulo: 'Marcenaria e luz no mesmo desenho',
      texto: 'Cada rasgo de luz foi previsto no projeto executivo de marcenaria. É o que evita o conflito clássico em obra, quando o eletricista chega depois do marceneiro.',
    },
    // Sem foto. A única imagem que sobrou do destaque tinha marca d'água queimada
    // creditando um segundo escritório (@nakamura.arq): usá-la como capa seria
    // atribuir trabalho de terceiro. Ver CREDITOS.md.
    capa: null,
    fotos: [],
    midia: 'pendente',
    destaque: true,
  },
  {
    slug: 'alphaville-maringa',
    nome: 'Alphaville Maringá',
    local: 'Maringá, PR',
    tipo: 'casa',
    escopo: ['Arquitetura', 'Interiores', 'Paisagismo'],
    ano: null,
    area: null,
    resumo: 'Casa de condomínio que não parece casa de condomínio.',
    paragrafos: [
      'O desafio de Alphaville é o lote: regular, com recuos obrigatórios e vizinho dos dois lados. A resposta foi fechar a casa para a rua e abrir tudo para o fundo, onde ficam a piscina e o jardim.',
      'Da calçada se vê um volume discreto de pedra e madeira. De dentro, a casa inteira olha para o verde.',
    ],
    detalhe: null,
    capa: null,
    fotos: [],
    midia: 'pendente',
    destaque: true,
  },
  {
    slug: 'casa-del-este',
    nome: 'Casa Del Este',
    local: null, // TODO (cliente)
    tipo: 'casa',
    escopo: ['Arquitetura', 'Interiores'],
    ano: null,
    area: null,
    resumo: 'Orientação solar como ponto de partida do projeto.',
    paragrafos: [
      'O nome veio da implantação. A casa foi girada no terreno para os quartos pegarem o sol da manhã e a área de lazer ficar na sombra na hora mais quente da tarde.',
      'É uma decisão tomada no primeiro croqui, antes de qualquer escolha de acabamento, e é o que mais muda o conforto de morar.',
    ],
    detalhe: null,
    capa: null,
    fotos: [],
    midia: 'pendente',
    destaque: false,
  },
  {
    slug: 'casa-punta',
    nome: 'Casa Punta',
    local: null, // TODO (cliente)
    tipo: 'praia',
    escopo: ['Arquitetura', 'Interiores', 'Paisagismo'],
    ano: null,
    area: null,
    resumo: 'Casa de praia feita para o sal e para a casa cheia.',
    paragrafos: [
      'Casa de praia tem dois inimigos: a maresia e o fim de semana com dezoito pessoas. O projeto responde aos dois — especificação resistente à corrosão e uma área social que absorve gente sem ficar apertada.',
      'A circulação foi desenhada para quem chega molhado da praia não atravessar a sala.',
    ],
    detalhe: null,
    capa: null,
    fotos: [],
    midia: 'pendente',
    destaque: false,
  },
  {
    slug: 'casa-fendi',
    nome: 'Casa Fendi',
    local: null, // TODO (cliente)
    tipo: 'apartamento',
    escopo: ['Interiores'],
    ano: null,
    area: null,
    resumo: 'Interiores de apartamento, do zero, em tons terrosos.',
    paragrafos: [
      'Projeto de interiores completo em imóvel novo: marcenaria, pedra, iluminação, mobiliário e arte, tudo especificado junto.',
      'A paleta é inteira terrosa — areia, camel, madeira média — com a pedra fazendo o único contraste forte do apartamento.',
    ],
    detalhe: null,
    capa: null,
    fotos: [],
    midia: 'pendente',
    destaque: false,
  },
  {
    slug: 'maldives-21',
    nome: 'Maldives 21',
    local: 'Maldivas',
    tipo: 'internacional',
    escopo: ['Arquitetura', 'Interiores', 'Paisagismo'],
    ano: null,
    area: null,
    resumo: 'O projeto que atravessou o oceano.',
    paragrafos: [
      'Um cliente que acompanhava o trabalho pelo Instagram chamou para um projeto nas Maldivas. O atendimento foi inteiro a distância, com visita presencial nos momentos que exigiam.',
      'É o projeto que prova o ponto: o escritório atende de Maringá, mas não está limitado a Maringá.',
    ],
    detalhe: null,
    capa: null,
    fotos: [],
    midia: 'pendente',
    destaque: true,
  },
];

export const porSlug = (slug: string) => projetos.find((p) => p.slug === slug);
// Só entra em "Projetos em destaque" quem tem foto: a seção é feita de fotografia,
// e um card de 1000 px sem imagem é espaço morto. Os demais continuam no índice
// da hero, no marquee, na grade /projetos e com página própria. Ver DECISOES.md.
export const destaques = projetos.filter((p) => p.destaque);
export const comFoto = projetos.filter((p) => p.capa !== null);

export const tipos = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'casa', rotulo: 'Casas' },
  { id: 'apartamento', rotulo: 'Apartamentos' },
  { id: 'praia', rotulo: 'Praia' },
  { id: 'internacional', rotulo: 'Internacional' },
] as const;

/** Monta o srcset a partir dos tamanhos que existem no disco. */
export function srcset(f: Foto, ext: 'avif' | 'webp') {
  return f.tamanhos.map((t) => `/fotos/${f.pasta}/${f.base}-${t}.${ext} ${t}w`).join(', ');
}
export function src(f: Foto, ext: 'avif' | 'webp' = 'webp') {
  return `/fotos/${f.pasta}/${f.base}-${f.tamanhos[f.tamanhos.length - 1]}.${ext}`;
}
