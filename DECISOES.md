# Decisões

Registro do que foi decidido e por quê. Ordem cronológica dentro de cada bloco.

---

## 1. Etapa 0 — o que o Instagram público realmente entrega

### O perfil abre sem login. Os destaques também.
Não foi preciso parar nem pedir acesso: perfil, posts e destaques carregam anonimamente.
A coleta rodou com pausas de 3 a 6 segundos entre requisições, em quatro passadas.

### Mas o acervo público **não é um portfólio utilizável**. Esta é a constatação central.

Medição de tudo o que foi baixado (119 arquivos, 89 MB):

| faixa | imagens | o que é |
|---|---|---|
| ≥ 1080 px no lado menor | 26 | **3** renders de projeto (1440×1800) · **2** retratos dela · **21** fotos de viagem a Brasília e eventos |
| 640 – 1079 px | 30 | aqui está a obra de verdade, mas em baixa e com texto queimado |
| < 640 px | 26 | capas de destaque, avatares |
| vídeos | 34 | reels verticais |

Três limites se somam:

1. **Story de destaque sem login sai a 640 px.** É onde mora o portfólio dela (Damha IV,
   Casa Nature, Golden House etc.), e 640 px no lado menor reprova no critério do briefing
   (mínimo 1080) e não serve para foto em tela cheia.
2. **A grade anônima trava.** A primeira passada alcançou 55 posts; as seguintes, 12. O
   Instagram apertou o limite depois das primeiras requisições. Não houve tentativa de
   contornar.
3. **Boa parte do feed em alta não é obra dela.** As fotos de 3072×4096 são uma viagem a
   Brasília (Catedral, Congresso, Os Candangos) e eventos de CasaCor. Entraram no acervo por
   serem as de maior resolução, e foram descartadas na curadoria.

**Consequência para o escopo:** não é possível montar 8 páginas de projeto com 6 a 10 fotos
em alta cada uma, como o briefing pede. O material público dá para uma home forte e poucas
páginas de projeto honestas. O desbloqueio real está em (a) login no Instagram, que eleva
story a 1080×1920 e libera a rolagem da grade, ou (b) os arquivos originais com ela, que é
a melhor saída de qualquer forma. Ver `TODO-CLIENTE.md`.

### Não dá para separar obra dela de referência repostada
Vários detalhes bons (adega côncava, arandela de mármore, mini spot em couro, lavabo em
quartzito) aparecem em posts de CasaCor Brasília. Não há como afirmar pelo post se são obra
dela ou referência que ela comentou. Pelo critério de honestidade do briefing, **nenhuma
dessas entra como obra dela sem confirmação**.

### O nome é "Damha IV", não "Dahma IV"
O título do destaque está escrito `Dahma IV`, mas o sticker de localização dentro da própria
story diz **Damha IV** — que é o nome real do condomínio (grupo Damha). O briefing repetiu o
erro do perfil. O site usa `Damha IV`, com o slug `damha-iv`. Vale corrigir o destaque também.

### O link da bio está quebrado
`curl -sIL https://bit.ly/AtendimentoIsaJunqueira` resolve para:

```
bit.ly → wa.link/oqpp6v → api.whatsapp.com/send?phone=554399698806
```

`554399698806` tem **oito** dígitos depois do DDD (`9969-8806`). Celular brasileiro tem nove.
Com o nono dígito vira `99969-8806`, que é exatamente o número do briefing. Ou seja: o link
que 51,6 mil seguidores usam hoje aponta para um número sem o nono dígito.

**O site usa `5543999698806`** (o do briefing, com nove dígitos). Confirmar com ela antes de
publicar — e trocar o bit.ly, que é um problema que existe independente do site.

---

## 2. Identidade visual

### Tokens de cor: amostrados, não supostos
K-means (9 centroides) sobre 15 fotos de obra curadas, 77.760 pixels:

| hex | peso | família |
|---|---|---|
| `#2a1d11` | 19% | quase-preto **quente** |
| `#694020` | 16% | madeira escura |
| `#6f6b60` | 12% | cinza-pedra |
| `#474339` | 11% | madeira sombra |
| `#a96836` | 11% | **madeira** |
| `#a2866a` | 10% | pedra clara |
| `#a6a8a0` |  8% | travertino |
| `#dea96a` |  7% | **madeira clara** |
| `#dfe0de` |  6% | osso |

**Seis dos nove centroides estão entre matiz 26 e 44** — madeira, âmbar, areia. Não apareceu
nenhum centroide verde nem água.

Mudanças feitas:
- `madeira-500` **#B0763F → #A96836** (valor amostrado)
- `madeira-300` **#D9A871 → #DEA96A** (valor amostrado)
- `pedra-400` **#A2866A** — token novo, 10% dos pixels, não existia no briefing
- `tinta` **#15120E → #1C1611** — o preto dela é quente (#2a1d11), não neutro

Mudanças **não** feitas, de propósito:
- Os verdes (`mata-*`) ficaram como estavam. A amostra está enviesada: o que consegui coletar
  é quase todo detalhe de interior, que é naturalmente amadeirado. As fotos de área externa
  dela — com palmeira, folhagem densa e piscina — são justamente as que ficaram presas nos
  destaques em 640 px. Abandonar o verde com base nesta amostra seria conclusão errada tirada
  de uma amostra torta. O verde segue como escolha de projeto, não como dado.
- `agua-*` idem. A piscina de Damha IV confirma a cor na prática, mas é uma foto em 15.

### Contraste (WCAG AA), conferido por script — `ferramentas/contraste.mjs`
Aprovados em texto pequeno: travertino/mata-950 (12,98), osso/mata-950 (16,72),
madeira-300/mata-950 (8,50), agua-300/mata-950 (8,67), pedra-400/mata-950 (5,24),
tinta/osso (16,76), mata-600/osso (9,17).

**Reprovados em texto pequeno, restritos a uso grande ou a filete:**
- `madeira-500` sobre `osso` — **4,16**. Só em palavra de impacto ≥24 px (passa em AA Large) e
  em filete. Texto pequeno sobre claro usa sempre `tinta`.
- `agua-500` sobre `mata-950` — **4,43**, por pouco. Não recebe texto: fica para anel de foco,
  estado ativo e detalhe de piscina.

### Monograma IJ
**I romano + J itálico** da Instrument Serif, J deslocado `dx 165 / dy 40`. Escolhido numa
folha de cinco opções de cruzamento (`entrada/provas/monograma-opcoes.png`) e depois numa
folha de refino de cinco variações (`monograma-refino.png`).

Por que o J itálico e não o romano: o itálico é o único recurso de ênfase do site (palavra de
impacto dentro da frase). Usá-lo na marca faz a marca e o texto falarem a mesma língua. O J
romano (opção B) funcionava, mas era mais mudo.

O `dy 40` resolve um problema concreto: com os dois na mesma linha de base, a serifa direita
do I e a serifa esquerda do J se tocavam e formavam uma ponte ambígua. Descer o J 40 unidades
abre as serifas no topo e deixa a haste do J cruzar o pé do I — o cruzamento leve que o
briefing pede.

Entregue em contorno, sem dependência de fonte, em `marca/`: monograma, lockup horizontal e
vertical, cada um em versão clara (fundo escuro) e escura (fundo claro), mais versões em
`currentColor` para o site. Testado a 34 px (favicon e header) e a 220 px.

### Tipografia
Instrument Serif nos títulos, Satoshi 300–700 na interface — ambas self-hosted em woff2,
subset latin, `font-display: swap`. Nenhuma das duas precisou de plano B.

---

## 3. Efeito de assinatura "Luz da água"

### O método importa: cáustica não é ruído em curva de nível
A primeira versão usou o caminho comum — fbm sobre fbm, linhas por `smoothstep` nos níveis do
campo. O resultado parecia **mármore ou mapa topográfico**: veia densa e uniforme, nada de
água. (`entrada/provas/luz-01-base.png`, primeira geração.)

A versão final usa o modelo físico. Cáustica é a **dobra do mapa de refração**: um raio que
entra na superfície em `p` chega ao fundo em `f(p) = p + r·∇h`. O brilho é o inverso de quanto
esse mapa comprime a área, `1/|det J|`, com `J = I + r·H(h)`. Como a superfície da água é uma
soma de senoides, o Hessiano sai **analítico** — um `sin` por onda, sem amostrar ruído.

Isso dá três ganhos de uma vez:
1. **Parece água de verdade:** filamentos finos, nós brilhantes onde as dobras se cruzam,
   células escuras no meio. É a assinatura que ruído não produz.
2. **É mais barato:** 6 senoides por camada, contra ~50 amostras de ruído da primeira versão.
3. **Antialias estável:** limiarizar o próprio `det` perto de zero (e não `1/det`, que explode)
   mantém `fwidth` bem-comportado e a linha sai fina de verdade.

Três iterações registradas: `luz-02` (mármore), `iter-a` (contorno tipo wireframe, sem corpo),
`iter-b` (final — filamento com núcleo aceso e brilho variável).

### Ajustes de direção
As seis ondas estavam agrupadas em poucos ângulos e o padrão formava faixa diagonal. Foram
reespalhadas a cada ~30°. A variação de brilho ao longo do filamento vem do mesmo fbm que já
desloca o domínio, então custou zero.

### Guarda-chuva de performance
Render a 0,7× da resolução, `devicePixelRatio` no teto de 1,75, `IntersectionObserver` para não
desenhar fora da tela, pausa com a aba oculta, e teto de 45 fps quando o frame time médio passa
de 21 ms. Fallback em canvas 2D, e fundo sólido se nem isso.
`prefers-reduced-motion` desenha um quadro e congela.

---

## 4. UX — decisões a preservar

- **O índice de projetos na hero** resolve o problema central: ela tem mais de mil projetos e
  nenhum lugar onde se possa navegar por eles. A primeira tela já é o portfólio, sem rolar.
- **O briefing pergunta investimento com faixa ampla e com saída** ("prefiro falar sobre isso
  depois"). Perguntar valor cedo filtra; perguntar errado espanta. A saída preserva o lead bom
  que ainda não sabe o orçamento.
- **Por que o briefing existe:** 51,6 mil seguidores caem hoje num bit.ly que abre uma conversa
  de WhatsApp em branco (e, como visto acima, num número quebrado). Chega junto quem quer
  construir uma casa de mil metros e quem quer saber o preço de uma planta pronta, e ela ou a
  equipe gastam o mesmo tempo com os dois. O briefing separa isso em cerca de um minuto e
  entrega o pedido organizado.
- **O CTA é sempre o mesmo verbo** e abre o mesmo painel, de qualquer lugar. Um funil só, fácil
  de medir.
- **Prova social perto do CTA:** +1000 projetos e nota 5,0. Para arquiteto, volume de entrega
  vale mais que depoimento genérico.
- **A página de projeto é o ativo de SEO.** Destaque de Instagram não aparece no Google;
  "casa de alto padrão Maringá" aparece.
- **Fundo animado só nas seções escuras**, sempre abaixo de texto em contraste AA, e com a
  opacidade caindo mais ainda atrás de bloco de texto.
- **Foto grande é o produto.** Em qualquer dúvida entre mais texto e mais foto, mostra a foto.
