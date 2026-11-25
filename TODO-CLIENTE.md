# O que depende da Isabela

Tudo aqui está marcado com `// TODO` no código e **não foi inventado**. O site roda sem nenhum
destes itens: cada bloco só aparece quando o campo é preenchido.

---

## Bloqueante — sem isto o site não fica bom

### 1. As fotos originais dos projetos restantes

**Resolvido em parte.** Com o login, 18 fotos em 1080×1920 foram coletadas dos destaques.
Depois da curadoria e do corte das marcas d'água, **6 entraram no site**, todas de
Damha IV — que agora tem página completa.

**Continua faltando:** Casa Nature, Alphaville Maringá, Casa Del Este, Casa Punta,
Casa Fendi e Maldives 21. Nesses destaques o conteúdo é quase todo **vídeo**, que o
navegador entrega como `blob:` e não dá para baixar pelo caminho usado.

**O que preciso, por projeto:** 6 a 10 fotos no maior tamanho que existir, direto da
câmera ou do fotógrafo, sem texto sobreposto e sem adesivo de localização. Prioridade:
fachada, área de piscina, varanda, ambiente inteiro, detalhe de madeira ripada e de pedra.

Mesmo para Damha IV, o arquivo original continua sendo melhor que 1080×1920: a story é
recortada em 9:16 e perde as laterais de qualquer foto horizontal.

### 2. Confirmar o WhatsApp — e consertar o link da bio
O `bit.ly/AtendimentoIsaJunqueira` resolve hoje para **55 43 9969-8806**, com oito dígitos
depois do DDD. Celular brasileiro tem nove. Com o nono dígito dá 99969-8806, que é o número do
briefing — ou seja, **o link que os 51,6 mil seguidores usam está sem um dígito**.

O site está usando `5543999698806`. Confirmar, e trocar o bit.ly de qualquer forma.

### 3. Faixas de investimento (passo 4 do briefing)
É a pergunta mais sensível do formulário e tem que sair na voz dela. Preciso de 4 a 5 faixas
amplas. A opção "prefiro falar sobre isso depois" fica, independente das faixas.

---

## Importante — melhora muito, mas não trava

| item | onde aparece | observação |
|---|---|---|
| **Número do CAU** | rodapé e bloco "Sobre" | selo de credibilidade forte para arquiteto. O campo existe e só renderiza preenchido. Não inventei número. |
| **Anos de carreira** | bloco de números, ao lado de "+1000 projetos" | o terceiro número está vazio |
| **Ano, metragem e cidade de cada projeto** | ficha técnica de cada página de projeto | sem isso a ficha fica pela metade |
| **Depoimentos reais** | seção de depoimentos | o destaque "Feedbacks" não abriu texto legível na coleta. Só entra texto real; nada genérico. |
| **Crédito dos fotógrafos** | rodapé e página de projeto | fotógrafo de arquitetura costuma exigir crédito em contrato. **Conferir antes de publicar.** |
| **Tempo de resposta por horário** | tela "Pedido pronto", depois do briefing | ex.: "respondo em até 2 h em dia útil, das 9h às 18h" |

---

## Decisões dela

- **"Damha IV" ou "Dahma IV"?** O destaque está escrito `Dahma IV`, mas o adesivo de
  localização dentro da própria story diz **Damha IV**, que é o nome real do condomínio. O site
  está usando `Damha IV`. Se estiver certo, vale corrigir o destaque também.
- **Versão em inglês em `/en`?** Ela já tem projeto nas Maldivas e diz "projetos
  internacionais" na bio. Se quiser captar fora do Brasil de verdade, vale. Fica de fora até
  ela confirmar.
- **Endereço e horário de atendimento** entram no rodapé e no schema `LocalBusiness` — o que
  ajuda no SEO local. Só se ela quiser divulgar.
- **Os 3 renders em alta** (1440×1800, projeto tropical com madeira ripada, palmeira, pedra e
  lareira externa): de qual projeto são? São o único material em alta que tenho.
- **Nota 5,0 no Google** — confirmar que é o perfil dela e que segue 5,0, para poder usar no
  `aggregateRating` do schema.

---

## Antes de publicar (sair do modo pré-site)

1. Trocar `NEXT_PUBLIC_PRESITE` para `false` — remove `noindex` e liga o analytics.
2. Conferir crédito dos fotógrafos.
3. Preencher o texto jurídico de `/privacidade` com o advogado dela.
4. Trocar o link da bio pelo deep link do briefing (passo a passo no `README.md`).
