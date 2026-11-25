'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { evento } from '@/lib/presite';

type Ctx = {
  aberto: boolean;
  abrir: (origem: string, tipoInicial?: string | null) => void;
  fechar: () => void;
  tipoInicial: string | null;
};

const BriefingCtx = createContext<Ctx | null>(null);

export function useBriefing() {
  const c = useContext(BriefingCtx);
  if (!c) throw new Error('useBriefing precisa do BriefingProvider');
  return c;
}

export function BriefingProvider({ children }: { children: React.ReactNode }) {
  const [aberto, setAberto] = useState(false);
  const [tipoInicial, setTipoInicial] = useState<string | null>(null);

  const abrir = useCallback((origem: string, tipo: string | null = null) => {
    setTipoInicial(tipo);
    setAberto(true);
    evento({ nome: 'briefing_aberto', origem });
  }, []);

  const fechar = useCallback(() => setAberto(false), []);

  // Deep link: /?briefing=1&tipo=residencial|interiores|paisagismo&utm_source=instagram
  // É para onde o link da bio deve passar a apontar. Ver README.md.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('briefing') === '1') {
      abrir(p.get('utm_source') ? `deeplink:${p.get('utm_source')}` : 'deeplink', p.get('tipo'));
    }
  }, [abrir]);

  // trava o scroll do fundo enquanto o painel está aberto
  useEffect(() => {
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (aberto) { lenis?.stop(); document.body.style.overflow = 'hidden'; }
    else { lenis?.start(); document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [aberto]);

  const v = useMemo(() => ({ aberto, abrir, fechar, tipoInicial }), [aberto, abrir, fechar, tipoInicial]);
  return <BriefingCtx.Provider value={v}>{children}</BriefingCtx.Provider>;
}
