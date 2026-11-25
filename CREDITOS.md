# Créditos e licenças

## Fotografia e vídeo

**Todo o material visual do site vem do perfil público
[@isajunqueira_arquitetura](https://www.instagram.com/isajunqueira_arquitetura/).**
Nada foi baixado de banco de imagem. Nenhuma foto de terceiro foi usada como se fosse
obra dela.

- **Nenhuma imagem de banco gratuito foi usada**, nem como textura. O plano B do
  briefing previa essa possibilidade; não foi preciso recorrer a ela.
- A única "textura" do site (`site/public/textura/luz-da-agua.*`) foi **gerada pelo
  próprio shader** do projeto, com `ferramentas/textura.mjs`. Não é foto de ninguém.
- **Áudio:** nenhum vídeo foi publicado no site. Os reels baixados ficaram só no
  acervo de trabalho (`entrada/`), e se algum for usado depois tem que sair com
  `ffmpeg -an` — há música de terceiro nos originais.
- **Crédito do fotógrafo: pendente.** Fotógrafo de arquitetura costuma exigir crédito
  em contrato. O campo `creditoFotografia` em `data/estudio.ts` está vazio e o rodapé
  só o renderiza quando preenchido. **Conferir com ela antes de publicar.**
  Ver `TODO-CLIENTE.md`.

### Imagens usadas hoje

Coletadas da **sessão logada** do Instagram, com autorização explícita do cliente, em
**1080×1920** — a resolução que o perfil anônimo não entrega.

| projeto | imagens | origem | atribuição |
|---|---|---|---|
| **Damha IV** | **6** | destaque "Dahma IV" | **confirmada** — vieram do destaque do próprio projeto |

Descartados na curadoria: 3 com texto promocional queimado, 3 prints de post ou de
modelo 3D com interface à mostra, 1 bastidor com pessoas identificáveis, e 4 com o
adesivo de localização em posição que o corte não resolvia.

**Duas marcas d'água, dois tratamentos diferentes:**

- A foto do Golden House trazia **`@isajunqueira_arquitetura @nakamura.arq`** queimado.
  Crédito a um segundo escritório: usá-la seria atribuir trabalho de terceiro.
  **Descartada.** Golden House ficou sem foto.
- As seis de Damha IV traziam o adesivo de localização **`Damha IV`** — tag dela, no
  projeto dela. Removido por **corte** acima do adesivo (`ferramentas/cortar.mjs`,
  de 13% a 28% do topo, medido foto a foto), e todas padronizadas em 1080×1400.
  Isso é retoque, não remoção de marca de terceiro.

Os 2 renders e as fotos de CasaCor que eu havia usado antes saíram do site — não havia
como afirmar de qual projeto eram. Ver `DECISOES.md`.

**Vídeo:** os stories em vídeo chegam ao navegador como `blob:` (MSE), sem URL direta,
então não foram baixados. É a principal pendência técnica do acervo.

---

## Tipografia

| fonte | uso | licença |
|---|---|---|
| **Gambetta** — variável 300–700, romano e itálico | títulos, monograma, assinatura | Fontshare Free License · Indian Type Foundry · [fontshare.com](https://www.fontshare.com/fonts/gambetta) |
| **General Sans** — variável 200–700 | interface e corpo | Fontshare Free License · Indian Type Foundry · [fontshare.com](https://www.fontshare.com/fonts/general-sans) |

Ambas são gratuitas para uso comercial e estão **self-hosted** em woff2 (subset latin)
em `site/public/fontes/`. Os `.ttf` em `fontes/` servem só para gerar os contornos da
marca; não vão ao ar.

---

## Marca

O monograma IJ, os três lockups e a assinatura foram **criados para este projeto**, a
partir dos contornos da Instrument Serif (I romano + J itálico). Entregues em
`marca/`, em contorno, sem dependência de fonte.

A Fontshare Free License permite uso comercial, inclusive em logotipo. Se ela já tiver uma marca gráfica
registrada, é só substituir — o site referencia tudo por `lib/marca.ts`.

---

## Bibliotecas

| | licença |
|---|---|
| Next.js, React | MIT |
| Tailwind CSS 4 | MIT |
| GSAP 3.15 (ScrollTrigger, SplitText, Flip, Observer) | desde a 3.13 todos os plugins são gratuitos sob a licença padrão GSAP, inclusive para uso comercial |
| Lenis | MIT |
| sharp, Playwright, opentype.js | Apache-2.0 / Apache-2.0 / MIT |

O efeito "Luz da água" é **código original** deste projeto
(`site/lib/luz-da-agua.js`), escrito do zero. Não veio de shader de prateleira.

---

## Componentes de terceiros

**Nenhum componente do 21st.dev foi instalado.** O MCP do 21st.dev (Magic) não estava
disponível nesta sessão. Os padrões que o briefing listou — background com shader,
marquee, text reveal, cursor customizado, galeria com drag, botão magnético, drawer —
foram escritos direto, com GSAP e CSS. Ver `DECISOES.md` para o porquê de cada um.
Consequência prática: não há dependência de biblioteca de UI, e nada tem cara de
componente de prateleira porque não é.
