# Isabela Junqueira Arquitetura — site

Portfólio e funil de atendimento. Next.js (App Router) + TypeScript + Tailwind 4,
GSAP com ScrollTrigger/SplitText/Observer, Lenis, e um efeito WebGL de assinatura.
Export estático: o briefing roda 100% no navegador, sem servidor.

```
site/           o site
  app/          rotas
  components/   componentes
  data/         CONTEÚDO — é aqui que se edita
  lib/          shader, marca em contorno, analytics
  public/       fontes, fotos processadas, textura
ferramentas/    scripts de coleta, imagem, marca e revisão (não vão ao ar)
entrada/        acervo bruto, contact sheets, provas e screenshots de revisão
marca/          logo em SVG, 6 variantes
lab/            protótipo isolado do efeito "Luz da água"
```

---

## Rodar

```powershell
cd site; npm install; npm run dev
```

Build estático (gera `site/out/`):

```powershell
cd site; npm run build
```

### Modo pré-site

`site/.env.local`:

```
NEXT_PUBLIC_PRESITE=true
```

Com `true`: `robots: noindex, nofollow`, analytics desligado, schema.org fora do HTML.
Nada na interface menciona que é um pré-site. Para publicar de verdade, troque para
`false` (ou remova a linha).

---

## Editar o conteúdo

Dois arquivos. Não é preciso abrir mais nada.

### `site/data/estudio.ts`
Contato, bio, números, as quatro etapas do processo, as três frentes, textos legais.
Campos `null` são pendências da cliente: **o bloco correspondente simplesmente não
renderiza** até ser preenchido. Nada é inventado para tapar buraco.

### `site/data/projetos.ts`
Um objeto por projeto. Deste arquivo saem, automaticamente:
a lista da hero, o marquee, a seção de destaques, a grade `/projetos`, as páginas
`/projetos/[slug]`, o "próximo projeto" e o sitemap.

Para adicionar um projeto: copie um objeto existente, troque `slug`, `nome` e os textos.

### Adicionar fotos

1. Coloque os arquivos originais numa pasta, por exemplo `entrada/novas/`.
2. Processe (gradação única + AVIF/WebP em vários tamanhos):

```powershell
cd ferramentas; $env:PASTA="entrada/novas"; $env:SLUG="damha-iv"; node processar.mjs
```

3. O script imprime o `base`, a largura, a altura e os `tamanhos` de cada imagem.
   Monte o objeto `Foto` em `projetos.ts` com esses valores e um `alt` que **descreva
   o ambiente** (nunca comece com "foto de").

```ts
const varanda: Foto = {
  base: 'nome-que-o-script-imprimiu',
  pasta: 'damha-iv',
  largura: 2400, altura: 3000, tamanhos: [480, 768, 1200, 1800, 2400],
  alt: 'Varanda com teto de madeira ripada e vista para a piscina, com palmeiras ao fundo',
};
```

Dimensões explícitas evitam CLS. O `srcset` é montado sozinho.

### Outros arquivos de conteúdo
- `site/data/briefing.ts` — os 5 passos, as opções e as faixas de investimento
- `site/data/depoimentos.ts` — vazio de propósito; a seção some enquanto estiver vazia

---

## Publicar no Netlify

O build já sai estático em `site/out/`.

**Pelo painel:** novo site → conecte o repositório →
- Base directory: `site`
- Build command: `npm run build`
- Publish directory: `site/out`
- Environment variables: `NEXT_PUBLIC_PRESITE` = `true` (pré-site) ou `false` (no ar)

**Por arrastar:** rode `npm run build` e arraste a pasta `site/out` para o Netlify Drop.

Um `netlify.toml` na raiz do repositório também resolve:

```toml
[build]
  base = "site"
  command = "npm run build"
  publish = "site/out"
```

---

## Trocar o link da bio pelo deep link do briefing

Hoje a bio aponta para `bit.ly/AtendimentoIsaJunqueira`, que abre uma conversa de
WhatsApp em branco — e, como está documentado em `DECISOES.md`, **com o número sem o
nono dígito**. O site substitui isso por um link que já abre o briefing.

Formato:

```
https://SEU-DOMINIO/?briefing=1&tipo=residencial&utm_source=instagram&utm_medium=bio
```

- `briefing=1` — abre o painel assim que a página carrega
- `tipo` — `residencial`, `interiores` ou `paisagismo`; já deixa o passo 1 respondido
- `utm_source` / `utm_medium` — de onde veio, para medir depois

Passo a passo:

1. Publique o site e confirme o domínio.
2. Abra o link acima no celular e confira que o painel abre com o passo 1 marcado.
3. No Instagram: **Editar perfil → Links → Adicionar link externo**, cole a URL e dê
   um nome curto ("Começar meu projeto").
4. Remova ou substitua o bit.ly antigo.
5. Um link por frente, se ela quiser separar: troque só o `tipo`.

Enquanto o site estiver em modo pré-site, **não troque a bio ainda** — o site está com
`noindex` e sem medição.

---

## Acessibilidade e performance — o que está garantido

- Contraste AA conferido por script (`ferramentas/contraste.mjs`). Os dois pares que
  reprovam em texto pequeno (`madeira-500`/osso e `agua-500`/mata-950) estão restritos
  a texto grande e a filete.
- Briefing operável só por teclado: foco preso, ESC fecha, `aria-live` nos avisos,
  alvo de toque mínimo de 48 px.
- `prefers-reduced-motion`: sem parallax, sem scroll suave, sem shader animado — o
  efeito desenha um quadro e congela; os reveals viram fade de 0,3 s.
- Imagens em AVIF + WebP com `srcset`, dimensões explícitas, lazy fora da dobra.
- O shader desenha a 0,7× da resolução, só quando visível, pausa com a aba oculta e
  tem teto de 45 fps em aparelho fraco.

---

## Os scripts de `ferramentas/`

| script | o que faz |
|---|---|
| `coletar*.mjs` | coleta do Instagram público, com pausas de 3 a 6 s |
| `medir.mjs` | mede resolução e cor de tudo que foi baixado |
| `contato.mjs` | gera as contact sheets numeradas para curadoria |
| `amostrar.mjs` | conta-gotas: extrai a paleta real das fotos (k-means) |
| `contraste.mjs` | checagem WCAG dos pares que o site usa |
| `processar.mjs` | gradação única + AVIF/WebP em vários tamanhos |
| `marca.mjs` | gera o monograma e os lockups em contorno |
| `assinatura.mjs` | gera a assinatura em contorno |
| `textura.mjs` | gera a textura estática de cáusticas |
| `revisar.mjs` | screenshots em 390/768/1440, vídeo do scroll, erros de console |
| `diag.mjs` | inspeciona um elemento no navegador (usado para caçar bug de layout) |

Leia também: `DECISOES.md`, `REVISOES.md`, `CREDITOS.md`, `TODO-CLIENTE.md`.
