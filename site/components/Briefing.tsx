'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { carregarGsap, semMovimento } from '@/lib/movimento';
import Link from 'next/link';
import { useBriefing } from './BriefingContexto';
import { estudio } from '@/data/estudio';
import { projetos } from '@/data/projetos';
import { faixas, fases, inicios, metragens, notaFaixa, tiposImovel, tipoDeeplink } from '@/data/briefing';
import { evento, submitLead } from '@/lib/presite';

type Resp = {
  objetivo?: string; local?: string; cidade?: string; pais?: string;
  imovel?: string; metragem?: string; fase?: string;
  inicio?: string; faixa?: string;
  nome?: string; whatsapp?: string; frase?: string; aceite?: boolean;
};

const CHAVE = 'ij-briefing';
const TOTAL = 5;

const rotuloDe = (lista: { id: string; rotulo: string }[], id?: string) =>
  lista.find((o) => o.id === id)?.rotulo ?? '';

/** Código curto para ela achar o pedido depois. Não identifica a pessoa. */
function refCurta() {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 4 }, () => a[Math.floor(Math.random() * a.length)]).join('');
}

export function Briefing() {
  const { aberto, fechar, tipoInicial } = useBriefing();
  const [passo, setPasso] = useState(1);
  const [r, setR] = useState<Resp>({});
  const [ref] = useState(refCurta);
  const [enviado, setEnviado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [aviso, setAviso] = useState('');

  const painel = useRef<HTMLDivElement>(null);
  const corpo = useRef<HTMLDivElement>(null);
  const primeiro = useRef<HTMLButtonElement>(null);

  // ---------- persistência (sessionStorage, com try/catch) ----------
  useEffect(() => {
    try {
      const salvo = sessionStorage.getItem(CHAVE);
      if (salvo) {
        const d = JSON.parse(salvo);
        setR(d.r || {});
        setPasso(Math.min(d.passo || 1, TOTAL));
      }
    } catch { /* modo privado, cota cheia: segue sem retomar */ }
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(CHAVE, JSON.stringify({ r, passo })); } catch { /* ok */ }
  }, [r, passo]);

  // tipo vindo do deep link já responde o passo 1
  useEffect(() => {
    if (!tipoInicial) return;
    const id = tipoDeeplink[tipoInicial] ?? tipoInicial;
    setR((v) => ({ ...v, objetivo: v.objetivo ?? id }));
  }, [tipoInicial]);

  // ---------- foco preso, ESC fecha ----------
  useEffect(() => {
    if (!aberto) return;
    const el = painel.current;
    if (!el) return;
    const antes = document.activeElement as HTMLElement | null;
    primeiro.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); fechar(); return; }
      if (e.key !== 'Tab') return;
      const foco = el.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!foco.length) return;
      const pri = foco[0], ult = foco[foco.length - 1];
      if (e.shiftKey && document.activeElement === pri) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); antes?.focus?.(); };
  }, [aberto, fechar]);

  // ---------- transição entre passos ----------
  useEffect(() => {
    if (!aberto || !corpo.current) return;
    const reduzido = semMovimento();
    let vivo = true;
    let ctx: { revert: () => void } | undefined;
    // o painel abre por ação da pessoa: aqui o GSAP já pode ser buscado sob demanda
    carregarGsap().then(({ gsap }) => {
      if (!vivo || !corpo.current) return;
      ctx = gsap.context(() => {
      if (reduzido) {
        gsap.fromTo(corpo.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
        return;
      }
      gsap.fromTo(corpo.current, { x: 28, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
      gsap.fromTo(
        corpo.current!.querySelectorAll('[data-opcao]'),
        { y: 14, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.04, ease: 'power3.out', delay: 0.08 }
      );
      }, corpo.current);
    });
    return () => { vivo = false; ctx?.revert(); };
  }, [passo, aberto, enviado]);

  useEffect(() => { if (aberto) evento({ nome: 'briefing_passo', passo }); }, [passo, aberto]);

  // ---------- validação por passo ----------
  const podeAvancar = useMemo(() => {
    switch (passo) {
      case 1: return !!r.objetivo;
      case 2: return !!r.local && (r.local !== 'brasil' || !!r.cidade?.trim()) && (r.local !== 'exterior' || !!r.pais?.trim());
      case 3: return !!r.imovel && !!r.metragem && !!r.fase;
      case 4: return !!r.inicio && !!r.faixa;
      case 5: return !!r.nome?.trim() && (r.whatsapp?.replace(/\D/g, '').length ?? 0) >= 10 && !!r.aceite;
      default: return false;
    }
  }, [passo, r]);

  // ---------- mensagem do WhatsApp ----------
  const mensagem = useMemo(() => {
    const onde = r.local === 'maringa' ? 'Maringá e região'
      : r.local === 'brasil' ? `${r.cidade || ''}, Brasil`
      : r.local === 'exterior' ? (r.pais || 'Fora do Brasil') : '';
    const imovel = [
      rotuloDe(tiposImovel, r.imovel),
      rotuloDe(metragens, r.metragem).replace('Até ', 'até ').replace('Acima de ', 'acima de '),
      rotuloDe(fases, r.fase).toLowerCase(),
    ].filter(Boolean).join(', ');

    const linhas = [
      'Olá, Isabela! Vim pelo site.',
      `*Quero:* ${rotuloDe([
        { id: 'arquitetura', rotulo: 'Projeto de arquitetura (construir)' },
        { id: 'reforma', rotulo: 'Reforma e interiores' },
        { id: 'interiores', rotulo: 'Interiores de imóvel novo' },
        { id: 'paisagismo', rotulo: 'Paisagismo' },
        { id: 'nao-sei', rotulo: 'Ainda não sei' },
      ], r.objetivo)}`,
      `*Onde:* ${onde}`,
      `*Imóvel:* ${imovel}`,
      `*Começar:* ${rotuloDe(inicios, r.inicio)}`,
      `*Investimento:* ${rotuloDe(faixas, r.faixa)}`,
      `*Nome:* ${r.nome?.trim() || ''}`,
    ];
    if (r.frase?.trim()) linhas.push(`*Em uma frase:* ${r.frase.trim()}`);
    linhas.push(`Ref. site #${ref}`);
    return linhas.join('\n');
  }, [r, ref]);

  const linkWhats = `https://wa.me/${estudio.whatsapp.numero}?text=${encodeURIComponent(mensagem)}`;

  const enviar = useCallback(() => {
    evento({ nome: 'briefing_concluido', tipo: r.objetivo || '', local: r.local || '', faixa: r.faixa || '' });
    evento({ nome: 'whatsapp_clique', secao: 'briefing' });
    void submitLead({ ref }); // ponto de extensão para CRM — hoje não envia nada
    window.open(linkWhats, '_blank', 'noopener,noreferrer');
    setEnviado(true);
    setAviso('Pedido montado. O WhatsApp deve ter aberto em outra aba.');
  }, [linkWhats, r, ref]);

  /** Três projetos que combinam com o que a pessoa marcou. Mantém ela no site. */
  const sugestoes = useMemo(() => {
    const quer = r.imovel === 'apartamento' ? 'apartamento'
      : r.imovel === 'praia-campo' ? 'praia'
      : r.local === 'exterior' ? 'internacional' : 'casa';
    const combinam = projetos.filter((p) => p.tipo === quer);
    return [...combinam, ...projetos.filter((p) => !combinam.includes(p))].slice(0, 3);
  }, [r.imovel, r.local]);

  if (!aberto) return null;

  const progresso = enviado ? 1 : (passo - 1) / TOTAL;

  return (
    <div className="fixed inset-0 z-[80]" role="presentation">
      <button
        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
        onClick={fechar}
        aria-label="Fechar o briefing"
        tabIndex={-1}
      />
      <div
        ref={painel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="briefing-titulo"
        className="absolute inset-x-0 bottom-0 top-0 ml-auto flex w-full flex-col bg-[var(--color-mata-900)] sm:top-0 md:w-[540px] md:border-l md:border-[color-mix(in_srgb,var(--color-travertino-200)_18%,transparent)]"
      >
        {/* barra de progresso em madeira */}
        <div className="h-[2px] w-full bg-[color-mix(in_srgb,var(--color-travertino-200)_14%,transparent)]">
          <div
            className="h-full bg-[var(--color-madeira-500)] transition-[width] duration-500 ease-out"
            style={{ width: `${progresso * 100}%` }}
          />
        </div>

        <header className="flex items-center justify-between px-6 pt-5 pb-2 md:px-8">
          <p className="eyebrow text-[var(--color-pedra-400)]">
            {enviado ? 'Pedido pronto' : `Passo ${passo} de ${TOTAL}`}
          </p>
          <button
            onClick={fechar}
            className="-mr-2 flex h-12 w-12 items-center justify-center text-[var(--color-travertino-200)] transition-opacity hover:opacity-70"
            aria-label="Fechar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          </button>
        </header>

        <div aria-live="polite" className="sr-only">{aviso}</div>

        <div ref={corpo} className="flex-1 overflow-y-auto px-6 pb-6 md:px-8">
          {enviado ? (
            <TelaPronto
              link={linkWhats}
              mensagem={mensagem}
              copiado={copiado}
              aoCopiar={async () => {
                try {
                  await navigator.clipboard.writeText(mensagem);
                  setCopiado(true); setAviso('Mensagem copiada.');
                  setTimeout(() => setCopiado(false), 2600);
                } catch { setAviso('Não consegui copiar. Selecione o texto e copie à mão.'); }
              }}
              sugestoes={sugestoes}
              aoFechar={fechar}
            />
          ) : (
            <>
              <h2 id="briefing-titulo" className="mt-3 text-t3 text-[var(--color-osso)]" style={{ fontFamily: 'var(--font-serif)' }}>
                {['O que você quer fazer?', 'Onde é?', 'Sobre o imóvel', 'Prazo e investimento', 'Contato'][passo - 1]}
              </h2>

              <div className="mt-6 space-y-7">
                {passo === 1 && (
                  <Grupo
                    legenda="O que você quer fazer?"
                    opcoes={[
                      { id: 'arquitetura', rotulo: 'Projeto de arquitetura (construir)' },
                      { id: 'reforma', rotulo: 'Reforma e interiores' },
                      { id: 'interiores', rotulo: 'Interiores de imóvel novo' },
                      { id: 'paisagismo', rotulo: 'Paisagismo' },
                      { id: 'nao-sei', rotulo: 'Ainda não sei' },
                    ]}
                    valor={r.objetivo}
                    aoEscolher={(v) => setR({ ...r, objetivo: v })}
                    refPrimeiro={primeiro}
                  />
                )}

                {passo === 2 && (
                  <>
                    <Grupo
                      legenda="Onde é?"
                      opcoes={[
                        { id: 'maringa', rotulo: 'Maringá e região' },
                        { id: 'brasil', rotulo: 'Outra cidade do Brasil' },
                        { id: 'exterior', rotulo: 'Fora do Brasil' },
                      ]}
                      valor={r.local}
                      aoEscolher={(v) => setR({ ...r, local: v })}
                      refPrimeiro={primeiro}
                    />
                    {r.local === 'brasil' && (
                      <Campo rotulo="Qual cidade?" valor={r.cidade || ''} aoMudar={(v) => setR({ ...r, cidade: v })} />
                    )}
                    {r.local === 'exterior' && (
                      <Campo rotulo="Qual país?" valor={r.pais || ''} aoMudar={(v) => setR({ ...r, pais: v })} />
                    )}
                  </>
                )}

                {passo === 3 && (
                  <>
                    <Grupo legenda="Tipo de imóvel" opcoes={tiposImovel} valor={r.imovel}
                      aoEscolher={(v) => setR({ ...r, imovel: v })} refPrimeiro={primeiro} />
                    <Grupo legenda="Metragem aproximada" opcoes={metragens} valor={r.metragem}
                      aoEscolher={(v) => setR({ ...r, metragem: v })} />
                    <Grupo legenda="Em que fase está" opcoes={fases} valor={r.fase}
                      aoEscolher={(v) => setR({ ...r, fase: v })} />
                  </>
                )}

                {passo === 4 && (
                  <>
                    <Grupo legenda="Quando quer começar" opcoes={inicios} valor={r.inicio}
                      aoEscolher={(v) => setR({ ...r, inicio: v })} refPrimeiro={primeiro} />
                    <Grupo legenda="Faixa de investimento em obra" nota={notaFaixa} opcoes={faixas} valor={r.faixa}
                      aoEscolher={(v) => setR({ ...r, faixa: v })} />
                  </>
                )}

                {passo === 5 && (
                  <>
                    <Campo rotulo="Seu nome" valor={r.nome || ''} aoMudar={(v) => setR({ ...r, nome: v })} autoFoco />
                    <Campo rotulo="WhatsApp com DDD" valor={r.whatsapp || ''} tipo="tel"
                      aoMudar={(v) => setR({ ...r, whatsapp: v })} />
                    <div>
                      <label className="eyebrow block text-[var(--color-pedra-400)]" htmlFor="frase">
                        Conte em uma frase o que você imagina <span className="normal-case tracking-normal opacity-70">(opcional)</span>
                      </label>
                      <textarea
                        id="frase" maxLength={280} rows={3} value={r.frase || ''}
                        onChange={(e) => setR({ ...r, frase: e.target.value })}
                        className="mt-2 w-full resize-none border border-[color-mix(in_srgb,var(--color-travertino-200)_22%,transparent)] bg-transparent px-4 py-3 text-[var(--color-travertino-200)] outline-none focus-visible:border-[var(--color-madeira-300)]"
                        style={{ borderRadius: 'var(--radius-md)' }}
                      />
                      <p className="mt-1 text-right text-[11px] text-[var(--color-pedra-400)]">{(r.frase || '').length}/280</p>
                    </div>

                    <label className="flex min-h-12 cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-[var(--color-pedra-400)]">
                      <input
                        type="checkbox" checked={!!r.aceite}
                        onChange={(e) => setR({ ...r, aceite: e.target.checked })}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-madeira-500)]"
                      />
                      <span>{estudio.legal.aceiteBriefing}</span>
                    </label>

                    <details className="border-t border-[color-mix(in_srgb,var(--color-travertino-200)_14%,transparent)] pt-4">
                      <summary className="eyebrow cursor-pointer list-none text-[var(--color-madeira-300)]">
                        Veja o que vamos enviar
                      </summary>
                      <pre className="mt-3 overflow-x-auto bg-[var(--color-mata-950)] p-4 text-[12px] leading-relaxed whitespace-pre-wrap text-[var(--color-travertino-200)]" style={{ borderRadius: 'var(--radius-md)' }}>
                        {mensagem}
                      </pre>
                    </details>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {!enviado && (
          <footer className="flex items-center justify-between gap-3 border-t border-[color-mix(in_srgb,var(--color-travertino-200)_14%,transparent)] px-6 py-4 md:px-8">
            <button
              onClick={() => setPasso((p) => Math.max(1, p - 1))}
              disabled={passo === 1}
              className="eyebrow min-h-12 px-2 text-[var(--color-pedra-400)] transition-opacity hover:opacity-70 disabled:pointer-events-none disabled:opacity-25"
            >
              Voltar
            </button>
            <button
              onClick={() => (passo === TOTAL ? enviar() : setPasso((p) => p + 1))}
              disabled={!podeAvancar}
              className="eyebrow min-h-12 bg-[var(--color-madeira-500)] px-7 text-[var(--color-osso)] transition-colors hover:bg-[var(--color-madeira-300)] hover:text-[var(--color-tinta)] disabled:pointer-events-none disabled:opacity-30"
              style={{ borderRadius: 999 }}
            >
              {passo === TOTAL ? 'Enviar no WhatsApp' : 'Continuar'}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Grupo({
  legenda, opcoes, valor, aoEscolher, nota, refPrimeiro,
}: {
  legenda: string;
  opcoes: { id: string; rotulo: string }[];
  valor?: string;
  aoEscolher: (v: string) => void;
  nota?: string;
  refPrimeiro?: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <fieldset>
      <legend className="eyebrow text-[var(--color-pedra-400)]">{legenda}</legend>
      {nota && <p className="mt-1 mb-1 text-[12px] leading-snug text-[var(--color-pedra-400)] opacity-80">{nota}</p>}
      <div className="mt-3 flex flex-col gap-2">
        {opcoes.map((o, i) => {
          const ativo = valor === o.id;
          return (
            <button
              key={o.id}
              data-opcao
              ref={i === 0 ? refPrimeiro : undefined}
              type="button"
              aria-pressed={ativo}
              onClick={() => aoEscolher(o.id)}
              className={`min-h-12 border px-4 py-3 text-left text-[15px] transition-colors ${
                ativo
                  ? 'border-[var(--color-madeira-300)] bg-[color-mix(in_srgb,var(--color-madeira-500)_16%,transparent)] text-[var(--color-osso)]'
                  : 'border-[color-mix(in_srgb,var(--color-travertino-200)_18%,transparent)] text-[var(--color-travertino-200)] hover:border-[color-mix(in_srgb,var(--color-travertino-200)_42%,transparent)]'
              }`}
              style={{ borderRadius: 'var(--radius-md)' }}
            >
              {o.rotulo}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function Campo({
  rotulo, valor, aoMudar, tipo = 'text', autoFoco = false,
}: { rotulo: string; valor: string; aoMudar: (v: string) => void; tipo?: string; autoFoco?: boolean }) {
  const id = rotulo.toLowerCase().replace(/\W+/g, '-');
  return (
    <div data-opcao>
      <label htmlFor={id} className="eyebrow block text-[var(--color-pedra-400)]">{rotulo}</label>
      <input
        id={id} type={tipo} value={valor} autoFocus={autoFoco}
        onChange={(e) => aoMudar(e.target.value)}
        className="mt-2 min-h-12 w-full border border-[color-mix(in_srgb,var(--color-travertino-200)_22%,transparent)] bg-transparent px-4 text-[var(--color-travertino-200)] outline-none focus-visible:border-[var(--color-madeira-300)]"
        style={{ borderRadius: 'var(--radius-md)' }}
      />
    </div>
  );
}

function TelaPronto({
  link, mensagem, copiado, aoCopiar, sugestoes, aoFechar,
}: {
  link: string; mensagem: string; copiado: boolean; aoCopiar: () => void;
  sugestoes: { slug: string; nome: string; resumo: string }[]; aoFechar: () => void;
}) {
  return (
    <div className="pt-3">
      <h2 id="briefing-titulo" className="text-t3 text-[var(--color-osso)]" style={{ fontFamily: 'var(--font-serif)' }}>
        Pedido pronto
      </h2>
      <p className="mt-3 max-w-[46ch] text-[var(--color-travertino-200)]">
        Seu pedido já está montado e organizado. É só enviar.
        {estudio.tempoResposta ? ` ${estudio.tempoResposta}` : ''}
      </p>

      <div className="mt-7 border border-[color-mix(in_srgb,var(--color-travertino-200)_18%,transparent)] p-5" style={{ borderRadius: 'var(--radius-md)' }}>
        <p className="eyebrow text-[var(--color-pedra-400)]">Não abriu o WhatsApp?</p>
        <a
          href={link} target="_blank" rel="noopener noreferrer"
          className="mt-3 inline-flex min-h-12 items-center bg-[var(--color-madeira-500)] px-6 text-[var(--color-osso)] eyebrow transition-colors hover:bg-[var(--color-madeira-300)] hover:text-[var(--color-tinta)]"
          style={{ borderRadius: 999 }}
        >
          Abrir a conversa
        </a>
        <p className="mt-4 text-[13px] text-[var(--color-pedra-400)]">
          Ou chame direto no{' '}
          <a href={link} className="text-[var(--color-madeira-300)] underline underline-offset-4" target="_blank" rel="noopener noreferrer">
            {estudio.whatsapp.exibicao}
          </a>
        </p>
        <button
          onClick={aoCopiar}
          className="eyebrow mt-4 min-h-12 border border-[color-mix(in_srgb,var(--color-travertino-200)_22%,transparent)] px-5 text-[var(--color-travertino-200)] transition-colors hover:border-[var(--color-madeira-300)]"
          style={{ borderRadius: 999 }}
        >
          {copiado ? 'Copiado' : 'Copiar a mensagem'}
        </button>
      </div>

      <div className="mt-9">
        <p className="eyebrow text-[var(--color-pedra-400)]">Enquanto isso</p>
        <ul className="mt-3 flex flex-col">
          {sugestoes.map((p) => (
            <li key={p.slug}>
              <Link
                prefetch={false}
                href={`/projetos/${p.slug}/`}
                onClick={aoFechar}
                className="group flex min-h-14 items-baseline justify-between gap-4 border-b border-[color-mix(in_srgb,var(--color-travertino-200)_12%,transparent)] py-3"
              >
                <span className="text-t3 leading-tight text-[var(--color-osso)] transition-colors group-hover:text-[var(--color-madeira-300)]" style={{ fontFamily: 'var(--font-serif)' }}>
                  {p.nome}
                </span>
                <span className="shrink-0 text-[12px] text-[var(--color-pedra-400)]">Ver projeto</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 text-[12px] leading-relaxed text-[var(--color-pedra-400)] opacity-80">
        Nada do que você escreveu foi para nenhum servidor. A mensagem saiu do seu navegador
        direto para o WhatsApp.
      </p>
      <noscript>{mensagem}</noscript>
    </div>
  );
}
