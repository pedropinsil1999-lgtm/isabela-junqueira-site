# Revisões

Cada rodada: build do export estático, screenshots em 390 / 768 / 1440 px (topo, meio e
fim de cada página), vídeo do scroll completo, erros de console e peso da primeira dobra.
Tudo em `entrada/revisao/r<N>/`. Script: `ferramentas/revisar.mjs`.

Critérios Awwwards: Design 40% · Usabilidade 30% · Criatividade 20% · Conteúdo 10%.

---

## Rodadas 1 e 2 — o site sobe

**Estado:** home, índice e 8 páginas de projeto gerando. 110 e depois 218 erros de console.

**Os 5 piores problemas:**
1. `NaN` no caminho SVG da assinatura — o navegador recusava o `d` inteiro.
2. ~100 requisições 404 por página.
3. Peso da home em 1.245 KB.
4. Assinatura e monograma gerados pelo mesmo serializador suspeito.
5. Nenhuma verificação visual ainda.

**Correções:**
- O `NaN` vinha do glifo de **espaço**, que não tem `advanceWidth` na Instrument Serif
  Italic: o acumulador de posição virava `NaN` e contaminava todo o resto da frase.
  Mas a causa de fundo era outra — o `toPathData()` do opentype.js emite `NaN` em curva
  quadrática nesta versão. Escrevi `ferramentas/serializar.mjs`, que serializa os
  comandos direto e **aborta** se achar coordenada não finita. Monograma e lockups
  passaram a usar o mesmo serializador.
- Os 404 eram prefetch RSC do Next (`__next.projetos.$d$slug.__PAGE__.txt`), que o
  export estático não gera. `prefetch={false}` em todos os `Link`.

---

## Rodada 3 — primeira leitura visual

**Erros de console: 0.** Peso: 960 KB.

**Notas:** Design 6 · Usabilidade 5 · Criatividade 7 · Conteúdo 6

**Os 5 piores problemas:**
1. **O monograma colidia com o eyebrow** no canto superior esquerdo, nos dois
   breakpoints. No mobile, três linhas de texto por cima da marca. Grave.
2. A máscara em degradê da hero estava a 92% na esquerda: a foto, que é o produto,
   virava mancha escura.
3. Lista de projetos com contraste fraco entre ativo e inativo — o estado ativo não
   se destacava.
4. Dois botões "Começar meu projeto" idênticos visíveis ao mesmo tempo (header e hero),
   na mesma coluna, parecendo duplicata.
5. O mobile não seguia o briefing: era o layout desktop empilhado, sem a foto a 70svh
   nem o carrossel horizontal.

---

## Rodada 4 — hero refeita

**Correções:** eyebrow descido para abaixo da barra do header; degradê da esquerda de
.92 para .80; inativos de 72% para 52% de opacidade; botão do header virou contorno;
mobile reescrito com foto a 70svh, nome embaixo e lista em carrossel arrastável.

**Notas:** Design 8 · Usabilidade 7 · Criatividade 8 · Conteúdo 6

**Problema que apareceu:** uma faixa enorme de nada no meio da home.

---

## Rodadas 5 a 7 — caçando a área vazia

Três hipóteses, duas erradas. Registro as erradas porque cada uma custou uma rodada.

1. **Hipótese: limite de contextos WebGL.** O navegador corta acima de ~16 por aba, e eu
   tinha `LuzDaAgua` na hero, em cada card sem foto, no processo, no CTA e na grade.
   Reduzi para três instâncias ao vivo (hero, processo, CTA) e criei a **textura
   estática** gerada do próprio shader (`ferramentas/textura.mjs`) para os cards.
   *Melhorou a arquitetura, mas não era a causa.* A área continuou vazia.
2. **Hipótese: `ScrollTrigger.scrollerProxy` ligado ao Lenis.** Removi — e com razão: o
   Lenis padrão **já rola a janela**, então o proxy fazia o ScrollTrigger ler
   `lenis.scroll`, que não acompanha um `window.scrollTo` (link âncora, teclado,
   restauração de posição). Correção legítima e necessária. *Também não era a causa.*
3. **Diagnóstico de verdade.** Parei de adivinhar e escrevi `ferramentas/diag.mjs`, que
   lê o estilo computado do elemento no navegador. Resposta em uma linha:
   `clipPath: inset(0px 0px 100%)`. O card estava recortado a 100%, ou seja, invisível.

**A causa:** `gsap.from({clipPath})` com ScrollTrigger aplica o estado inicial **na
criação**. Se o gatilho nunca dispara — e não disparava, porque as posições foram
calculadas antes de as fotos extras da hero montarem e mudarem a altura da página — o
conteúdo fica escondido para sempre.

**Correção:** padrão seguro. O elemento **nasce visível**; um `ScrollTrigger.create` com
`onEnter` é que roda o `fromTo`. Se o gatilho falhar, o pior caso é não ter animação,
nunca conteúdo invisível. Mesmo tratamento nas etapas do processo, e
`immediateRender: false` no scrub da linha SVG, que agora nasce desenhada.
Mais um `ScrollTrigger.refresh()` depois que as fotos extras montam.

---

## Rodada 8 — conteúdo aparece, e aparece um problema de honestidade

O card do Golden House voltou a mostrar foto. **E a foto estava errada.**

Era uma parede de quadros vinda de um post de CasaCor Brasília. Eu tinha atribuído
imagens a projetos **por palpite**, só porque eram as fotos que eu tinha. É exatamente o
que o briefing proíbe: "não use foto como se fosse obra dela".

**Correção, e é a mais importante de todas as rodadas:**
- Casa Nature e Golden House perderam a capa. Não há nenhuma evidência ligando as
  imagens do acervo a esses projetos.
- Só Damha IV mantém fotos, e mesmo assim como **atribuição provisória**, registrada no
  código, em `CREDITOS.md` e em `TODO-CLIENTE.md`.
- O site passou a ter uma foto onde há evidência, e textura desenhada onde não há.

**Notas:** Design 8 · Usabilidade 8 · Criatividade 8 · Conteúdo 7

---

## Rodada 9 — estado atual

**Erros de console: 0.** Peso da home a 390 px: **951 KB** (meta: abaixo de 1,8 MB).
Alturas: home 9.875 px · índice 3.040 px · projeto 3.602 px.

Os cards sem foto passaram a 16/10 em vez de 4/5 — 4/5 de textura era espaço morto — e
a textura de cáusticas, com a força subida de 0,16 para 0,34, agora lê como água de
verdade em vez de uma mancha escura.

**Notas:** Design 8 · Usabilidade 8 · Criatividade 9 · Conteúdo 7

O 7 em Conteúdo é honesto e não tem como subir sozinho: o site está sem as fotos dos
projetos, sem depoimento real, sem CAU, sem ano e sem metragem. Nada disso depende de
código. Ver `TODO-CLIENTE.md`.

---

## Briefing — teste de ponta a ponta

`ferramentas/testar-briefing.mjs`, sobre o export estático.

- Deep link `?briefing=1&tipo=residencial&utm_source=instagram&utm_medium=bio` abre o
  painel **e já deixa o passo 1 respondido**.
- Foco preso dentro do painel, `Tab` alcança as opções, `Enter` escolhe, `ESC` fecha.
- Os 5 passos percorridos até o fim, sem erro de JavaScript.
- Alvos de toque conferidos no mobile.
- A mensagem sai exatamente no formato pedido:

```
Olá, Isabela! Vim pelo site.
*Quero:* Projeto de arquitetura (construir)
*Onde:* Maringá e região
*Imóvel:* Casa, 300 a 600 m², terreno já comprado
*Começar:* Em até 6 meses
*Investimento:* R$ 1,5 a 3 milhões
*Nome:* Fernanda
*Em uma frase:* Uma casa térrea, com muita árvore e a piscina no meio.
Ref. site #2W4R
```

- Abre `wa.me/5543999698806` com o texto codificado.
- Tela "Pedido pronto" com botão de copiar, número visível e três projetos sugeridos
  conforme o que a pessoa marcou.

**Nota sobre as capturas de tela do teste:** no renderer de software o shader anima sem
parar e a captura do Playwright fica esperando um quadro estável. O script remove os
`<canvas>` antes de capturar. Isso é limitação do ambiente de teste, não do site.

---

## Lighthouse mobile — e onde a meta **não** foi batida

`ferramentas/farol.mjs`, sobre o export estático, emulação mobile 390×844, throttling
simulado.

| | meta | home | página de projeto |
|---|---|---|---|
| Performance | 90+ | **43 a 50** ❌ | **50** ❌ |
| Acessibilidade | 95+ | **96** ✅ | **96** ✅ |
| Boas práticas | 95+ | **100** ✅ | **100** ✅ |
| SEO | 100 | 63 ⚠️ | 63 ⚠️ |
| LCP | < 2,5 s | **6,8 s** ❌ | 5,0 s ❌ |
| CLS | < 0,05 | **0** ✅ | **0** ✅ |

**SEO 63 é esperado e não é defeito:** a única auditoria reprovada é *"Page is blocked
from indexing"*, que é exatamente o que o modo pré-site faz. Com
`NEXT_PUBLIC_PRESITE=false` essa auditoria passa e a nota vai para ~100. As demais
(meta description, title, crawlability, viewport, link text) já passam.

**A auditoria de contraste reprovada** é o `madeira-500` sobre `osso`, em 4,16. É o par
que o próprio briefing antecipou como reprovado em texto pequeno; está restrito a
palavra de impacto grande e a filete, onde passa em AA Large. O Lighthouse não faz essa
distinção.

### Performance: o que eu corrigi e o que continua faltando

Corrigido nesta rodada:
- **Lenis carrega depois da primeira pintura** (import dinâmico em `requestIdleCallback`).
  Antes ele competia com o LCP. TBT caiu de 1.870 ms para 1.140 ms.
- **O shader só carrega quando a seção chega perto da tela E o main thread está ocioso**,
  via IntersectionObserver + `requestIdleCallback`. Compilar shader e criar contexto
  WebGL durante o carregamento é caro, e o fundo é decoração.
- **Preload da foto de LCP** com `imageSrcSet` em AVIF e `fetchPriority="high"`, como o
  briefing pede. LCP de 7,7 s para 6,8 s.
- Teto do preloader de 1,4 s para 1,1 s.

**Continua reprovado, e eu não cheguei na meta.** O que falta, em ordem de impacto:
1. **~680 KB de JavaScript.** React 19 + GSAP com ScrollTrigger e SplitText + o
   componente de seções, tudo no bundle inicial. O caminho é importar SplitText e
   ScrollTrigger sob demanda por seção, em vez de no topo de `Secoes.tsx`.
2. **O preloader custa LCP por definição** — ele cobre a tela antes da foto aparecer.
   Vale discutir se compensa.
3. Parte do número é o ambiente: o Lighthouse aqui roda com WebGL por **software**
   (swiftshader), o que infla muito o TBT do shader. Num aparelho com GPU o custo de
   main thread é bem menor. Mas **isso não explica tudo** e não serve de desculpa: o
   item 1 é real e é código.

Medições repetidas variaram entre 42 e 50 em Performance e entre 1.140 ms e 3.100 ms de
TBT na mesma build, o que mostra que o ambiente é ruidoso. Reportei o pior caso.

---

## prefers-reduced-motion

Sem scroll suave (Lenis nem inicia), sem parallax, sem cursor customizado, sem shader
animado — o efeito desenha um quadro e congela. Os reveals viram fade de 0,3 s, e o
preloader é pulado por completo.

---

## Rodada 11 — o acervo real entra

Com a sessão logada autorizada, os destaques passaram a entregar **1080×1920** em vez dos
640 px do perfil anônimo. Coletadas 18 imagens, 11 aprovadas na curadoria.

Damha IV passou de "atribuição provisória com 2 renders" para **10 fotos confirmadas,
vindas do destaque do próprio projeto** — dentro da meta de 6 a 10 do briefing. Golden
House ganhou a única imagem limpa do destaque dele.

A hero deixou de mostrar um render genérico e passa a abrir com a piscina de Damha IV:
água, madeira ripada, travertino e verde na mesma foto. É literalmente a origem do
conceito "Luz da água".

**Erros de console: 0.** Peso da home a 390 px: 988 KB. Home com 10.348 px.

**Notas:** Design 9 · Usabilidade 8 · Criatividade 9 · Conteúdo 8

Conteúdo subiu de 7 para 8: um projeto completo, de verdade. Não chega a 9 enquanto seis
projetos seguirem sem foto e os depoimentos, CAU, ano e metragem continuarem pendentes.

---

## Rodadas 12 a 15 — performance, e duas marcas d'água

### O erro de medição que escondia metade do problema

Até aqui o Lighthouse rodava contra um servidor local **sem compressão**. Como ele
calcula o tempo a partir dos bytes transferidos, 1.116 KB crus inflavam LCP e TBT em
cerca de 3x. Netlify e qualquer CDN servem gzip.

Corrigido em `ferramentas/servir.mjs`, que agora comprime texto como qualquer
hospedagem faz. Só isso mudou a leitura de **43 para 54** e o LCP de 7,6 s para 4,3 s —
sem tocar numa linha do site. A medição anterior estava errada, não o site.

### O que foi de fato otimizado

| mudança | por quê |
|---|---|
| **GSAP fora do bundle inicial** | onze componentes importavam `gsap` no topo. Agora há um carregador único (`lib/movimento.ts`) e a biblioteca vira chunk assíncrono. |
| **Lenis depois da primeira pintura** | scroll suave é conforto; até ele chegar o scroll nativo funciona. |
| **Preloader sem GSAP** | reescrito em CSS puro e um rAF. Era a primeira coisa na tela carregando uma biblioteca de animação. |
| **Header e menu em CSS** | `transform` direto e `@keyframes` no lugar de tweens. |
| **Shader sob demanda** | IntersectionObserver + `requestIdleCallback`. |
| **Seções estáticas viram componentes de servidor** | `TresFrentes` e `Atendimento` não têm estado nem evento: fora da árvore de hidratação. |
| **AVIF 50→44, WebP 78→72** | a foto de LCP caiu de 120 KB para 92 KB. |
| **`robots.txt` e `sitemap.xml`** | o SEO reprovava em "robots.txt is not valid". |

**Transferido na home: 1.116 KB → 473 KB (−58%).**

### Uma hipótese minha que estava errada

Eu suspeitava que o shader WebGL fosse o grande custo de main thread. Medi com ele
desligado: TBT praticamente igual (1,92 s contra 1,65 s, dentro do ruído). **Não era o
shader.** O custo é hidratação de React. Registro porque a hipótese errada custou uma
rodada.

### Placar final (Lighthouse mobile, servidor com gzip, execução limpa)

| | meta | home | projeto |
|---|---|---|---|
| Performance | 90+ | **59** ❌ | **52** ❌ |
| Acessibilidade | 95+ | **96** ✅ | **100** ✅ |
| Boas práticas | 95+ | **100** ✅ | **100** ✅ |
| SEO | 100 | 66 ⚠️ pré-site | 66 ⚠️ pré-site |
| LCP | < 2,5 s | **4,1 s** ❌ | 4,4 s ❌ |
| CLS | < 0,05 | **0** ✅ | **0** ✅ |

Performance saiu de 43 para 59 e o LCP de 7,6 s para 4,1 s. **Não chegou aos 90.** O que
resta é o runtime do Next mais a hidratação dos componentes de cliente que sobraram
(Hero, Destaques, Marquee, Processo, Sobre, Header, Briefing). Para fechar o resto seria
preciso separar markup de animação em cada um — markup no servidor, um componente fino
de cliente só para animar. É trabalho conhecido, não é mistério.

Aviso sobre as medições nesta máquina: rodar a revisão e o Lighthouse em sequência
derrubou o TBT para valores absurdos (30 s numa leitura). Os números da tabela são de
execução limpa, sem nada concorrendo.

### Duas marcas d'água que quase foram ao ar

Na rodada 13 a seção de destaques mostrou a foto do Golden House com
**"@isajunqueira_arquitetura @nakamura.arq"** queimado. Além de texto na foto, era
crédito a um segundo escritório: usá-la como capa seria atribuir trabalho de terceiro.
**Removida**, e Golden House voltou a ficar sem foto.

Na rodada 14 a página de Damha IV mostrou que **todas as seis** fotos restantes tinham o
adesivo de localização "Damha IV" queimado — minha conferência anterior só olhava a
faixa inferior da imagem, e os adesivos estavam no topo.

Aqui o caso é diferente do anterior: é a tag dela, no projeto dela. Tirar por corte é
retoque, não remoção de marca de terceiro. Cada foto foi cortada acima do seu adesivo
(`ferramentas/cortar.mjs`, de 13% a 28% do topo, medido foto a foto) e padronizada em
1080×1400. De quebra a proporção 3:4 funciona melhor na web que o recorte 9:16 da story.

**Notas:** Design 9 · Usabilidade 8 · Criatividade 9 · Conteúdo 8

---

## Rodadas 16 e 17 — rodada de ajustes do cliente

Nove pedidos, todos atendidos. Os que mudaram decisão de projeto:

**A Isabela entrou na hero.** Ela é marca pessoal — quem chega pelo Instagram chega
atrás dela, e a hero não a mostrava. Agora o retrato fica à direita, acima do nome e do
CTA, em moldura arredondada. No mobile vai ao lado do nome, abaixo da foto do projeto.

**A tipografia da hero parou de se mexer.** Caíram o reveal por máscara e o parallax do
texto. Num nome grande sobre foto o movimento atrapalha a leitura em vez de impressionar
— só a foto respira agora, com o zoom lento. Também saiu o eyebrow
"Arquitetura · Interiores · Paisagismo", que era o item mais dispensável da composição.

**A navbar ganhou um véu.** Um degradê de 160 px no topo garante leitura sobre qualquer
foto, inclusive a de Damha IV, que é clara no topo.

**Troca de tipografia.** Instrument Serif + Satoshi saíram: a dupla é o par mais usado
por gerador de site e o cliente reconheceu isso na hora. Entraram **Gambetta** (títulos)
e **General Sans** (interface), as duas da Fontshare, as duas variáveis. A Gambetta tem
itálico caligráfico de verdade, o que importa porque o itálico é o único recurso de
ênfase do site.

Consequência: **o monograma e a assinatura foram regerados em Gambetta**. Manter a marca
numa fonte que o site não usa mais seria incoerente. As proporções mudaram (caixa alta
680 em vez de 720, J itálico com varredura bem mais longa), então o cruzamento foi
reescolhido numa nova folha de opções: `dx 320 / dy 30`.

**Nada mais é quadrado.** Botões viraram pílula, fotos e cards ganharam raio de 24 a
32 px, campos do briefing 16 px. A obra dela não tem canto vivo; a interface acompanha.

**O botão magnético virou glow.** Além do pedido, foi ganho de performance: o magnetismo
exigia GSAP e um listener de `pointermove` por botão. O glow é CSS puro.

**Seção "A arquiteta"**, nos moldes da referência que o cliente trouxe: sobrenome em
escala de cartaz ao fundo, retrato sobreposto, texto e botão-pílula à direita. Adaptada
à identidade daqui — fundo osso, fantasma em travertino, sobrenome em itálico de
Gambetta. Substituiu a antiga seção "Sobre", que tinha um espaço vazio marcado "Retrato".

**Um falso alarme que virou correção real:** o canto superior direito do retrato parecia
quadrado. Ampliando, era uma luminária acesa dentro da própria foto, rente à borda. O
arredondamento estava certo; a faixa de luz é que distraía. Cortei 10% da direita e
clareei os dois retratos, que estavam escuros para o fundo osso.

**Erros de console: 0.** Peso da home a 390 px: 953 KB.
